#!/bin/bash

# Timeline App Management Script
# This script manages the Node.js timeline application server

# Configuration
APP_NAME="timeline-app"
APP_DIR="/home/seb/GITRepos/timeline-app"
PID_FILE="$APP_DIR/.server.pid"
LOG_FILE="$APP_DIR/server.log"
PORT=3000

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Function to check if server is running
is_server_running() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            return 0  # Server is running
        else
            # PID file exists but process is not running
            rm -f "$PID_FILE"
            return 1  # Server is not running
        fi
    else
        return 1  # Server is not running
    fi
}

# Function to check if port is in use
is_port_in_use() {
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is not in use
    fi
}

# Function to start the server
start_server() {
    print_info "Starting $APP_NAME server..."

    # Check if server is already running
    if is_server_running; then
        print_warning "Server is already running (PID: $(cat "$PID_FILE"))"
        return 1
    fi

    # Check if port is in use by another process and kill it
    if is_port_in_use; then
        print_warning "Port $PORT is already in use by another process. Attempting to free it..."
        local pids=$(lsof -ti :$PORT 2>/dev/null)
        if [ ! -z "$pids" ]; then
            echo "$pids" | xargs kill -9 2>/dev/null
            print_info "Killed process(es) using port $PORT"
            # Wait for port to be freed
            sleep 2
        fi

        # Double-check if port is still in use
        if is_port_in_use; then
            print_error "Failed to free port $PORT. Please manually kill the process and try again."
            return 1
        fi
    fi

    # Navigate to app directory
    cd "$APP_DIR" || {
        print_error "Failed to navigate to $APP_DIR"
        return 1
    }

    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in $APP_DIR"
        return 1
    fi

    # Start the server in background
    print_info "Launching server in background..."
    nohup npm start > "$LOG_FILE" 2>&1 &
    SERVER_PID=$!

    # Wait a moment for server to start
    sleep 2

    # Check if server started successfully
    if ps -p "$SERVER_PID" > /dev/null 2>&1; then
        echo $SERVER_PID > "$PID_FILE"
        print_status "Server started successfully (PID: $SERVER_PID)"
        print_info "Server is running on http://localhost:$PORT"
        print_info "Logs are available at: $LOG_FILE"
        return 0
    else
        print_error "Failed to start server"
        print_info "Check logs at: $LOG_FILE"
        return 1
    fi
}

# Function to stop the server
stop_server() {
    print_info "Stopping $APP_NAME server..."

    if ! is_server_running; then
        print_warning "Server is not running"
        return 1
    fi

    PID=$(cat "$PID_FILE")
    print_info "Stopping server process (PID: $PID)..."

    # Try graceful shutdown first
    kill -TERM "$PID" 2>/dev/null

    # Wait for server to stop gracefully
    for i in {1..10}; do
        if ! ps -p "$PID" > /dev/null 2>&1; then
            break
        fi
        sleep 1
    done

    # Force kill if still running
    if ps -p "$PID" > /dev/null 2>&1; then
        print_warning "Server didn't stop gracefully, force killing..."
        kill -KILL "$PID" 2>/dev/null
        sleep 1
    fi

    # Clean up PID file
    rm -f "$PID_FILE"

    if ps -p "$PID" > /dev/null 2>&1; then
        print_error "Failed to stop server"
        return 1
    else
        print_status "Server stopped successfully"
        return 0
    fi
}

# Function to restart the server
restart_server() {
    print_info "Restarting $APP_NAME server..."

    if is_server_running; then
        stop_server
        sleep 2
    fi

    start_server
}

# Function to force restart (kill all processes on port)
force_restart_server() {
    print_info "Force restarting $APP_NAME server..."

    # Kill any process using the port
    if is_port_in_use; then
        local pids=$(lsof -ti :$PORT 2>/dev/null)
        if [ ! -z "$pids" ]; then
            echo "$pids" | xargs kill -9 2>/dev/null
            print_info "Killed process(es) using port $PORT"
            sleep 2
        fi
    fi

    # Clean up any existing PID file
    if [ -f "$PID_FILE" ]; then
        rm -f "$PID_FILE"
    fi

    start_server
}

# Function to check server status
check_status() {
    if is_server_running; then
        PID=$(cat "$PID_FILE")
        print_status "Server is running (PID: $PID)"
        print_info "Server URL: http://localhost:$PORT"
        print_info "Log file: $LOG_FILE"

        # Check if server is responding
        if curl -s --max-time 5 http://localhost:$PORT > /dev/null 2>&1; then
            print_status "Server is responding to requests"
        else
            print_warning "Server is running but not responding to requests"
        fi
    else
        print_warning "Server is not running"

        # Check if port is still in use
        if is_port_in_use; then
            print_warning "Port $PORT is still in use by another process"
        fi
    fi
}

# Function to show server logs
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        print_info "Showing last 50 lines of server logs:"
        echo "----------------------------------------"
        tail -50 "$LOG_FILE"
        echo "----------------------------------------"
        print_info "Full logs available at: $LOG_FILE"
    else
        print_warning "Log file not found: $LOG_FILE"
    fi
}

# Function to clean up log files
cleanup_logs() {
    print_info "Cleaning up log files..."

    if [ -f "$LOG_FILE" ]; then
        rm -f "$LOG_FILE"
        print_status "Log file cleaned up"
    else
        print_warning "No log file found to clean up"
    fi

    if [ -f "$PID_FILE" ]; then
        rm -f "$PID_FILE"
        print_status "PID file cleaned up"
    fi
}

# Function to wipe the database
wipe_database() {
    print_warning "⚠️  WARNING: This will permanently delete ALL data from the database!"
    echo -n "Are you sure you want to continue? (type 'yes' to confirm): "
    read -r confirmation

    if [ "$confirmation" != "yes" ]; then
        print_info "Database wipe cancelled."
        return 1
    fi

    print_info "Wiping database..."

    # Check if .env file exists
    if [ ! -f "$APP_DIR/.env" ]; then
        print_error ".env file not found. Please ensure the environment is properly configured."
        return 1
    fi

    # Extract SQLITE_URL from .env file
    SQLITE_URL=$(grep "^SQLITE_URL=" "$APP_DIR/.env" | cut -d '=' -f2-)

    if [ -z "$SQLITE_URL" ]; then
        print_error "SQLITE_URL not found in .env file"
        return 1
    fi

    # Create a temporary Node.js script to wipe the database
    cat > "$APP_DIR/temp_wipe_db.js" << 'EOF'
const { Database } = require("@sqlitecloud/drivers");
require('dotenv').config();

async function wipeDatabase() {
  const db = new Database(process.env.SQLITE_URL);
  try {
    console.log('Connected to database...');

    // Get all table names
    const tablesResult = await db.sql("SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence'");
    const tables = tablesResult.map(row => row.name);

    if (tables.length === 0) {
      console.log('No tables found in database');
      return;
    }

    console.log('Found tables:', tables.join(', '));

    // Delete all data from each table
    for (const table of tables) {
      console.log(`Clearing table: ${table}`);
      await db.sql(`DELETE FROM ${table}`);
    }

    // Reset auto-increment counters
    for (const table of tables) {
      try {
        await db.sql(`DELETE FROM sqlite_sequence WHERE name='${table}'`);
      } catch (error) {
        // Ignore errors for tables without auto-increment
      }
    }

    console.log('Database wipe completed successfully');
  } catch (error) {
    console.error('Error wiping database:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

wipeDatabase().catch(console.error);
EOF

    # Navigate to app directory and run the wipe script
    cd "$APP_DIR" || {
        print_error "Failed to navigate to $APP_DIR"
        return 1
    }

    # Run the database wipe script
    if node temp_wipe_db.js; then
        print_status "✅ Database wiped successfully!"
        print_info "All data has been permanently deleted from the database."

        # Clean up temporary file
        rm -f temp_wipe_db.js

        return 0
    else
        print_error "❌ Failed to wipe database"
        rm -f temp_wipe_db.js
        return 1
    fi
}

# Function to show help
show_help() {
    echo "Timeline App Management Script"
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start         Start the server in background (auto-frees port if needed)"
    echo "  stop          Stop the server gracefully"
    echo "  restart       Restart the server gracefully"
    echo "  force-restart Force restart (kills all processes on port 3000)"
    echo "  status        Check server status"
    echo "  logs          Show server logs"
    echo "  cleanup       Clean up log and PID files"
    echo "  wipe-db       ⚠️  COMPLETELY WIPE ALL DATABASE DATA"
    echo "  help          Show this help message"
    echo ""
    echo "Features:"
    echo "  • Automatic port management - frees port 3000 if occupied"
    echo "  • Background process monitoring"
    echo "  • Graceful server shutdown"
    echo "  • Colored status output"
    echo ""
    echo "Examples:"
    echo "  $0 start          # Start server (auto-frees port if needed)"
    echo "  $0 force-restart  # Force restart (kills everything on port 3000)"
    echo "  $0 status         # Check if server is running"
    echo "  $0 logs           # View server logs"
    echo "  $0 wipe-db        # ⚠️  Delete ALL data (requires confirmation)"
    echo "  $0 stop           # Stop the server"
}

# Main script logic
case "${1:-help}" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    force-restart)
        force_restart_server
        ;;
    status)
        check_status
        ;;
    logs)
        show_logs
        ;;
    cleanup)
        cleanup_logs
        ;;
    wipe-db)
        wipe_database
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
