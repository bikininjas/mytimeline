# DNS Configuration for bikininjas.fr with Pulseheberg

This guide provides specific instructions for configuring DNS records for your `bikininjas.fr` domain with Pulseheberg as the registrar.

## 🌐 Domain Overview

- **Domain**: `bikininjas.fr`
- **Registrar**: Pulseheberg
- **Target**: Google Cloud Run (Europe West 9 - Paris)
- **Timeline App URL**: `timeline.bikininjas.fr`

## 🔧 Pulseheberg DNS Configuration

### Step 1: Access Pulseheberg DNS Management

1. Log in to your **Pulseheberg account**
2. Navigate to **Domain Management** or **DNS Management**
3. Select your domain `bikininjas.fr`
4. Access the **DNS Zone** or **DNS Records** section

### Step 2: Configure DNS Records

Add the following DNS records in your Pulseheberg DNS management panel:

#### Required CNAME Record for Timeline App

```
Type: CNAME
Name: timeline
Target: ghs.googlehosted.com.
TTL: 300 (5 minutes)
```

**Important**: Make sure to include the trailing dot (`.`) in `ghs.googlehosted.com.`

#### Optional: Staging Environment

```
Type: CNAME
Name: staging.timeline
Target: ghs.googlehosted.com.
TTL: 300
```

#### Optional: Alternative Subdomains

You could also use other subdomains:

```
# For app.bikininjas.fr
Type: CNAME
Name: app
Target: ghs.googlehosted.com.
TTL: 300

# For events.bikininjas.fr  
Type: CNAME
Name: events
Target: ghs.googlehosted.com.
TTL: 300
```

### Step 3: Pulseheberg-Specific Settings

#### DNS Record Format in Pulseheberg
Pulseheberg typically uses this format:

```
Record Type: CNAME
Host/Name: timeline
Points to/Target: ghs.googlehosted.com.
TTL: 300
```

#### Common Pulseheberg Field Names
- **Host**: `timeline`
- **Type**: `CNAME`
- **Target/Points to**: `ghs.googlehosted.com.`
- **TTL**: `300`

## ✅ Verification Steps

### 1. DNS Propagation Check
After adding the records, wait 5-15 minutes then test:

```bash
# Check if DNS is properly configured
nslookup timeline.bikininjas.fr

# Expected output should show ghs.googlehosted.com
```

### 2. Online DNS Checkers
Use these tools to verify DNS propagation:
- https://www.whatsmydns.net/#CNAME/timeline.bikininjas.fr
- https://dnschecker.org/#CNAME/timeline.bikininjas.fr

### 3. Dig Command
```bash
dig timeline.bikininjas.fr CNAME
```

Expected response:
```
timeline.bikininjas.fr. 300 IN CNAME ghs.googlehosted.com.
```

## 🚀 Google Cloud Configuration

Once DNS is configured, set up the domain mapping in Google Cloud:

### Using gcloud CLI:
```bash
# Set your project ID
PROJECT_ID="your-gcp-project-id"

# Create domain mapping
gcloud run domain-mappings create \
  --service timeline-app \
  --domain timeline.bikininjas.fr \
  --region europe-west9 \
  --project $PROJECT_ID
```

### Using Terraform:
1. Copy `terraform.tfvars.example` to `terraform.tfvars`
2. Update with your values:
   ```hcl
   project_id = "your-gcp-project-id"
   domain_name = "timeline.bikininjas.fr"
   ```
3. Apply:
   ```bash
   cd gcp-config
   terraform init
   terraform plan
   terraform apply
   ```

## 🔒 Domain Verification

Before creating the domain mapping, verify ownership in Google Search Console:

1. Go to **Google Search Console**: https://search.google.com/search-console
2. Add property: `https://bikininjas.fr`
3. Verify using DNS record method:
   ```
   Type: TXT
   Name: @ (or leave blank)
   Value: google-site-verification=ABC123...
   TTL: 300
   ```

## 🛠️ Troubleshooting

### Common Pulseheberg Issues

#### 1. CNAME Not Working
- Ensure you're adding the record to the **correct domain zone**
- Double-check the target: `ghs.googlehosted.com.` (with trailing dot)
- Wait for DNS propagation (5-60 minutes)

#### 2. TTL Too High
- Set TTL to 300 seconds (5 minutes) for faster changes
- Some providers default to 86400 (24 hours)

#### 3. Wrong Record Type
- Use **CNAME**, not A record
- Don't use URL redirect/forwarding

### Pulseheberg Support
If you encounter issues:
- Contact **Pulseheberg support** for DNS configuration help
- Check their **documentation** for DNS management
- Verify you have the correct **permissions** to modify DNS

## 📋 DNS Configuration Checklist

- [ ] Logged into Pulseheberg account
- [ ] Accessed DNS management for bikininjas.fr
- [ ] Added CNAME record: `timeline` → `ghs.googlehosted.com.`
- [ ] Set TTL to 300 seconds
- [ ] Verified DNS propagation with nslookup/dig
- [ ] Verified domain ownership in Google Search Console
- [ ] Created domain mapping in Google Cloud Run
- [ ] Tested HTTPS access to timeline.bikininjas.fr

## 🎯 Final URLs

After successful configuration:

- **Production**: https://timeline.bikininjas.fr
- **Staging** (optional): https://staging.timeline.bikininjas.fr
- **Alternative**: https://app.bikininjas.fr

## 📞 Support Resources

- **Pulseheberg Support**: Contact for DNS-specific issues
- **Google Cloud Console**: For domain mapping status
- **DNS Checker Tools**: For propagation verification
- **Timeline App**: Will be accessible via your custom domain

---

**🎉 Your Timeline App will be available at https://timeline.bikininjas.fr once configured!**
