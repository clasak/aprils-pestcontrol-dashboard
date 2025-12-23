#!/bin/bash

# Deploy Localhost Server (Local Services)
# This script starts services locally without Docker for faster development

set -e

echo "🚀 Deploying Localhost Server (Local Services)..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo "⚠️  .env file not found. Creating default .env file..."
  cat > .env << 'EOF'
# Application Environment
NODE_ENV=development
BUILD_TARGET=development

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=pestcontrol_dev
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:password@localhost:5432/pestcontrol_dev
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=pestcontrol_dev

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_URL=redis://localhost:6379

# Application Ports
BACKEND_PORT=4000
FRONTEND_PORT=5173

# Backend API Configuration
PORT=4000
CORS_ORIGINS=http://localhost:8080
ENABLE_API_DOCS=true

# Frontend Configuration
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000

# JWT Authentication
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Third-party Services (Optional - leave empty for development)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
SENDGRID_API_KEY=
FROM_EMAIL=noreply@aprilspestcontrol.com
STRIPE_SECRET_KEY=
STRIPE_PUBLIC_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
GOOGLE_MAPS_API_KEY=
VITE_GOOGLE_MAPS_API_KEY=

# Development Tools
PGADMIN_EMAIL=admin@aprilspestcontrol.com
PGADMIN_PASSWORD=admin
PGADMIN_PORT=5050
REDIS_COMMANDER_PORT=8081
EOF
  echo "✅ Created default .env file. Please review and update with your configuration if needed."
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js 20+ and try again."
  exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "⚠️  Node.js version 20+ is recommended. Current version: $(node -v)"
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Check if backend dependencies are installed
if [ ! -d "src/backend/node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  cd src/backend && npm install && cd ../..
fi

# Check if frontend dependencies are installed
if [ ! -d "src/frontend/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  cd src/frontend && npm install && cd ../..
fi

# Check if PostgreSQL is running (optional - can use Docker for DB only)
if command -v psql &> /dev/null; then
  if psql -h localhost -U postgres -d pestcontrol_dev -c "SELECT 1" > /dev/null 2>&1; then
    echo "✅ PostgreSQL connection verified"
  else
    echo "⚠️  PostgreSQL not accessible. Starting Docker database services..."
    docker-compose up -d postgres redis
    echo "⏳ Waiting for database to be ready..."
    sleep 5
  fi
else
  echo "⚠️  PostgreSQL client not found. Starting Docker database services..."
  docker-compose up -d postgres redis
  echo "⏳ Waiting for database to be ready..."
  sleep 5
fi

# Run database migrations
echo "🔄 Running database migrations..."
npm run db:migrate || echo "⚠️  Migration failed or already applied"

# Start services
echo ""
echo "🚀 Starting services..."
echo ""

# Start backend and frontend concurrently
npm run dev &
DEV_PID=$!

# Function to cleanup on exit
cleanup() {
  echo ""
  echo "🛑 Stopping services..."
  kill $DEV_PID 2>/dev/null || true
  wait $DEV_PID 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait a bit for services to start
sleep 5

# Check if services are running
echo "📊 Checking service health..."

# Check Backend (health endpoint is at root /health)
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if command -v curl > /dev/null 2>&1; then
    if curl -f http://localhost:4000/health > /dev/null 2>&1; then
      echo "✅ Backend API is ready"
      break
    fi
  elif command -v wget > /dev/null 2>&1; then
    if wget --quiet --spider http://localhost:4000/health > /dev/null 2>&1; then
      echo "✅ Backend API is ready"
      break
    fi
  else
    # Skip health check if no HTTP client available
    echo "⚠️  No HTTP client found (curl/wget), skipping health check"
    break
  fi
  attempt=$((attempt + 1))
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "⚠️  Backend API is still starting..."
fi

# Check Frontend
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if command -v curl > /dev/null 2>&1; then
    if curl -f http://localhost:8080 > /dev/null 2>&1; then
      echo "✅ Frontend is ready"
      break
    fi
  elif command -v wget > /dev/null 2>&1; then
    if wget --quiet --spider http://localhost:8080 > /dev/null 2>&1; then
      echo "✅ Frontend is ready"
      break
    fi
  else
    # Skip health check if no HTTP client available
    echo "⚠️  No HTTP client found (curl/wget), skipping health check"
    break
  fi
  attempt=$((attempt + 1))
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "⚠️  Frontend is still starting..."
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉 Localhost Server Deployed Successfully!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📍 Services:"
echo "   Frontend:    http://localhost:8080"
echo "   Backend API: http://localhost:4000/api/v1"
echo "   API Docs:    http://localhost:4000/api/docs"
echo ""
echo "💡 Hot reload is enabled - changes will auto-reload"
echo ""
echo "🛑 Press Ctrl+C to stop all services"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Keep script running
wait $DEV_PID

