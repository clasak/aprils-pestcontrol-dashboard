#!/bin/bash

# Database Restore Script
# Restores a PostgreSQL database from a backup file

set -e

# Configuration
BACKUP_DIR="./backups"
CONTAINER_NAME="pestcontrol-db"

# Database credentials from .env or defaults
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-pestcontrol_dev}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lh "${BACKUP_DIR}"/*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    echo -e "${RED}Error: Backup file '${BACKUP_FILE}' not found${NC}"
    exit 1
fi

echo -e "${YELLOW}WARNING: This will completely replace the current database!${NC}"
echo -e "Database: ${DB_NAME}"
echo -e "Backup: ${BACKUP_FILE}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Restore cancelled${NC}"
    exit 0
fi

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}Error: Database container '${CONTAINER_NAME}' is not running${NC}"
    echo "Start it with: npm run docker:up"
    exit 1
fi

# Create a safety backup before restore
echo -e "${YELLOW}Creating safety backup before restore...${NC}"
SAFETY_BACKUP="pestcontrol_pre_restore_$(date +"%Y%m%d_%H%M%S").sql"
docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" > "${BACKUP_DIR}/${SAFETY_BACKUP}"
gzip "${BACKUP_DIR}/${SAFETY_BACKUP}"
echo -e "${GREEN}Safety backup created: ${BACKUP_DIR}/${SAFETY_BACKUP}.gz${NC}"

# Decompress if needed
TEMP_FILE="${BACKUP_FILE}"
if [[ "${BACKUP_FILE}" == *.gz ]]; then
    echo -e "Decompressing backup..."
    TEMP_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "${BACKUP_FILE}" > "${TEMP_FILE}"
fi

# Drop existing connections
echo -e "Terminating existing database connections..."
docker exec -t "${CONTAINER_NAME}" psql -U "${DB_USER}" -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${DB_NAME}' AND pid <> pg_backend_pid();"

# Drop and recreate database
echo -e "Dropping and recreating database..."
docker exec -t "${CONTAINER_NAME}" psql -U "${DB_USER}" -c "DROP DATABASE IF EXISTS ${DB_NAME};"
docker exec -t "${CONTAINER_NAME}" psql -U "${DB_USER}" -c "CREATE DATABASE ${DB_NAME};"

# Restore backup
echo -e "Restoring backup..."
cat "${TEMP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}"

# Clean up temp file if we decompressed
if [[ "${BACKUP_FILE}" == *.gz ]] && [ -f "${TEMP_FILE}" ]; then
    rm "${TEMP_FILE}"
fi

echo -e "${GREEN}Database restored successfully!${NC}"
echo -e "Safety backup saved at: ${BACKUP_DIR}/${SAFETY_BACKUP}.gz"

exit 0
