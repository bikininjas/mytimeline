# CI/CD Setup for Timeline App 🚀

This document describes the Continuous Integration and Continuous Deployment (CI/CD) setup for the Timeline App using GitHub Actions and Bun.

## 📋 Overview

The CI/CD pipeline includes:
- **Automated Testing** - Code quality checks and testing
- **Security Scanning** - Vulnerability and dependency scanning
- **Docker Builds** - Containerized application builds
- **Automated Deployment** - Staging and production deployments
- **Release Management** - Automated releases with artifacts
- **Dependency Updates** - Automated dependency management

## 🔧 GitHub Actions Workflows

### 1. Main CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

**Triggers:**
- Push to `main`, `master`, `develop`, `cicd` branches
- Pull requests to `main`, `master`, `develop`
- Manual workflow dispatch

**Jobs:**
- **Test & Quality Check** 🧪
  - Setup Bun environment
  - Install dependencies
  - Run linting and tests
  - Security audit
  - Bundle size check

- **Build Application** 🔨
  - Build the application
  - Create deployment artifacts
  - Upload build artifacts

- **Deploy to Staging** 🚀
  - Deploy to staging environment (main/master branch only)
  - Environment: staging

- **Deploy to Production** 🎯
  - Deploy to production (release tags only)
  - Environment: production

- **Docker Build & Push** 🐳
  - Build multi-platform Docker images
  - Push to Docker Hub and GitHub Container Registry
  - Cache optimization

- **Health Check** 🏥
  - Verify deployment health
  - Performance testing

### 2. Release Workflow (`.github/workflows/release.yml`)

**Triggers:**
- Push tags matching `v*.*.*` pattern
- Manual workflow dispatch

**Features:**
- Create GitHub releases with changelog
- Build and upload release artifacts (TAR.GZ, ZIP)
- Build and push Docker images with version tags
- Automated release notifications

### 3. Security Scanning (`.github/workflows/security.yml`)

**Triggers:**
- Push to main branches
- Pull requests
- Daily scheduled scan (2 AM UTC)
- Manual workflow dispatch

**Security Features:**
- **Dependency Vulnerability Scanning** - Using Bun audit
- **CodeQL Analysis** - GitHub's semantic code analysis
- **Docker Security Scanning** - Using Trivy scanner
- **Secrets Scanning** - Using TruffleHog OSS

### 4. Dependabot Configuration (`.github/dependabot.yml`)

**Automated Updates:**
- **npm dependencies** - Weekly updates on Monday
- **Docker base images** - Weekly updates on Tuesday  
- **GitHub Actions** - Weekly updates on Wednesday

**Features:**
- Grouped updates for better management
- Auto-merge for patch security updates
- Custom reviewers and labels
- Separate handling for production vs development dependencies

## 🐳 Docker Configuration

### Dockerfile
Multi-stage Docker build optimized for production:
- **Base Stage** - Bun runtime setup
- **Dependencies Stage** - Production dependencies
- **Development Stage** - Development dependencies
- **Production Stage** - Final optimized image

**Features:**
- Non-root user for security
- Health checks
- Multi-platform support (AMD64, ARM64)
- Optimized layer caching

### Docker Compose
Comprehensive Docker Compose setup with:
- **Production service** - Optimized for production
- **Development service** - Hot-reload development
- **Nginx reverse proxy** - Load balancing and SSL
- **Health monitoring** - Automated health checks

**Profiles:**
- `dev` - Development environment
- `production` - Production environment  
- `monitoring` - Health monitoring services

## 📦 Package Scripts

Enhanced package.json scripts for CI/CD:

```bash
# Development
npm run dev              # Start with hot reload
npm run start           # Start production server

# Testing & Quality
npm run test            # Run tests
npm run lint            # Code linting
npm run health-check    # Application health check

# Docker Operations
npm run docker:build    # Build Docker image
npm run docker:run      # Run Docker container
npm run docker:dev      # Start development environment
npm run docker:prod     # Start production environment
npm run docker:up       # Start all services
npm run docker:down     # Stop all services
npm run docker:logs     # View application logs
```

## 🚀 Deployment

### Automated Deployment Script (`deploy.sh`)

Comprehensive deployment script with:
- **Environment validation**
- **Automated backups**
- **Health checks**
- **Rollback capability**
- **Systemd service management**

**Usage:**
```bash
# Deploy application
./deploy.sh deploy

# Rollback to previous version
./deploy.sh rollback

# Check application health
./deploy.sh health-check
```

**Required Environment Variables:**
```bash
export DEPLOY_HOST="your-server.com"
export DEPLOY_USER="deploy"
export SQLITE_URL="your-database-url"
```

### Manual Deployment

1. **Prepare Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Deploy with Docker:**
   ```bash
   docker-compose --profile production up -d
   ```

3. **Deploy with Systemd:**
   ```bash
   ./deploy.sh deploy
   ```

## 🔒 Security Configuration

### GitHub Secrets

Required secrets for CI/CD:

```bash
# Docker Hub (optional)
DOCKERHUB_USERNAME      # Docker Hub username
DOCKERHUB_TOKEN         # Docker Hub access token

# Deployment
DEPLOY_HOST             # Production server hostname
DEPLOY_SSH_KEY          # SSH private key for deployment
SQLITE_URL              # Production database URL

# Notifications (optional)
SLACK_WEBHOOK_URL       # Slack notification webhook
DISCORD_WEBHOOK_URL     # Discord notification webhook
```

### Environment Setup

1. **Add secrets to GitHub repository:**
   - Go to Settings → Secrets and variables → Actions
   - Add required secrets

2. **Configure deployment server:**
   ```bash
   # Add deployment user
   sudo useradd -m -s /bin/bash deploy
   
   # Setup SSH access
   sudo mkdir /home/deploy/.ssh
   sudo chown deploy:deploy /home/deploy/.ssh
   sudo chmod 700 /home/deploy/.ssh
   
   # Add public key to authorized_keys
   sudo -u deploy ssh-keygen -t rsa -b 4096
   ```

3. **Setup systemd service:**
   ```bash
   # The deploy script will handle this automatically
   ./deploy.sh deploy
   ```

## 📊 Monitoring & Observability

### Health Checks
- **Application health** - `/api/data` endpoint monitoring
- **Docker health checks** - Container health monitoring
- **Systemd monitoring** - Service status monitoring

### Logging
- **Application logs** - `server.log`
- **Docker logs** - Container logging
- **Systemd logs** - Service logging

### Metrics
- **Build metrics** - CI/CD pipeline performance
- **Security metrics** - Vulnerability tracking
- **Deployment metrics** - Deployment success/failure rates

## 🔄 Workflow Management

### Branch Strategy
- **main/master** - Production-ready code, triggers staging deployment
- **develop** - Development branch for feature integration
- **feature/** - Feature development branches
- **cicd** - CI/CD configuration and testing

### Release Process
1. **Create release tag:**
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

2. **Automated release workflow:**
   - Creates GitHub release
   - Builds and uploads artifacts
   - Builds and pushes Docker images
   - Triggers production deployment

### Hotfix Process
1. **Create hotfix branch from main:**
   ```bash
   git checkout -b hotfix/critical-fix main
   ```

2. **Make fixes and create PR to main**

3. **Tag hotfix release:**
   ```bash
   git tag -a v1.0.1 -m "Hotfix version 1.0.1"
   ```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check Bun version compatibility
   - Verify dependency lock file
   - Review build logs in Actions

2. **Deployment Failures:**
   - Verify server access and SSH keys
   - Check environment variables
   - Review deployment logs

3. **Health Check Failures:**
   - Verify application startup
   - Check database connectivity
   - Review application logs

### Debug Commands

```bash
# Check CI/CD status
gh workflow list
gh run list

# Local testing
bun install
bun start
curl http://localhost:3000/api/data

# Docker testing
docker build -t timeline-app .
docker run -p 3000:3000 timeline-app

# Deployment testing
./deploy.sh health-check
```

## 📚 Best Practices

### CI/CD Best Practices
- **Fast feedback** - Keep builds under 10 minutes
- **Fail fast** - Catch issues early in the pipeline
- **Parallel execution** - Run independent jobs in parallel
- **Artifact management** - Proper artifact storage and cleanup
- **Security first** - Security scanning in every build

### Deployment Best Practices
- **Blue-green deployments** - Zero-downtime deployments
- **Rollback capability** - Always have a rollback plan
- **Health checks** - Verify deployment success
- **Monitoring** - Monitor application health post-deployment
- **Backup strategy** - Regular backups before deployment

### Security Best Practices
- **Secrets management** - Use GitHub Secrets for sensitive data
- **Least privilege** - Minimal required permissions
- **Regular updates** - Keep dependencies updated
- **Vulnerability scanning** - Regular security scans
- **Audit logging** - Track all deployment activities

## 📞 Support

For CI/CD related issues:
1. Check GitHub Actions logs
2. Review this documentation
3. Create an issue in the repository
4. Contact the development team

---

**Made with ❤️ using GitHub Actions, Bun, and Docker**
