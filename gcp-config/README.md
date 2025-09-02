# Google Cloud Domain Configuration

This directory contains the necessary configuration files and documentation for setting up the custom domain `timeline.bikininjas.fr` for the Timeline App deployed on Google Cloud Run.

## 📁 Directory Contents

### Documentation
- **`PULSEHEBERG_DNS_SETUP.md`** - DNS configuration instructions for Pulseheberg registrar
- **`DOMAIN_SETUP_GUIDE.md`** - Comprehensive domain setup guide
- **`README.md`** - This file

### Scripts
- **`domain-manager.sh`** - Automated domain management script

## 🎯 Quick Start

### Prerequisites
1. **Domain**: `bikininjas.fr` registered with Pulseheberg
2. **Google Cloud**: Project with Cloud Run API enabled
3. **Timeline App**: Already deployed to Cloud Run
4. **Access**: DNS management access in Pulseheberg

### Option 1: Automatic with Deployment (Recommended)

1. **Configure DNS in Pulseheberg**:
   ```
   Type: CNAME
   Name: timeline
   Target: ghs.googlehosted.com.
   TTL: 300
   ```

2. **Deploy your app** - The CI/CD workflow will automatically attempt domain setup

3. **Check workflow summary** for status and any required actions

### Option 2: Manual Domain Setup

1. **Configure DNS first** (see above)

2. **Run the "Setup Custom Domain" workflow** manually from GitHub Actions

### Option 3: Command Line

```bash
# Set your project ID
export PROJECT_ID="your-gcp-project-id"

# Complete setup
./gcp-config/domain-manager.sh setup-complete -p $PROJECT_ID

# Or individual steps
./gcp-config/domain-manager.sh verify-dns -p $PROJECT_ID
./gcp-config/domain-manager.sh create-mapping -p $PROJECT_ID
```

## 🌐 Domain Configuration

### Fixed Configuration
- **URL**: `https://timeline.bikininjas.fr`
- **Purpose**: Production Timeline App
- **SSL**: Automatic Google-managed certificate
- **Region**: Europe West 9 (Paris)
- **Registrar**: Pulseheberg

## 🔧 DNS Configuration Summary

Add this CNAME record in your Pulseheberg DNS management:

```
Host: timeline
Type: CNAME
Target: ghs.googlehosted.com.
TTL: 300
```

## 📋 Setup Checklist

- [ ] **DNS Configuration**
  - [ ] CNAME record added in Pulseheberg
  - [ ] DNS propagation verified (5-15 minutes)
  
- [ ] **Domain Verification**
  - [ ] Domain verified in Google Search Console
  - [ ] TXT verification record added if needed
  
- [ ] **Google Cloud Setup**
  - [ ] Cloud Run service deployed and running
  - [ ] Domain mapping created
  - [ ] SSL certificate provisioned (15min-24hrs)
  
- [ ] **Testing**
  - [ ] HTTP redirects to HTTPS
  - [ ] HTTPS access working
  - [ ] Application loads correctly

## 🛠️ Troubleshooting

### Common Issues

1. **DNS Not Resolving**
   - Check CNAME record in Pulseheberg
   - Wait for DNS propagation (up to 48 hours)
   - Verify using `nslookup timeline.bikininjas.fr`

2. **Domain Verification Failed**
   - Verify `bikininjas.fr` in Google Search Console
   - Add TXT verification record if required

3. **SSL Certificate Pending**
   - Wait 15 minutes to 24 hours for provisioning
   - Check domain mapping status in Cloud Console

### Useful Commands

```bash
# Check DNS resolution
nslookup timeline.bikininjas.fr

# Use the domain manager script
./gcp-config/domain-manager.sh check-status -p YOUR_PROJECT_ID

# Test HTTPS access
curl -I https://timeline.bikininjas.fr
```

## 📞 Support Resources

- **Pulseheberg Support**: For DNS configuration issues
- **Google Cloud Console**: For domain mapping and SSL status
- **Online DNS Checkers**: 
  - https://www.whatsmydns.net/#CNAME/timeline.bikininjas.fr
  - https://dnschecker.org/#CNAME/timeline.bikininjas.fr

## 🎉 Success

Once setup is complete, your Timeline App will be available at:
**https://timeline.bikininjas.fr**

The domain will have:
- ✅ Automatic HTTPS with Google-managed SSL certificate
- ✅ HTTP to HTTPS redirect
- ✅ High availability through Google Cloud infrastructure
- ✅ European data residency (Paris region)

## 🔄 Maintenance

- **SSL Certificate**: Automatically renewed by Google
- **DNS Changes**: Update records in Pulseheberg DNS management
- **Service Updates**: Deploy new versions through existing CI/CD pipeline
- **Monitoring**: GitHub Actions workflows provide status monitoring

---

For detailed instructions, see the guide files in this directory.
