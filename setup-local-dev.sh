#!/bin/bash

# Local Development Setup Script for Timeline App
# This script helps you set up a local development environment without requiring production secrets

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Timeline App - Local Development Setup${NC}"
echo "======================================"

# Function to prompt for user input
prompt_input() {
    local prompt="$1"
    local default="$2"
    local result
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " result
        echo "${result:-$default}"
    else
        read -p "$prompt: " result
        echo "$result"
    fi
}

# Check if .env already exists
if [ -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [[ ! $overwrite =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. Existing .env file preserved."
        exit 0
    fi
fi

echo -e "${BLUE}📝 Setting up local environment configuration...${NC}"
echo

# Copy example file
cp .env.example .env

echo -e "${GREEN}✅ Created .env file from template${NC}"
echo

# Database setup options
echo -e "${BLUE}🗄️  Database Configuration${NC}"
echo "Choose your database option:"
echo "1) SQLiteCloud (production-like)"
echo "2) Local SQLite file (offline development)"
echo "3) Skip database setup for now"
echo

db_choice=$(prompt_input "Select option (1-3)" "2")

case $db_choice in
    1)
        echo -e "${YELLOW}📡 SQLiteCloud Setup${NC}"
        sqlite_url=$(prompt_input "Enter your SQLiteCloud connection URL" "")
        if [ -n "$sqlite_url" ]; then
            sed -i "s|SQLITE_URL=.*|SQLITE_URL=$sqlite_url|" .env
            echo -e "${GREEN}✅ SQLiteCloud URL configured${NC}"
        fi
        ;;
    2)
        echo -e "${YELLOW}💾 Local SQLite Setup${NC}"
        local_db_path=$(prompt_input "Local database file path" "./timeline-local.db")
        sed -i "s|SQLITE_URL=.*|SQLITE_URL=sqlite:$local_db_path|" .env
        echo -e "${GREEN}✅ Local SQLite configured: $local_db_path${NC}"
        ;;
    3)
        echo -e "${YELLOW}⏭️  Database setup skipped${NC}"
        ;;
esac

echo

# GCP Configuration (optional)
echo -e "${BLUE}☁️  Google Cloud Configuration (Optional)${NC}"
read -p "Do you want to configure GCP settings for local testing? (y/N): " setup_gcp

if [[ $setup_gcp =~ ^[Yy]$ ]]; then
    gcp_project=$(prompt_input "GCP Project ID" "")
    if [ -n "$gcp_project" ]; then
        sed -i "s|GCP_PROJECT_ID=.*|GCP_PROJECT_ID=$gcp_project|" .env
        echo -e "${GREEN}✅ GCP Project ID configured${NC}"
    fi
    
    # Service account key setup
    echo
    echo "For local GCP testing, you can:"
    echo "1) Download a service account key JSON file"
    echo "2) Use 'gcloud auth application-default login'"
    echo "3) Skip GCP authentication setup"
    
    auth_choice=$(prompt_input "Select option (1-3)" "2")
    
    case $auth_choice in
        1)
            key_path=$(prompt_input "Path to service account key file" "./gcp-service-account-key.json")
            sed -i "s|GOOGLE_APPLICATION_CREDENTIALS=.*|GOOGLE_APPLICATION_CREDENTIALS=$key_path|" .env
            if [ ! -f "$key_path" ]; then
                echo -e "${YELLOW}⚠️  Service account key file not found at: $key_path${NC}"
                echo "   Please download it from GCP Console and place it at that location"
            fi
            ;;
        2)
            echo -e "${BLUE}💡 Run this command to authenticate with GCP:${NC}"
            echo "   gcloud auth application-default login"
            sed -i "s|GOOGLE_APPLICATION_CREDENTIALS=.*|# GOOGLE_APPLICATION_CREDENTIALS=./gcp-service-account-key.json|" .env
            ;;
        3)
            echo -e "${YELLOW}⏭️  GCP authentication setup skipped${NC}"
            ;;
    esac
fi

echo

# Development settings
echo -e "${BLUE}⚙️  Development Settings${NC}"
port=$(prompt_input "Development server port" "3000")
sed -i "s|PORT=.*|PORT=$port|" .env

# Create local development database if SQLite option was chosen
if [[ $db_choice == "2" ]]; then
    echo -e "${BLUE}🔧 Setting up local SQLite database...${NC}"
    
    # Create a simple initialization script
    cat > init-local-db.js << 'EOF'
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Get database path from .env or use default
const dbPath = process.env.SQLITE_URL?.replace('sqlite:', '') || './timeline-local.db';

console.log('Initializing local SQLite database:', dbPath);

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Create events table
    db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        headline TEXT NOT NULL,
        text_content TEXT NOT NULL,
        start_year INTEGER NOT NULL,
        start_month INTEGER,
        start_day INTEGER,
        media_url TEXT,
        media_caption TEXT,
        group_name TEXT,
        event_type TEXT NOT NULL,
        emotion TEXT NOT NULL
    )`);
    
    // Insert sample data
    db.run(`INSERT OR IGNORE INTO events 
        (headline, text_content, start_year, start_month, start_day, event_type, emotion)
        VALUES 
        ('Welcome to Timeline', 'This is your first timeline event!', 2024, 1, 1, 'good', 'joy'),
        ('Local Development', 'Successfully set up local development environment', 2025, 9, 1, 'good', 'satisfaction')`);
        
    console.log('✅ Local database initialized with sample data');
});

db.close();
EOF

    # Run the initialization if Node.js modules are available
    if [ -f "node_modules/sqlite3/package.json" ]; then
        node init-local-db.js
        rm init-local-db.js
    else
        echo -e "${YELLOW}⚠️  Node modules not found. Run 'npm install' or 'bun install' first, then:${NC}"
        echo "   node init-local-db.js"
    fi
fi

echo
echo -e "${GREEN}🎉 Local development environment setup complete!${NC}"
echo
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Install dependencies:"
echo "   npm install  # or bun install"
echo
echo "2. Start development server:"
echo "   npm run dev  # or bun run dev"
echo
echo "3. Open in browser:"
echo "   http://localhost:$port"
echo

if [[ $setup_gcp =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}☁️  GCP Testing (optional):${NC}"
    echo "1. Build Docker image: docker build -t timeline-app ."
    echo "2. Run locally: docker run -p $port:3000 --env-file .env timeline-app"
    echo
fi

echo -e "${BLUE}📁 Files created/modified:${NC}"
echo "- .env (local environment configuration)"
if [[ $db_choice == "2" ]]; then
    echo "- timeline-local.db (local SQLite database)"
fi
echo
echo -e "${YELLOW}🔒 Security note:${NC}"
echo "The .env file contains local configuration only."
echo "Production secrets remain secure in GitHub organization secrets."
