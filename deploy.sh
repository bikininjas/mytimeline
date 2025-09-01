#!/bin/bash

# Timeline App Deployment Script
# This script can be used for automated deployment in CI/CD pipelines

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="timeline-app"
DEPLOY_USER="deploy"
DEPLOY_HOST=""
DEPLOY_PATH="/var/www/timeline-app"
SERVICE_NAME="timeline-app"
BACKUP_DIR="/var/backups/timeline-app"

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

# Check if required environment variables are set
check_environment() {
    log_info "Checking environment variables..."
    
    if [ -z "$DEPLOY_HOST" ]; then
        log_error "DEPLOY_HOST environment variable is not set"
        exit 1
    fi
    
    if [ -z "$SQLITE_URL" ]; then
        log_warning "SQLITE_URL is not set. Make sure it's configured on the target server."
    fi
    
    log_success "Environment check completed"
}

# Create backup of current deployment
create_backup() {
    log_info "Creating backup of current deployment..."
    
    BACKUP_NAME="${APP_NAME}-$(date +%Y%m%d-%H%M%S)"
    
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "
        sudo mkdir -p ${BACKUP_DIR}
        if [ -d ${DEPLOY_PATH} ]; then
            sudo cp -r ${DEPLOY_PATH} ${BACKUP_DIR}/${BACKUP_NAME}
            echo 'Backup created: ${BACKUP_DIR}/${BACKUP_NAME}'
        else
            echo 'No existing deployment found to backup'
        fi
    "
    
    log_success "Backup completed"
}

# Deploy application files
deploy_files() {
    log_info "Deploying application files..."
    
    # Create deployment directory
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "sudo mkdir -p ${DEPLOY_PATH}"
    
    # Copy application files
    rsync -avz --exclude='.git' --exclude='node_modules' --exclude='*.log' --exclude='.env' \
          ./ ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/
    
    log_success "Files deployed successfully"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "
        cd ${DEPLOY_PATH}
        bun install --frozen-lockfile --production
    "
    
    log_success "Dependencies installed"
}

# Update systemd service
setup_service() {
    log_info "Setting up systemd service..."
    
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "
        sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null <<EOF
[Unit]
Description=Timeline App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=${DEPLOY_PATH}
ExecStart=/usr/local/bin/bun start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=${DEPLOY_PATH}/.env

[Install]
WantedBy=multi-user.target
EOF

        sudo systemctl daemon-reload
        sudo systemctl enable ${SERVICE_NAME}
    "
    
    log_success "Service configured"
}

# Restart application
restart_application() {
    log_info "Restarting application..."
    
    ssh ${DEPLOY_USER}@${DEPLOY_HOST} "
        sudo systemctl restart ${SERVICE_NAME}
        sleep 5
        sudo systemctl status ${SERVICE_NAME}
    "
    
    log_success "Application restarted"
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Wait for application to start
    sleep 10
    
    HEALTH_URL="http://${DEPLOY_HOST}:3000/api/data"
    
    for i in {1..5}; do
        if curl -f "$HEALTH_URL" > /dev/null 2>&1; then
            log_success "Health check passed"
            return 0
        else
            log_warning "Health check attempt $i failed, retrying..."
            sleep 5
        fi
    done
    
    log_error "Health check failed after 5 attempts"
    return 1
}

# Rollback function
rollback() {
    log_warning "Rolling back to previous version..."
    
    LATEST_BACKUP=$(ssh ${DEPLOY_USER}@${DEPLOY_HOST} "ls -t ${BACKUP_DIR} | head -1")
    
    if [ -n "$LATEST_BACKUP" ]; then
        ssh ${DEPLOY_USER}@${DEPLOY_HOST} "
            sudo rm -rf ${DEPLOY_PATH}
            sudo cp -r ${BACKUP_DIR}/${LATEST_BACKUP} ${DEPLOY_PATH}
            sudo systemctl restart ${SERVICE_NAME}
        "
        log_success "Rollback completed"
    else
        log_error "No backup found for rollback"
        exit 1
    fi
}

# Main deployment function
deploy() {
    log_info "Starting deployment of Timeline App..."
    
    check_environment
    create_backup
    deploy_files
    install_dependencies
    setup_service
    restart_application
    
    if health_check; then
        log_success "Deployment completed successfully!"
    else
        log_error "Deployment failed health check. Rolling back..."
        rollback
        exit 1
    fi
}

# Script usage
usage() {
    echo "Usage: $0 [deploy|rollback|health-check]"
    echo ""
    echo "Commands:"
    echo "  deploy       - Deploy the application"
    echo "  rollback     - Rollback to previous version"
    echo "  health-check - Check application health"
    echo ""
    echo "Environment variables:"
    echo "  DEPLOY_HOST  - Target server hostname/IP"
    echo "  DEPLOY_USER  - SSH user (default: deploy)"
    echo "  SQLITE_URL   - Database connection string"
}

# Main script logic
case "$1" in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    health-check)
        health_check
        ;;
    *)
        usage
        exit 1
        ;;
esac
