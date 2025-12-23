#!/bin/bash

# Kill any process on port 3001 (Branch360)
echo "Stopping any process on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 2

# Navigate to frontend directory
cd "$(dirname "$0")/src/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the dev server
echo "Starting frontend dev server on http://localhost:3001..."
npm run dev

