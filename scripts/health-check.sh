#!/bin/bash

# Health Check Script
# Verifies all services are running and healthy

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

FAILED=0

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}   Health Check - Pest Control CRM   ${NC}"
echo -e "${BLUE}======================================${NC}\n"

# Check Docker containers
echo -e "${YELLOW}Checking Docker containers...${NC}"
if docker-compose ps | grep -q "Up"; then
    RUNNING=$(docker-compose ps --services --filter "status=running" | wc -l)
    echo -e "${GREEN}✓ ${RUNNING} container(s) running${NC}"
    docker-compose ps
else
    echo -e "${RED}✗ No containers running${NC}"
    FAILED=1
fi
echo ""

# Check PostgreSQL
echo -e "${YELLOW}Checking PostgreSQL...${NC}"
if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    # Get database size
    DB_SIZE=$(docker-compose exec -T postgres psql -U postgres -d pestcontrol_dev -t -c "SELECT pg_size_pretty(pg_database_size('pestcontrol_dev'));" 2>/dev/null | tr -d ' ')
    # Get connection count
    CONNECTIONS=$(docker-compose exec -T postgres psql -U postgres -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname='pestcontrol_dev';" 2>/dev/null | tr -d ' ')
    echo -e "${GREEN}✓ PostgreSQL is healthy${NC}"
    echo -e "  Database size: ${DB_SIZE}"
    echo -e "  Active connections: ${CONNECTIONS}"
else
    echo -e "${RED}✗ PostgreSQL is not responding${NC}"
    FAILED=1
fi
echo ""

# Check Redis
echo -e "${YELLOW}Checking Redis...${NC}"
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    # Get Redis info
    REDIS_MEMORY=$(docker-compose exec -T redis redis-cli INFO memory 2>/dev/null | grep "used_memory_human" | cut -d: -f2 | tr -d '\r')
    REDIS_KEYS=$(docker-compose exec -T redis redis-cli DBSIZE 2>/dev/null | tr -d '\r')
    echo -e "${GREEN}✓ Redis is healthy${NC}"
    echo -e "  Memory used: ${REDIS_MEMORY}"
    echo -e "  Keys stored: ${REDIS_KEYS}"
else
    echo -e "${RED}✗ Redis is not responding${NC}"
    FAILED=1
fi
echo ""

# Check Backend API
echo -e "${YELLOW}Checking Backend API...${NC}"
if curl -f -s http://localhost:4000/health > /dev/null 2>&1; then
    BACKEND_RESPONSE=$(curl -s http://localhost:4000/health)
    echo -e "${GREEN}✓ Backend API is healthy${NC}"
    echo -e "  Response: ${BACKEND_RESPONSE}"

    # Check API documentation endpoint
    if curl -f -s http://localhost:4000/api/docs > /dev/null 2>&1; then
        echo -e "  API Docs: ${GREEN}Available at http://localhost:4000/api/docs${NC}"
    fi
else
    echo -e "${RED}✗ Backend API is not responding${NC}"
    echo -e "  Check logs: npm run docker:logs:backend"
    FAILED=1
fi
echo ""

# Check Frontend
echo -e "${YELLOW}Checking Frontend...${NC}"
if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is healthy${NC}"
    echo -e "  URL: http://localhost:3000"
else
    echo -e "${RED}✗ Frontend is not responding${NC}"
    echo -e "  Check logs: npm run docker:logs:frontend"
    FAILED=1
fi
echo ""

# Check disk space
echo -e "${YELLOW}Checking disk space...${NC}"
DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "${DISK_USAGE}" -lt 80 ]; then
    echo -e "${GREEN}✓ Disk space is adequate (${DISK_USAGE}% used)${NC}"
else
    echo -e "${YELLOW}⚠ Disk space is getting low (${DISK_USAGE}% used)${NC}"
fi
echo ""

# Check Docker volumes
echo -e "${YELLOW}Checking Docker volumes...${NC}"
VOLUME_COUNT=$(docker volume ls -q | grep pestcontrol | wc -l)
echo -e "${GREEN}✓ ${VOLUME_COUNT} volume(s) found${NC}"
docker volume ls | grep pestcontrol || true
echo ""

# Summary
echo -e "${BLUE}======================================${NC}"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All health checks passed!${NC}"
    echo -e "${BLUE}======================================${NC}\n"
    exit 0
else
    echo -e "${RED}Some health checks failed!${NC}"
    echo -e "${BLUE}======================================${NC}\n"
    echo -e "Troubleshooting steps:"
    echo -e "  1. Check logs: npm run docker:logs"
    echo -e "  2. Restart services: npm run docker:restart"
    echo -e "  3. Rebuild containers: npm run docker:up:build"
    echo -e "  4. See docs/DEVELOPMENT.md for more help\n"
    exit 1
fi
