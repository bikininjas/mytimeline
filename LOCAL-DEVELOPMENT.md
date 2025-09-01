# Local Development Setup Guide 💻

This guide helps you set up a local development environment for the Timeline App without requiring access to production secrets.

## 🚀 Quick Start

### 1. Run the Setup Script

```bash
./setup-local-dev.sh
```

This interactive script will:
- ✅ Create a local `.env` file
- ✅ Configure database options (local SQLite or SQLiteCloud)
- ✅ Set up GCP configuration (optional)
- ✅ Initialize local database with sample data

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using Bun (recommended)
bun install
```

### 3. Start Development Server

```bash
# Using npm
npm run dev

# Using Bun
bun run dev
```

### 4. Open in Browser

Visit: http://localhost:3000

## 🗄️ Database Options

### Option 1: Local SQLite (Recommended for Development)

**Pros:**
- ✅ Works offline
- ✅ No external dependencies
- ✅ Fast for development
- ✅ No cost

**Setup:**
```bash
# Automatically configured by setup script
SQLITE_URL=sqlite:./timeline-local.db
```

### Option 2: SQLiteCloud (Production-like)

**Pros:**
- ✅ Same as production
- ✅ Shared across team
- ✅ Real cloud database

**Cons:**
- ❌ Requires internet connection
- ❌ May have usage limits/costs

**Setup:**
```bash
# Get connection string from SQLiteCloud dashboard
SQLITE_URL=sqlitecloud://your-project.sqlite.cloud:8860/your-database?apikey=your-api-key
```

## ☁️ Google Cloud Setup (Optional)

For testing GCP deployment locally:

### Option 1: Application Default Credentials (Recommended)

```bash
# Authenticate with your Google account
gcloud auth application-default login

# Set your project
gcloud config set project your-project-id
```

### Option 2: Service Account Key

1. Download service account key from GCP Console
2. Place it in the project directory
3. Update `.env`:
```bash
GOOGLE_APPLICATION_CREDENTIALS=./gcp-service-account-key.json
```

## 🐳 Docker Testing

Test your changes with Docker (simulates cloud deployment):

```bash
# Build image
docker build -t timeline-app .

# Run container
docker run -p 3000:3000 --env-file .env timeline-app
```

## 🔧 Development Features

### Hot Reload

The development server automatically restarts when you change files:

```bash
# Watches for file changes
bun run dev
```

### Debug Mode

Enable detailed logging in `.env`:

```bash
LOG_LEVEL=debug
ENABLE_DEBUG=true
```

### Local Database Management

**View database:**
```bash
# If using local SQLite
sqlite3 timeline-local.db "SELECT * FROM events;"
```

**Reset database:**
```bash
# Delete local database file
rm timeline-local.db

# Restart the application to recreate
npm run dev
```

## 📁 Project Structure

```
timeline-app/
├── .env                    # Local environment config (not in git)
├── .env.example           # Environment template
├── server.js              # Main application server
├── public/                # Static web files
├── timeline-local.db      # Local SQLite database (not in git)
├── setup-local-dev.sh     # Development setup script
└── .github/workflows/     # CI/CD workflows
```

## 🚨 Troubleshooting

### Issue: Database Connection Error

**Solution:**
```bash
# Check your SQLITE_URL in .env
cat .env | grep SQLITE_URL

# For local SQLite, ensure the database file exists
ls -la timeline-local.db
```

### Issue: Port Already in Use

**Solution:**
```bash
# Change port in .env
PORT=3001

# Or kill process using port 3000
sudo lsof -ti:3000 | xargs kill
```

### Issue: Module Not Found

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
# or
bun install
```

### Issue: GCP Authentication Error

**Solution:**
```bash
# Re-authenticate
gcloud auth application-default login

# Check current auth
gcloud auth list
```

## 🔄 Syncing with Production

### Environment Variables

Local `.env` vs Production secrets:

| Local (.env) | Production (GitHub Secrets) |
|--------------|----------------------------|
| `SQLITE_URL` | `SQLITECLOUD_TIMELINE_CONNECTION_STRING` |
| `GCP_PROJECT_ID` | `GCP_PROJECT_ID` |
| `GOOGLE_APPLICATION_CREDENTIALS` | `GCS_GH_SVC_ACCOUNT_JSON_KEY` |

### Testing Production-like Environment

```bash
# Set production-like environment
NODE_ENV=production npm start

# Test with minimal resources (like Cloud Run)
docker run -m 128m --cpus="0.08" -p 3000:3000 timeline-app
```

## 📝 Development Workflow

1. **Make changes** to code
2. **Test locally** with `npm run dev`
3. **Test with Docker** (optional)
4. **Commit and push** to GitHub
5. **GitHub Actions** automatically deploys to Cloud Run

## 🛡️ Security Notes

- ✅ **Local .env** contains only development configuration
- ✅ **Production secrets** remain in GitHub organization secrets
- ✅ **Service account keys** (if used) are gitignored
- ✅ **Local database** contains only test data

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review the main README.md
3. Check GitHub Actions logs for deployment issues
4. Create an issue in the repository

---

**Happy coding! 🎉**
