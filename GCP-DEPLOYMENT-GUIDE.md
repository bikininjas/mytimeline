# Google Cloud Platform Deployment Guide 🚀

This guide covers deploying the Timeline App to Google Cloud Platform using Cloud Run, with a complete CI/CD pipeline using GitHub Actions and Bun.

## 📋 Overview

**Architecture:**
- **Cloud Run** - Serverless container platform for the application
- **Artifact Registry** - Docker container registry
- **Secret Manager** - Secure storage for sensitive configuration
- **Cloud Build** - Build and deployment automation
- **GitHub Actions** - CI/CD pipeline automation

**Environment:**
- **Development Only** - Single environment deployment
- **Auto-scaling** - 0 to 10 instances based on traffic
- **HTTPS** - Automatic SSL/TLS certificates
- **Custom Domain** - Optional custom domain support

## 🏗️ Prerequisites

### 1. Google Cloud Setup

1. **Create GCP Project:**
   ```bash
   gcloud projects create timeline-app-dev --name="Timeline App Development"
   gcloud config set project timeline-app-dev
   ```

2. **Enable Billing:**
   - Go to [GCP Console](https://console.cloud.google.com)
   - Enable billing for your project

3. **Install Google Cloud SDK:**
   ```bash
   # On macOS
   brew install google-cloud-sdk
   
   # On Ubuntu/Debian
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   ```

4. **Authenticate:**
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

### 2. Service Account Setup

1. **Create Service Account:**
   ```bash
   gcloud iam service-accounts create timeline-app-deployer \
     --description="Service account for Timeline App deployment" \
     --display-name="Timeline App Deployer"
   ```

2. **Grant Required Permissions:**
   ```bash
   PROJECT_ID="timeline-app-dev"
   SA_EMAIL="timeline-app-deployer@${PROJECT_ID}.iam.gserviceaccount.com"
   
   # Cloud Run permissions
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:${SA_EMAIL}" \
     --role="roles/run.admin"
   
   # Artifact Registry permissions
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:${SA_EMAIL}" \
     --role="roles/artifactregistry.admin"
   
   # Secret Manager permissions
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:${SA_EMAIL}" \
     --role="roles/secretmanager.admin"
   
   # Cloud Build permissions
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:${SA_EMAIL}" \
     --role="roles/cloudbuild.builds.editor"
   
   # Service Account Token Creator
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:${SA_EMAIL}" \
     --role="roles/iam.serviceAccountTokenCreator"
   ```

3. **Create Service Account Key:**
   ```bash
   gcloud iam service-accounts keys create ~/timeline-app-key.json \
     --iam-account=$SA_EMAIL
   ```

## 🚀 Quick Deployment

### 1. Environment Setup

1. **Copy GCP environment file:**
   ```bash
   cp .env.gcp.example .env.gcp
   ```

2. **Update configuration:**
   ```bash
   # Edit .env.gcp with your project details
   GCP_PROJECT_ID=your-project-id
   GCP_REGION=us-central1
   SQLITE_URL=your-database-url
   ```

3. **Export environment variables:**
   ```bash
   export $(cat .env.gcp | xargs)
   ```

### 2. One-Command Deployment

```bash
# Complete setup and deployment
./deploy-gcp.sh full-deploy
```

This will:
- ✅ Enable required GCP APIs
- ✅ Create Artifact Registry repository
- ✅ Configure secrets in Secret Manager
- ✅ Build and push Docker image
- ✅ Deploy to Cloud Run
- ✅ Run health checks
- ✅ Display service information

### 3. Manual Step-by-Step Deployment

```bash
# 1. Setup infrastructure
./deploy-gcp.sh setup

# 2. Configure secrets
export SQLITE_URL="your-database-url"
./deploy-gcp.sh secrets

# 3. Build and push image
./deploy-gcp.sh build

# 4. Deploy to Cloud Run
./deploy-gcp.sh deploy

# 5. Check health
./deploy-gcp.sh health-check
```

## 🔧 GitHub Actions CI/CD Setup

### 1. GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```bash
# Required secrets
GCP_SA_KEY          # Base64-encoded service account key
GCP_PROJECT_ID      # Your GCP project ID
SQLITE_URL          # Your database connection string

# Optional secrets
SLACK_WEBHOOK_URL   # For deployment notifications
```

**Create GCP_SA_KEY:**
```bash
# Encode the service account key
cat ~/timeline-app-key.json | base64 -w 0
# Copy the output and add as GCP_SA_KEY secret
```

### 2. Workflow Configuration

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) will automatically:

**On Push to main/master/cicd:**
- ✅ Run tests and quality checks
- ✅ Build Docker image
- ✅ Push to Artifact Registry
- ✅ Deploy to Cloud Run
- ✅ Run health checks
- ✅ Update traffic to new revision

**On Pull Request:**
- ✅ Run tests and quality checks
- ✅ Build Docker image (without deployment)

### 3. Manual Workflow Triggers

You can manually trigger workflows from GitHub:
- Go to Actions tab
- Select "CI/CD Pipeline"
- Click "Run workflow"

## 🐳 Local Development with GCP Simulation

### 1. GCP-like Local Environment

```bash
# Start GCP-simulated environment
npm run gcp:local

# Start development environment with hot reload
npm run gcp:dev

# Stop environment
npm run gcp:local-down
```

**Services available:**
- **App:** http://localhost:8080 (simulates Cloud Run port)
- **Load Balancer:** http://localhost:80
- **Monitoring:** http://localhost:9090 (if enabled)

### 2. Local Docker Testing

```bash
# Build image locally
docker build -t timeline-app-gcp .

# Run with GCP-like settings
docker run -p 8080:3000 \
  -e NODE_ENV=development \
  -e PORT=3000 \
  -e SQLITE_URL="your-db-url" \
  timeline-app-gcp
```

## 📊 Monitoring and Management

### 1. Service Information

```bash
# Get service details
./deploy-gcp.sh info

# Check service status
gcloud run services list --region=us-central1

# Get service URL
gcloud run services describe timeline-app \
  --region=us-central1 \
  --format='value(status.url)'
```

### 2. Logs and Monitoring

```bash
# View application logs
./deploy-gcp.sh logs

# Real-time log streaming
gcloud logging tail "resource.type=cloud_run_revision"

# Monitor metrics in GCP Console
# Go to Cloud Run → timeline-app → Metrics
```

### 3. Scaling and Performance

```bash
# Scale service manually
./deploy-gcp.sh scale 1 20

# Update service configuration
gcloud run services update timeline-app \
  --region=us-central1 \
  --memory=1Gi \
  --cpu=2
```

## 🔒 Security Configuration

### 1. IAM and Access Control

```bash
# Make service public (current setup)
gcloud run services add-iam-policy-binding timeline-app \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker"

# Make service private (optional)
gcloud run services remove-iam-policy-binding timeline-app \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker"
```

### 2. Secret Management

```bash
# List secrets
gcloud secrets list

# Update secret
echo "new-value" | gcloud secrets versions add SQLITE_URL --data-file=-

# View secret versions
gcloud secrets versions list SQLITE_URL
```

### 3. Network Security

**Cloud Armor (Optional):**
```bash
# Create security policy
gcloud compute security-policies create timeline-app-policy \
  --description="Security policy for Timeline App"

# Add rate limiting rule
gcloud compute security-policies rules create 1000 \
  --security-policy=timeline-app-policy \
  --action=rate-based-ban \
  --rate-limit-threshold-count=100 \
  --rate-limit-threshold-interval-sec=60
```

## 🌐 Custom Domain Setup (Optional)

### 1. Domain Mapping

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service=timeline-app \
  --domain=your-domain.com \
  --region=us-central1
```

### 2. SSL Certificate

Cloud Run automatically provisions SSL certificates for custom domains.

## 💰 Cost Optimization

### 1. Current Configuration

**Estimated Monthly Cost (light usage):**
- Cloud Run: $0-5 (pay per use)
- Artifact Registry: $0.10-0.50
- Secret Manager: $0.06
- Cloud Build: $0.003 per minute

**Total: ~$0.20-6.00/month** for development usage

### 2. Cost Optimization Tips

```bash
# Set minimum instances to 0 (cold starts)
gcloud run services update timeline-app \
  --min-instances=0

# Use smaller memory allocation
gcloud run services update timeline-app \
  --memory=256Mi

# Limit maximum instances
gcloud run services update timeline-app \
  --max-instances=5
```

## 🚨 Troubleshooting

### 1. Common Issues

**Deployment Fails:**
```bash
# Check Cloud Build logs
gcloud builds list --limit=5

# Check Cloud Run service
gcloud run services describe timeline-app --region=us-central1
```

**Service Not Accessible:**
```bash
# Check IAM permissions
gcloud run services get-iam-policy timeline-app --region=us-central1

# Test health endpoint
curl -f https://your-service-url/api/data
```

**Database Connection Issues:**
```bash
# Check secret value
gcloud secrets versions access latest --secret=SQLITE_URL

# Check service logs
./deploy-gcp.sh logs
```

### 2. Debug Commands

```bash
# Local testing
npm run gcp:local
curl http://localhost:8080/api/data

# Check Docker image
docker run --rm timeline-app-gcp env

# Test Cloud Build locally
cloud-build-local --config=cloudbuild.yaml --dryrun=false .
```

## 🧹 Cleanup

### 1. Delete Resources

```bash
# Delete everything
./deploy-gcp.sh cleanup

# Manual cleanup
gcloud run services delete timeline-app --region=us-central1
gcloud artifacts repositories delete timeline-app --location=us-central1
gcloud secrets delete SQLITE_URL
```

### 2. Cost Monitoring

```bash
# Check current usage
gcloud billing budgets list

# Set up billing alerts
gcloud billing budgets create \
  --billing-account=YOUR_BILLING_ACCOUNT \
  --display-name="Timeline App Budget" \
  --budget-amount=10USD
```

## 📚 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Artifact Registry Documentation](https://cloud.google.com/artifact-registry/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [GitHub Actions for GCP](https://github.com/google-github-actions)

## 📞 Support

For GCP deployment issues:
1. Check the troubleshooting section above
2. Review Cloud Run logs: `./deploy-gcp.sh logs`
3. Check GitHub Actions logs in the repository
4. Create an issue with deployment logs

---

**Made with ❤️ for Google Cloud Platform using Cloud Run, GitHub Actions, and Bun**
