#!/bin/bash

# Exit on error
set -e

# Graceful cleanup of background tasks
cleanup() {
  echo ""
  echo "🛑 Shutting down backend and frontend servers..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

echo "======================================================="
echo "   Emak AI Titip MVP Startup System"
echo "======================================================="

# Verify Go backend is built
if [ ! -f "backend/emak-ai-backend" ]; then
  echo "🔨 Compiling Go backend..."
  (cd backend && go build -o emak-ai-backend)
fi

echo "🚀 Starting Go Backend Server (port 8080)..."
(cd backend && ./emak-ai-backend) &

echo "🚀 Starting React Frontend Dev Server (port 5173)..."
(cd frontend && bun run dev) &

echo ""
echo "👉 control panel URL: http://localhost:5173"
echo "👉 Press Ctrl+C to terminate both servers"
echo "======================================================="

# Keep script active
wait
