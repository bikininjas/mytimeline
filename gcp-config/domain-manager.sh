#!/bin/bash

# Domain Management Script for Timeline App
# Handles domain setup, verification, and management for Google Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default configuration
DEFAULT_DOMAIN="timeline.bikininjas.fr"
DEFAULT_REGION="europe-west9"
DEFAULT_SERVICE="timeline-app"

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

# Usage function
usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  verify-dns       Verify DNS configuration"
    echo "  create-mapping   Create domain mapping"
    echo "  check-status     Check domain mapping status"
    echo "  setup-complete   Complete domain setup (verify + create)"
    echo "  delete-mapping   Delete domain mapping"
    echo ""
    echo "Options:"
    echo "  -d, --domain     Domain name (default: $DEFAULT_DOMAIN)"
    echo "  -r, --region     GCP region (default: $DEFAULT_REGION)"
    echo "  -s, --service    Cloud Run service name (default: $DEFAULT_SERVICE)"
    echo "  -p, --project    GCP project ID (required)"
    echo "  -f, --force      Force recreate domain mapping"
    echo "  -h, --help       Show this help"
    echo ""
    echo "Environment variables:"
    echo "  PROJECT_ID       GCP project ID"
    echo "  DOMAIN_NAME      Domain name to configure"
    echo "  REGION           GCP region"
    echo "  SERVICE_NAME     Cloud Run service name"
    echo ""
    echo "Examples:"
    echo "  $0 verify-dns -d timeline.bikininjas.fr"
    echo "  $0 setup-complete -p my-project-id"
    echo "  $0 check-status"
}

# Parse command line arguments
COMMAND=""
DOMAIN="${DOMAIN_NAME:-$DEFAULT_DOMAIN}"
REGION="${REGION:-$DEFAULT_REGION}"
SERVICE="${SERVICE_NAME:-$DEFAULT_SERVICE}"
PROJECT_ID="${PROJECT_ID:-}"
FORCE_RECREATE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        verify-dns|create-mapping|check-status|setup-complete|delete-mapping)
            COMMAND="$1"
            shift
            ;;
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -s|--service)
            SERVICE="$2"
            shift 2
            ;;
        -p|--project)
            PROJECT_ID="$2"
            shift 2
            ;;
        -f|--force)
            FORCE_RECREATE=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Validate required parameters
if [ -z "$COMMAND" ]; then
    log_error "Command is required"
    usage
    exit 1
fi

if [ -z "$PROJECT_ID" ]; then
    log_error "PROJECT_ID is required (use -p option or set PROJECT_ID environment variable)"
    exit 1
fi

# Verify DNS configuration
verify_dns() {
    log_info "Verifying DNS configuration for $DOMAIN..."
    
    if nslookup "$DOMAIN" | grep -q "ghs.googlehosted.com"; then
        log_success "DNS is properly configured"
        return 0
    else
        log_warning "DNS not configured or not propagated yet"
        log_info "Required DNS configuration:"
        echo "  Type: CNAME"
        echo "  Host: $(echo "$DOMAIN" | cut -d'.' -f1)"
        echo "  Target: ghs.googlehosted.com."
        echo "  TTL: 300"
        return 1
    fi
}

# Check if Cloud Run service exists
check_service() {
    log_info "Checking if Cloud Run service '$SERVICE' exists..."
    
    if gcloud run services describe "$SERVICE" --region="$REGION" --project="$PROJECT_ID" --quiet 2>/dev/null; then
        log_success "Cloud Run service '$SERVICE' exists"
        return 0
    else
        log_error "Cloud Run service '$SERVICE' not found in region '$REGION'"
        log_info "Please deploy the Timeline App first"
        return 1
    fi
}

# Create domain mapping
create_mapping() {
    log_info "Creating domain mapping for $DOMAIN..."
    
    # Check if mapping already exists
    if gcloud run domain-mappings describe "$DOMAIN" --region="$REGION" --project="$PROJECT_ID" --quiet 2>/dev/null; then
        if [ "$FORCE_RECREATE" = true ]; then
            log_warning "Domain mapping exists, deleting and recreating..."
            gcloud run domain-mappings delete "$DOMAIN" --region="$REGION" --project="$PROJECT_ID" --quiet
        else
            log_warning "Domain mapping already exists for $DOMAIN"
            log_info "Use --force to recreate"
            return 0
        fi
    fi
    
    # Create the mapping
    if gcloud run domain-mappings create \
        --service "$SERVICE" \
        --domain "$DOMAIN" \
        --region "$REGION" \
        --project "$PROJECT_ID"; then
        log_success "Domain mapping created successfully"
        return 0
    else
        log_error "Failed to create domain mapping"
        return 1
    fi
}

# Check domain mapping status
check_status() {
    log_info "Checking domain mapping status for $DOMAIN..."
    
    if gcloud run domain-mappings describe "$DOMAIN" --region="$REGION" --project="$PROJECT_ID" --quiet 2>/dev/null; then
        gcloud run domain-mappings describe "$DOMAIN" \
            --region="$REGION" \
            --project="$PROJECT_ID" \
            --format="table(
                metadata.name:label='DOMAIN',
                status.conditions[0].type:label='STATUS',
                status.conditions[0].status:label='READY',
                status.url:label='URL'
            )"
        
        # Get certificate status
        CERT_STATUS=$(gcloud run domain-mappings describe "$DOMAIN" \
            --region="$REGION" \
            --project="$PROJECT_ID" \
            --format="value(status.conditions[0].status)")
        
        if [ "$CERT_STATUS" = "True" ]; then
            log_success "SSL certificate is ready"
        else
            log_warning "SSL certificate is still provisioning (can take 15min-24hrs)"
        fi
        
        return 0
    else
        log_warning "No domain mapping found for $DOMAIN"
        return 1
    fi
}

# Delete domain mapping
delete_mapping() {
    log_info "Deleting domain mapping for $DOMAIN..."
    
    if gcloud run domain-mappings describe "$DOMAIN" --region="$REGION" --project="$PROJECT_ID" --quiet 2>/dev/null; then
        gcloud run domain-mappings delete "$DOMAIN" --region="$REGION" --project="$PROJECT_ID" --quiet
        log_success "Domain mapping deleted"
    else
        log_warning "No domain mapping found for $DOMAIN"
    fi
}

# Test domain access
test_domain() {
    log_info "Testing domain access for $DOMAIN..."
    
    # Test HTTP redirect
    log_info "Testing HTTP redirect..."
    if curl -s -I "http://$DOMAIN" | grep -q "301\|302"; then
        log_success "HTTP correctly redirects to HTTPS"
    else
        log_warning "HTTP redirect not yet active"
    fi
    
    # Test HTTPS access
    log_info "Testing HTTPS access..."
    if curl -s -I "https://$DOMAIN" | grep -q "200"; then
        log_success "HTTPS access working!"
        log_success "🎉 Your Timeline App is available at: https://$DOMAIN"
    else
        log_warning "HTTPS not yet available (SSL certificate may still be provisioning)"
    fi
}

# Complete setup
setup_complete() {
    log_info "Starting complete domain setup for $DOMAIN..."
    
    # Check service exists
    check_service || exit 1
    
    # Verify DNS
    if ! verify_dns; then
        log_error "DNS verification failed. Please configure DNS first."
        exit 1
    fi
    
    # Create mapping
    create_mapping || exit 1
    
    # Check status
    check_status
    
    # Test access
    test_domain
    
    log_success "Domain setup completed!"
}

# Main execution
case "$COMMAND" in
    verify-dns)
        verify_dns
        ;;
    create-mapping)
        check_service || exit 1
        create_mapping
        ;;
    check-status)
        check_status
        ;;
    setup-complete)
        setup_complete
        ;;
    delete-mapping)
        delete_mapping
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        usage
        exit 1
        ;;
esac
