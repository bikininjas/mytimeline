# Google Cloud Platform Setup Guide 🌍

This guide helps you set up the required GCP resources for the Timeline App deployment to Europe West 9 (Paris).

## 🔧 Required GCP Resources

### 1. Artifact Registry Repository

The Timeline App needs a Docker repository in Artifact Registry to store container images.

**Create the repository:**
```bash
gcloud artifacts repositories create timeline-app \
  --repository-format=docker \
  --location=europe-west9 \
  --description="Timeline App Docker Repository - Europe West 9 (Paris)"
```

**Verify repository:**
```bash
gcloud artifacts repositories describe timeline-app --location=europe-west9
```

### 2. Service Account Permissions

The GitHub Actions service account needs these permissions:

#### Required IAM Roles:
- `roles/artifactregistry.writer` - Push Docker images
- `roles/run.admin` - Deploy Cloud Run services  
- `roles/iam.serviceAccountUser` - Use service accounts

#### If you want the workflow to auto-create repositories:
- `roles/artifactregistry.admin` - Create repositories

**Grant permissions:**
```bash
# Replace SERVICE_ACCOUNT_EMAIL with your GitHub Actions service account
SERVICE_ACCOUNT_EMAIL="github-actions-deployer@YOUR_PROJECT.iam.gserviceaccount.com"

# Basic deployment permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

# Optional: Auto-create repositories
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/artifactregistry.admin"
```

### 3. Enable Required APIs

```bash
# Enable Artifact Registry API
gcloud services enable artifactregistry.googleapis.com

# Enable Cloud Run API  
gcloud services enable run.googleapis.com

# Enable Cloud Build API (for container builds)
gcloud services enable cloudbuild.googleapis.com
```

## 🌍 Europe West 9 Configuration

### Why Europe West 9?
- **Location**: Paris, France
- **Data Locality**: European data stays in Europe
- **Compliance**: GDPR and EU data residency requirements
- **Performance**: Lower latency for European users

### Region Settings:
- **Artifact Registry**: `europe-west9`
- **Cloud Run**: `europe-west9` 
- **Registry URL**: `europe-west9-docker.pkg.dev`

## 🔍 Troubleshooting

### Permission Denied Errors

**Error**: `Permission 'artifactregistry.repositories.create' denied`

**Solution**: Grant the service account `roles/artifactregistry.admin` or create the repository manually.

### Repository Not Found

**Error**: `name unknown: Repository "timeline-app" not found`

**Solution**: Create the Artifact Registry repository first (see step 1 above).

### Authentication Issues

**Error**: Authentication failures in GitHub Actions

**Solution**: 
1. Verify the service account key is correctly stored in GitHub organization secrets
2. Check the service account has the required permissions
3. Ensure the service account key hasn't expired

## 📋 Verification Checklist

- [ ] Artifact Registry API enabled
- [ ] Cloud Run API enabled
- [ ] Artifact Registry repository `timeline-app` created in `europe-west9`
- [ ] Service account has `artifactregistry.writer` permission
- [ ] Service account has `run.admin` permission
- [ ] Service account has `iam.serviceAccountUser` permission
- [ ] Service account key stored in GitHub organization secrets as `GCS_GH_SVC_ACCOUNT_JSON_KEY`
- [ ] Project ID stored in GitHub organization secrets as `GCP_PROJECT_ID`
- [ ] SQLiteCloud connection string stored as `SQLITECLOUD_TIMELINE_CONNECTION_STRING`

## 🚀 Quick Setup Script

```bash
#!/bin/bash
# Quick setup script for Timeline App GCP resources

PROJECT_ID="your-project-id"
SERVICE_ACCOUNT_EMAIL="github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🔧 Setting up Timeline App GCP resources..."

# Enable APIs
echo "📡 Enabling APIs..."
gcloud services enable artifactregistry.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Create Artifact Registry repository
echo "🏗️ Creating Artifact Registry repository..."
gcloud artifacts repositories create timeline-app \
  --repository-format=docker \
  --location=europe-west9 \
  --description="Timeline App Docker Repository - Europe West 9 (Paris)"

# Grant permissions
echo "🔑 Granting permissions to service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

echo "✅ Setup complete!"
echo "🚀 You can now trigger the GitHub Actions deployment workflow."
```

## 🔗 Useful Commands

### List Artifact Registry repositories:
```bash
gcloud artifacts repositories list --location=europe-west9
```

### List Docker images in repository:
```bash
gcloud artifacts docker images list europe-west9-docker.pkg.dev/YOUR_PROJECT/timeline-app
```

### List Cloud Run services:
```bash
gcloud run services list --region=europe-west9
```

### View service account permissions:
```bash
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:github-actions-deployer@YOUR_PROJECT.iam.gserviceaccount.com"
```

---

## 💡 Need Help?

1. **Check the GitHub Actions logs** for specific error messages
2. **Verify permissions** using the commands above
3. **Test locally** with `gcloud auth application-default login`
4. **Review the GCP Console** for resource status

**Happy deploying! 🎉**
