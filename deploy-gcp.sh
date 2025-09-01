#!/bin/bash

# GCP Cloud Run Deployment Script for Timeline App
# This script handles deployment, management, and monitoring of the Timeline App on Google Cloud Platform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default Configuration
PROJECT_ID="${GCP_PROJECT_ID:-timeline-app-dev}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="${GCP_SERVICE_NAME:-timeline-app}"
ARTIFACT_REGISTRY="${ARTIFACT_REGISTRY:-us-central1-docker.pkg.dev}"
REPOSITORY_NAME="timeline-app"
IMAGE_NAME="timeline-app"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if gcloud is installed and authenticated
check_gcloud() {
    log_info "Checking gcloud configuration..."
    
    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI is not installed. Please install Google Cloud SDK."
        exit 1
    fi
    
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        log_error "Not authenticated with gcloud. Please run: gcloud auth login"
        exit 1
    fi
    
    # Set project if provided
    if [ -n "$PROJECT_ID" ]; then
        gcloud config set project "$PROJECT_ID"
        log_success "Project set to: $PROJECT_ID"
    fi
    
    CURRENT_PROJECT=$(gcloud config get-value project)
    log_info "Current project: $CURRENT_PROJECT"
}

# Setup GCP infrastructure
setup_infrastructure() {
    log_info "Setting up GCP infrastructure..."
    
    # Enable required APIs
    log_info "Enabling required APIs..."
    gcloud services enable run.googleapis.com
    gcloud services enable artifactregistry.googleapis.com
    gcloud services enable secretmanager.googleapis.com
    gcloud services enable cloudbuild.googleapis.com
    
    # Create Artifact Registry repository
    log_info "Creating Artifact Registry repository..."
    gcloud artifacts repositories create "$REPOSITORY_NAME" \
        --repository-format=docker \
        --location="$REGION" \
        --description="Timeline App Docker images" || log_warning "Repository may already exist"
    
    # Configure Docker for Artifact Registry
    gcloud auth configure-docker "$ARTIFACT_REGISTRY"
    
    log_success "Infrastructure setup completed"
}

# Create required secrets
setup_secrets() {
    log_info "Setting up secrets in Secret Manager..."
    
    if [ -z "$SQLITE_URL" ]; then
        log_error "SQLITE_URL environment variable is required"
        exit 1
    fi
    
    # Create SQLITE_URL secret
    echo "$SQLITE_URL" | gcloud secrets create SQLITE_URL --data-file=- || \
    echo "$SQLITE_URL" | gcloud secrets versions add SQLITE_URL --data-file=-
    
    log_success "Secrets configured"
}

# Build and push Docker image
build_and_push() {
    log_info "Building and pushing Docker image..."
    
    IMAGE_TAG="${ARTIFACT_REGISTRY}/${PROJECT_ID}/${REPOSITORY_NAME}/${IMAGE_NAME}:$(date +%Y%m%d-%H%M%S)"
    LATEST_TAG="${ARTIFACT_REGISTRY}/${PROJECT_ID}/${REPOSITORY_NAME}/${IMAGE_NAME}:latest"
    
    # Build using Cloud Build for better performance
    log_info "Building with Cloud Build..."
    gcloud builds submit --tag "$IMAGE_TAG" .
    gcloud builds submit --tag "$LATEST_TAG" .
    
    echo "IMAGE_TAG=$IMAGE_TAG" > .env.deploy
    echo "LATEST_TAG=$LATEST_TAG" >> .env.deploy
    
    log_success "Image built and pushed: $IMAGE_TAG"
}

# Deploy to Cloud Run
deploy() {
    log_info "Deploying to Cloud Run..."
    
    if [ -f .env.deploy ]; then
        source .env.deploy
    fi
    
    if [ -z "$IMAGE_TAG" ]; then
        IMAGE_TAG="$LATEST_TAG"
    fi
    
    gcloud run deploy "$SERVICE_NAME" \
        --image="$IMAGE_TAG" \
        --region="$REGION" \
        --platform=managed \
        --allow-unauthenticated \
        --port=3000 \
        --memory=512Mi \
        --cpu=1 \
        --max-instances=10 \
        --min-instances=0 \
        --timeout=300 \
        --set-env-vars="NODE_ENV=development,PORT=3000" \
        --set-secrets="SQLITE_URL=SQLITE_URL:latest" \
        --tag=dev
    
    SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
        --region="$REGION" \
        --format='value(status.url)')
    
    log_success "Service deployed successfully!"
    log_info "Service URL: $SERVICE_URL"
    
    echo "SERVICE_URL=$SERVICE_URL" >> .env.deploy
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    if [ -f .env.deploy ]; then
        source .env.deploy
    fi
    
    if [ -z "$SERVICE_URL" ]; then
        SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
            --region="$REGION" \
            --format='value(status.url)')
    fi
    
    if [ -z "$SERVICE_URL" ]; then
        log_error "Could not determine service URL"
        exit 1
    fi
    
    log_info "Testing service at: $SERVICE_URL"
    
    # Wait for service to be ready
    sleep 10
    
    # Test API endpoint
    if curl -f "$SERVICE_URL/api/data" > /dev/null 2>&1; then
        log_success "API health check passed"
    else
        log_error "API health check failed"
        return 1
    fi
    
    # Test main page
    if curl -f "$SERVICE_URL/" > /dev/null 2>&1; then
        log_success "Main page health check passed"
    else
        log_warning "Main page health check failed"
    fi
    
    # Performance test
    log_info "Running performance test..."
    RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$SERVICE_URL/api/data")
    log_info "Response time: ${RESPONSE_TIME}s"
    
    if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
        log_success "Performance test passed"
    else
        log_warning "Response time is slower than expected"
    fi
}

# Get service information
get_info() {
    log_info "Getting service information..."
    
    echo "=== Cloud Run Service Info ==="
    gcloud run services describe "$SERVICE_NAME" \
        --region="$REGION" \
        --format="table(metadata.name,status.url,status.latestReadyRevisionName,status.traffic[].revisionName,status.traffic[].percent)"
    
    echo ""
    echo "=== Recent Revisions ==="
    gcloud run revisions list \
        --service="$SERVICE_NAME" \
        --region="$REGION" \
        --limit=5 \
        --format="table(metadata.name,status.conditions[0].lastTransitionTime,spec.containers[0].image)"
    
    echo ""
    echo "=== Service URL ==="
    SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
        --region="$REGION" \
        --format='value(status.url)')
    echo "$SERVICE_URL"
}

# View logs
view_logs() {
    log_info "Viewing Cloud Run logs..."
    
    gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" \
        --limit=50 \
        --format="table(timestamp,severity,textPayload)" \
        --sort-by="~timestamp"
}

# Scale service
scale() {
    local min_instances="${1:-0}"
    local max_instances="${2:-10}"
    
    log_info "Scaling service: min=$min_instances, max=$max_instances"
    
    gcloud run services update "$SERVICE_NAME" \
        --region="$REGION" \
        --min-instances="$min_instances" \
        --max-instances="$max_instances"
        
    log_success "Service scaled successfully"
}

# Delete service and resources
cleanup() {
    log_warning "This will delete the Cloud Run service and related resources"
    read -p "Are you sure? (type 'yes' to confirm): " confirm
    
    if [ "$confirm" = "yes" ]; then
        log_info "Deleting Cloud Run service..."
        gcloud run services delete "$SERVICE_NAME" --region="$REGION" --quiet || true
        
        log_info "Deleting container images..."
        gcloud artifacts docker images delete \
            "$ARTIFACT_REGISTRY/$PROJECT_ID/$REPOSITORY_NAME/$IMAGE_NAME" \
            --delete-tags --quiet || true
            
        log_success "Cleanup completed"
    else
        log_info "Cleanup cancelled"
    fi
}

# Full deployment pipeline
full_deploy() {
    log_info "Starting full deployment pipeline..."
    
    check_gcloud
    setup_infrastructure
    setup_secrets
    build_and_push
    deploy
    health_check
    get_info
    
    log_success "Full deployment completed successfully!"
}

# Script usage
usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup           - Setup GCP infrastructure"
    echo "  secrets         - Configure secrets"
    echo "  build           - Build and push Docker image"
    echo "  deploy          - Deploy to Cloud Run"
    echo "  full-deploy     - Complete deployment pipeline"
    echo "  health-check    - Check service health"
    echo "  info            - Get service information"
    echo "  logs            - View service logs"
    echo "  scale [min max] - Scale service instances"
    echo "  cleanup         - Delete service and resources"
    echo ""
    echo "Environment variables:"
    echo "  GCP_PROJECT_ID  - Google Cloud project ID"
    echo "  GCP_REGION      - Google Cloud region"
    echo "  GCP_SERVICE_NAME - Cloud Run service name"
    echo "  SQLITE_URL      - Database connection string"
}

# Main script logic
case "$1" in
    setup)
        check_gcloud
        setup_infrastructure
        ;;
    secrets)
        check_gcloud
        setup_secrets
        ;;
    build)
        check_gcloud
        build_and_push
        ;;
    deploy)
        check_gcloud
        deploy
        ;;
    full-deploy)
        full_deploy
        ;;
    health-check)
        health_check
        ;;
    info)
        get_info
        ;;
    logs)
        view_logs
        ;;
    scale)
        check_gcloud
        scale "$2" "$3"
        ;;
    cleanup)
        check_gcloud
        cleanup
        ;;
    *)
        usage
        exit 1
        ;;
esac
