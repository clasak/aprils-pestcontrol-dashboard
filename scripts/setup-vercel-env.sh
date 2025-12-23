#!/bin/bash

# Vercel Environment Variables Setup Script
# This script helps configure environment variables for Vercel deployment

set -e

echo "🚀 Vercel Environment Variables Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Vercel CLI is available
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx not found. Please install Node.js${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Current Vercel Projects:${NC}"
npx vercel projects ls 2>/dev/null || {
    echo -e "${RED}❌ Not logged in to Vercel. Run: npx vercel login${NC}"
    exit 1
}

echo ""
echo -e "${YELLOW}⚠️  You need to provide your Supabase credentials${NC}"
echo ""
echo "To get your Supabase credentials:"
echo "1. Go to: https://app.supabase.com"
echo "2. Select your project (or create one)"
echo "3. Go to Settings → API"
echo "4. Copy the Project URL and anon/public key"
echo ""

# Prompt for Supabase URL
read -p "Enter your SUPABASE_URL (e.g., https://xxxxx.supabase.co): " SUPABASE_URL

if [ -z "$SUPABASE_URL" ]; then
    echo -e "${RED}❌ Supabase URL is required${NC}"
    exit 1
fi

# Prompt for Supabase Anon Key
read -p "Enter your SUPABASE_ANON_KEY (starts with eyJ...): " SUPABASE_ANON_KEY

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}❌ Supabase Anon Key is required${NC}"
    exit 1
fi

# Prompt for project name
echo ""
echo -e "${BLUE}📦 Available projects:${NC}"
npx vercel projects ls 2>/dev/null | grep -v "Fetching" | grep -v "Projects found"

echo ""
read -p "Enter your Vercel project name (default: aprils-pestcontrol-dashboard-frontend): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-aprils-pestcontrol-dashboard-frontend}

echo ""
echo -e "${BLUE}🔧 Adding environment variables to Vercel project: ${PROJECT_NAME}${NC}"
echo ""

# Add VITE_SUPABASE_URL
echo "Adding VITE_SUPABASE_URL..."
echo "$SUPABASE_URL" | npx vercel env add VITE_SUPABASE_URL production --project="$PROJECT_NAME" 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Variable might already exist or there was an error${NC}"
}

# Add VITE_SUPABASE_ANON_KEY
echo "Adding VITE_SUPABASE_ANON_KEY..."
echo "$SUPABASE_ANON_KEY" | npx vercel env add VITE_SUPABASE_ANON_KEY production --project="$PROJECT_NAME" 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Variable might already exist or there was an error${NC}"
}

echo ""
echo -e "${GREEN}✅ Environment variables have been configured!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Go to your Vercel dashboard: https://vercel.com/dashboard"
echo "2. Select project: $PROJECT_NAME"
echo "3. Go to Settings → Environment Variables to verify"
echo "4. Redeploy your project to apply the changes"
echo ""
echo -e "${YELLOW}To redeploy:${NC}"
echo "   npx vercel --prod"
echo ""
echo -e "${GREEN}✨ Setup complete!${NC}"

