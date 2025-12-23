#!/bin/bash

# Deploy Development Server (Docker-based)
# This script starts all services in Docker containers for development

set -e

echo "🚀 Deploying Development Server (Docker)..."
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
DATABASE_URL=postgresql://postgres:password@postgres:5432/pestcontrol_dev
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=pestcontrol_dev

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_URL=redis://redis:6379

# Application Ports
BACKEND_PORT=4000
FRONTEND_PORT=8080

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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service health
echo ""
echo "📊 Checking service health..."

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
  echo "✅ PostgreSQL is ready"
else
  echo "⚠️  PostgreSQL is starting..."
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
  echo "✅ Redis is ready"
else
  echo "⚠️  Redis is starting..."
fi

# Check Backend (health endpoint is at root /health, not /api/v1/health)
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
    # Just check if container is running
    if docker-compose ps backend | grep -q "Up"; then
      echo "✅ Backend container is running"
      break
    fi
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
    # Just check if container is running
    if docker-compose ps frontend | grep -q "Up"; then
      echo "✅ Frontend container is running"
      break
    fi
  fi
  attempt=$((attempt + 1))
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "⚠️  Frontend is still starting..."
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉 Development Server Deployed Successfully!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📍 Services:"
echo "   Frontend:    http://localhost:8080"
echo "   Backend API: http://localhost:4000/api/v1"
echo "   API Docs:    http://localhost:4000/api/docs"
echo "   PostgreSQL:  localhost:5432"
echo "   Redis:       localhost:6379"
echo ""
echo "🔧 Management Commands:"
echo "   View logs:    docker-compose logs -f"
echo "   Stop:         docker-compose down"
echo "   Restart:      docker-compose restart"
echo "   Status:       docker-compose ps"
echo ""
echo "🛠️  Development Tools (optional):"
echo "   pgAdmin:      docker-compose --profile tools up -d pgadmin"
echo "   Redis UI:     docker-compose --profile tools up -d redis-commander"
echo ""
echo "═══════════════════════════════════════════════════════════"

