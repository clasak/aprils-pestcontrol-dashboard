#!/bin/bash

# Rollback Script for Production Deployments
# Reverts to the previous Docker image version

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting rollback procedure...${NC}"

# Check if we're in production
if [ "${NODE_ENV}" != "production" ]; then
    echo -e "${RED}Error: This script should only be run in production${NC}"
    echo "Current NODE_ENV: ${NODE_ENV}"
    read -p "Are you sure you want to continue? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        exit 1
    fi
fi

# Create backup before rollback
echo -e "${YELLOW}Creating database backup before rollback...${NC}"
./scripts/backup-database.sh

# Get list of previous images
echo -e "\nAvailable previous versions:"
docker images --format "{{.Repository}}:{{.Tag}} ({{.CreatedAt}})" | grep pestcontrol | head -5

# Pull previous version tags
BACKEND_PREV_TAG="${BACKEND_ROLLBACK_TAG:-previous}"
FRONTEND_PREV_TAG="${FRONTEND_ROLLBACK_TAG:-previous}"

echo -e "\n${YELLOW}Rolling back to:${NC}"
echo -e "Backend: ${BACKEND_PREV_TAG}"
echo -e "Frontend: ${FRONTEND_PREV_TAG}"

read -p "Continue with rollback? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Rollback cancelled${NC}"
    exit 0
fi

# Stop current containers
echo -e "\nStopping current containers..."
docker-compose -f docker-compose.prod.yml stop backend frontend

# Tag current images as 'broken' for debugging
docker tag pestcontrol-backend:latest pestcontrol-backend:broken-$(date +%Y%m%d-%H%M%S)
docker tag pestcontrol-frontend:latest pestcontrol-frontend:broken-$(date +%Y%m%d-%H%M%S)

# Start with previous version
echo -e "\nStarting previous version..."
BACKEND_TAG="${BACKEND_PREV_TAG}" FRONTEND_TAG="${FRONTEND_PREV_TAG}" \
  docker-compose -f docker-compose.prod.yml up -d backend frontend

# Wait for services to be healthy
echo -e "\nWaiting for services to be healthy..."
sleep 30

# Health check
echo -e "\nRunning health checks..."
if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    echo -e "${GREEN}Backend health check passed${NC}"
else
    echo -e "${RED}Backend health check failed!${NC}"
    echo -e "${YELLOW}Check logs: docker-compose -f docker-compose.prod.yml logs backend${NC}"
    exit 1
fi

if curl -f http://localhost:80/health > /dev/null 2>&1; then
    echo -e "${GREEN}Frontend health check passed${NC}"
else
    echo -e "${RED}Frontend health check failed!${NC}"
    echo -e "${YELLOW}Check logs: docker-compose -f docker-compose.prod.yml logs frontend${NC}"
    exit 1
fi

echo -e "\n${GREEN}Rollback completed successfully!${NC}"
echo -e "Previous version is now running."
echo -e "\nBroken images tagged for debugging:"
docker images | grep broken

echo -e "\nTo investigate the issue, check logs:"
echo -e "  docker logs pestcontrol-backend-broken"
echo -e "  docker logs pestcontrol-frontend-broken"

exit 0
