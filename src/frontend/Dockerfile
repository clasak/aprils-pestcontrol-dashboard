# Development Dockerfile for Frontend (React + Vite)
FROM node:20-alpine

WORKDIR /app

# Copy workspace root package files
COPY package*.json ./
COPY src/frontend/package*.json ./src/frontend/
COPY src/shared/package*.json ./src/shared/

# Install all dependencies
RUN npm install

# Copy source code
COPY src/frontend ./src/frontend
COPY src/shared ./src/shared

# Expose Vite dev server port
EXPOSE 3000

# Health check (Vite dev server)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Set working directory to frontend
WORKDIR /app/src/frontend

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
