# Development Dockerfile for Backend (NestJS)
FROM node:20-alpine

# Install necessary build tools
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy workspace root package files
COPY package*.json ./
COPY src/backend/package*.json ./src/backend/
COPY src/shared/package*.json ./src/shared/

# Install all dependencies (including workspace dependencies)
RUN npm install

# Copy source code
COPY src/backend ./src/backend
COPY src/shared ./src/shared

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:4000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Set working directory to backend
WORKDIR /app/src/backend

# Start development server
CMD ["npm", "run", "dev"]
