#!/bin/bash

# Database Backup Script
# Creates a timestamped backup of the PostgreSQL database

set -e

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="pestcontrol_backup_${TIMESTAMP}.sql"
CONTAINER_NAME="pestcontrol-db"

# Database credentials from .env or defaults
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-pestcontrol_dev}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting database backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}Error: Database container '${CONTAINER_NAME}' is not running${NC}"
    echo "Start it with: npm run docker:up"
    exit 1
fi

# Create backup
echo -e "Creating backup: ${BACKUP_FILE}"
docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" > "${BACKUP_DIR}/${BACKUP_FILE}"

# Compress backup
echo -e "Compressing backup..."
gzip "${BACKUP_DIR}/${BACKUP_FILE}"

BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}.gz" | cut -f1)

echo -e "${GREEN}Backup created successfully!${NC}"
echo -e "File: ${BACKUP_DIR}/${BACKUP_FILE}.gz"
echo -e "Size: ${BACKUP_SIZE}"

# Clean up old backups (keep last 7 days)
echo -e "\nCleaning up old backups..."
find "${BACKUP_DIR}" -name "pestcontrol_backup_*.sql.gz" -type f -mtime +7 -delete
REMAINING=$(find "${BACKUP_DIR}" -name "pestcontrol_backup_*.sql.gz" -type f | wc -l)
echo -e "${GREEN}Cleanup complete. ${REMAINING} backup(s) remaining.${NC}"

exit 0
