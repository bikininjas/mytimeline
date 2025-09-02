# Domain Configuration Guide for Timeline App

This guide walks you through setting up a custom domain (FQDN) for your Timeline App deployed on Google Cloud Run.

## 🌐 Overview

Setting up a custom domain involves:
1. **Domain ownership verification** - Prove you own the domain
2. **DNS configuration** - Point your domain to Google Cloud
3. **SSL certificate** - Automatic HTTPS with Google-managed certificates
4. **Domain mapping** - Connect your domain to the Cloud Run service

## 📋 Prerequisites

- A registered domain name (e.g., `yourdomain.com`)
- Access to your domain's DNS settings
- Google Cloud project with Cloud Run API enabled
- Timeline App already deployed to Cloud Run

## 🔧 Step-by-Step Setup

### Step 1: Verify Domain Ownership

Before mapping a custom domain, you need to verify ownership in Google Search Console.

1. **Go to Google Search Console**: https://search.google.com/search-console
2. **Add a property** for your domain (e.g., `yourdomain.com`)
3. **Verify ownership** using one of these methods:
   - **DNS record** (recommended): Add a TXT record to your domain
   - **HTML file upload**: Upload a verification file
   - **Meta tag**: Add a meta tag to your website

#### DNS Verification Example:
```
Type: TXT
Name: @ (or leave blank for root domain)
Value: google-site-verification=ABC123...
TTL: 300
```

### Step 2: Configure DNS Records

Add a CNAME record pointing your domain to Google Cloud Run:

```
Type: CNAME
Name: timeline (for timeline.yourdomain.com)
Value: ghs.googlehosted.com.
TTL: 300
```

**Important Notes:**
- The trailing dot (`.`) in `ghs.googlehosted.com.` is required
- Use `@` or leave name blank for root domain mapping
- TTL of 300 seconds (5 minutes) is recommended for faster propagation

#### Example DNS Configuration:
```
# For subdomain: timeline.yourdomain.com
timeline.yourdomain.com.  300  IN  CNAME  ghs.googlehosted.com.

# For root domain: yourdomain.com (if supported by your DNS provider)
yourdomain.com.  300  IN  CNAME  ghs.googlehosted.com.
```

### Step 3: Create Domain Mapping

#### Option A: Using gcloud CLI
```bash
# Set variables
PROJECT_ID="your-project-id"
DOMAIN="timeline.yourdomain.com"
SERVICE_NAME="timeline-app"
REGION="europe-west9"

# Create domain mapping
gcloud run domain-mappings create \
  --service $SERVICE_NAME \
  --domain $DOMAIN \
  --region $REGION \
  --project $PROJECT_ID
```

#### Option B: Using Terraform
1. Copy the terraform configuration files from `gcp-config/`
2. Update `terraform.tfvars` with your values:
   ```hcl
   project_id = "your-project-id"
   domain_name = "timeline.yourdomain.com"
   ```
3. Apply the configuration:
   ```bash
   cd gcp-config
   terraform init
   terraform plan
   terraform apply
   ```

#### Option C: Using Google Cloud Console
1. Go to **Cloud Run** in the Google Cloud Console
2. Select your **timeline-app** service
3. Click the **MANAGE CUSTOM DOMAINS** tab
4. Click **ADD MAPPING**
5. Enter your domain and verify ownership

### Step 4: Wait for SSL Certificate

Google automatically provisions an SSL certificate for your domain. This process can take:
- **15 minutes to 24 hours** for certificate provisioning
- **DNS propagation** may take up to 48 hours globally

Check the status:
```bash
gcloud run domain-mappings describe $DOMAIN \
  --region $REGION \
  --project $PROJECT_ID
```

## 🔍 Verification and Testing

### Check Domain Mapping Status
```bash
```bash
# List all domain mappings
gcloud run domain-mappings list

# Get detailed status
gcloud run domain-mappings describe timeline.yourdomain.com
```

### Test DNS Resolution
```bash
# Check if DNS is properly configured
nslookup timeline.yourdomain.com

# Expected output should show ghs.googlehosted.com
```

### Test HTTPS Access
```bash
# Test HTTP access (should redirect to HTTPS)
curl -I http://timeline.yourdomain.com

# Test HTTPS access
curl -I https://timeline.yourdomain.com
```

## 🎯 Multiple Environment Setup

For staging/development environments:

### DNS Configuration:
```
# Production
timeline.yourdomain.com.  300  IN  CNAME  ghs.googlehosted.com.

# Staging
staging.timeline.yourdomain.com.  300  IN  CNAME  ghs.googlehosted.com.

# Development
dev.timeline.yourdomain.com.  300  IN  CNAME  ghs.googlehosted.com.
```

### Domain Mappings:
```bash
# Production
gcloud run domain-mappings create --service timeline-app --domain timeline.yourdomain.com

# Staging  
gcloud run domain-mappings create --service timeline-app-staging --domain staging.timeline.yourdomain.com

# Development
gcloud run domain-mappings create --service timeline-app-dev --domain dev.timeline.yourdomain.com
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Domain Verification Failed
**Symptoms**: Cannot create domain mapping
**Solution**: 
- Verify domain ownership in Google Search Console first
- Ensure you're using the correct domain format (no protocol, no paths)

#### 2. SSL Certificate Pending
**Symptoms**: HTTPS not working, certificate status shows "Pending"
**Solution**:
- Wait 15-60 minutes for initial provisioning
- Check DNS propagation with `dig timeline.yourdomain.com`
- Ensure CNAME points to `ghs.googlehosted.com.`

#### 3. DNS Not Resolving
**Symptoms**: Domain doesn't resolve to Google servers
**Solution**:
- Verify CNAME record is correct: `ghs.googlehosted.com.`
- Check TTL settings (300 seconds recommended)
- Wait for DNS propagation (up to 48 hours)

#### 4. 404 Error on Custom Domain
**Symptoms**: Domain resolves but shows 404
**Solution**:
- Verify Cloud Run service is running
- Check domain mapping points to correct service
- Ensure service allows public traffic

### Useful Debugging Commands

```bash
# Check domain mapping status
gcloud run domain-mappings describe YOUR_DOMAIN

# Check Cloud Run service status
gcloud run services describe timeline-app --region=europe-west9

# Test DNS resolution
dig timeline.yourdomain.com CNAME

# Check SSL certificate
openssl s_client -connect timeline.yourdomain.com:443 -servername timeline.yourdomain.com
```

## 📝 DNS Provider Examples

### Cloudflare
```
Type: CNAME
Name: timeline
Target: ghs.googlehosted.com
Proxy status: DNS only (grey cloud)
TTL: Auto
```

### Namecheap
```
Type: CNAME Record
Host: timeline
Value: ghs.googlehosted.com.
TTL: 5 min
```

### Google Domains
```
Type: CNAME
Name: timeline
Data: ghs.googlehosted.com.
TTL: 300
```

### Route 53 (AWS)
```json
{
  "Type": "CNAME",
  "Name": "timeline.yourdomain.com",
  "Value": "ghs.googlehosted.com.",
  "TTL": 300
}
```

## 🔒 Security Considerations

### HTTPS Enforcement
Cloud Run automatically redirects HTTP to HTTPS for custom domains.

### HSTS Headers
Consider adding HSTS headers in your application:
```javascript
// In your Express.js app
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

### CSP Headers
Configure Content Security Policy for enhanced security:
```javascript
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' cdn.knightlab.com");
  next();
});
```

## 📋 Checklist

- [ ] Domain ownership verified in Google Search Console
- [ ] DNS CNAME record configured: `ghs.googlehosted.com.`
- [ ] Domain mapping created in Cloud Run
- [ ] SSL certificate provisioned (15min - 24hrs)
- [ ] HTTPS access working
- [ ] HTTP redirects to HTTPS
- [ ] Application loads correctly on custom domain

## 🚀 Next Steps

After successful domain setup:

1. **Update application configuration** to use the new domain
2. **Update any hardcoded URLs** in your application
3. **Configure monitoring** for the custom domain
4. **Set up domain monitoring** alerts
5. **Update documentation** with the new domain

## 📞 Support

If you encounter issues:
1. Check the [Google Cloud Run documentation](https://cloud.google.com/run/docs/mapping-custom-domains)
2. Review the troubleshooting section above
3. Check Google Cloud Console for error messages
4. Verify DNS propagation using online DNS checkers

---

**🎉 Once configured, your Timeline App will be available at your custom domain with automatic HTTPS!**
