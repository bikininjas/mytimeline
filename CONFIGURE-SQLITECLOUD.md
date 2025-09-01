# 🔧 Configure SQLiteCloud Database for Production

## Current Issue:
Your Cloud Run app is not using your SQLiteCloud.io database because:
1. The environment variable name was incorrect (`SQLITECLOUD_TIMELINE_CONNECTION_STRING` vs `SQLITE_URL`)
2. The GitHub organization secret needs to be updated

## ✅ Fixed:
1. **Environment Variable**: Updated CI/CD workflow to use `SQLITE_URL` (matches server.js)

## 🔑 Manual Step Required:

### Update GitHub Organization Secret:

1. **Go to GitHub Organization Settings:**
   ```
   https://github.com/organizations/bikininjas/settings/secrets/actions
   ```

2. **Find and edit the secret:** `SQLITECLOUD_TIMELINE_CONNECTION_STRING`

3. **Update the value to your SQLiteCloud connection string:**
   ```
   sqlitecloud://ckh6bsdlhk.g2.sqlite.cloud:8860/timeline?apikey=1gJIUSUbGWZrTmDHqo4qTYEMDilhPUppQtPgqUusLvY
   ```

## 🚀 Deploy with SQLiteCloud:

After updating the secret, trigger a new deployment:

```bash
gh workflow run ci-cd.yml
```

## 🔍 Verification:

Once deployed, your Cloud Run app will:
- ✅ Use your SQLiteCloud.io database
- ✅ Share data between local development and production  
- ✅ Persist data in the cloud
- ✅ Have the same timeline events in both environments

## 📊 Expected Result:

- **Local Development**: Uses `.env` file → SQLiteCloud
- **Production (Cloud Run)**: Uses GitHub secret → Same SQLiteCloud database
- **Data Sync**: Both environments share the same database
