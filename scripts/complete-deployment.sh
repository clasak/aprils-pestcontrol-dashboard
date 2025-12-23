#!/bin/bash

# Complete Deployment Setup Script
# This script will guide you through the entire deployment process

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

clear

echo -e "${BOLD}${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🚀 April's Pest Control Dashboard Deployment Setup       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${BLUE}This script will help you complete your Vercel deployment.${NC}"
echo ""

# Step 1: Check prerequisites
echo -e "${BOLD}Step 1: Checking prerequisites...${NC}"
echo ""

if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx not found. Please install Node.js${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js/npx installed${NC}"

# Check Vercel login
if ! npx vercel whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged into Vercel${NC}"
    echo -e "${YELLOW}Please run: npx vercel login${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Logged into Vercel${NC}"

# Check git status
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
else
    echo -e "${GREEN}✅ Git repository clean${NC}"
fi

echo ""
echo -e "${BOLD}Step 2: Supabase Setup${NC}"
echo ""
echo -e "${YELLOW}You need to complete these steps in your browser:${NC}"
echo ""
echo "1. Go to: ${CYAN}https://app.supabase.com${NC}"
echo "2. Create a new project (or select existing)"
echo "3. Run the 7 migration files in SQL Editor"
echo "4. Get your credentials from Settings → API"
echo ""

read -p "Press ENTER when you have your Supabase credentials ready..."

echo ""
echo -e "${BOLD}Step 3: Enter Supabase Credentials${NC}"
echo ""

# Get Supabase URL
while true; do
    read -p "Enter your SUPABASE_URL (e.g., https://xxxxx.supabase.co): " SUPABASE_URL
    if [[ $SUPABASE_URL =~ ^https://.*\.supabase\.co$ ]]; then
        break
    else
        echo -e "${RED}Invalid URL format. Should be: https://xxxxx.supabase.co${NC}"
    fi
done

# Get Supabase Anon Key
while true; do
    read -p "Enter your SUPABASE_ANON_KEY (starts with eyJ...): " SUPABASE_ANON_KEY
    if [[ $SUPABASE_ANON_KEY =~ ^eyJ ]]; then
        break
    else
        echo -e "${RED}Invalid key format. Should start with: eyJ${NC}"
    fi
done

echo ""
echo -e "${BOLD}Step 4: Adding environment variables to Vercel...${NC}"
echo ""

PROJECT_NAME="aprils-pestcontrol-dashboard-frontend"

# Add VITE_SUPABASE_URL
echo "Adding VITE_SUPABASE_URL..."
if echo "$SUPABASE_URL" | npx vercel env add VITE_SUPABASE_URL production preview development 2>&1 | grep -q "Created"; then
    echo -e "${GREEN}✅ VITE_SUPABASE_URL added${NC}"
else
    echo -e "${YELLOW}⚠️  VITE_SUPABASE_URL may already exist${NC}"
fi

# Add VITE_SUPABASE_ANON_KEY
echo "Adding VITE_SUPABASE_ANON_KEY..."
if echo "$SUPABASE_ANON_KEY" | npx vercel env add VITE_SUPABASE_ANON_KEY production preview development 2>&1 | grep -q "Created"; then
    echo -e "${GREEN}✅ VITE_SUPABASE_ANON_KEY added${NC}"
else
    echo -e "${YELLOW}⚠️  VITE_SUPABASE_ANON_KEY may already exist${NC}"
fi

echo ""
echo -e "${BOLD}Step 5: Deploying to production...${NC}"
echo ""

read -p "Deploy to production now? (y/n): " DEPLOY_NOW

if [[ $DEPLOY_NOW =~ ^[Yy]$ ]]; then
    echo ""
    echo "Deploying..."
    npx vercel --prod
    echo ""
    echo -e "${GREEN}✅ Deployment initiated!${NC}"
else
    echo ""
    echo -e "${YELLOW}Skipped deployment. Run manually with: npx vercel --prod${NC}"
fi

echo ""
echo -e "${BOLD}${GREEN}Step 6: Final Configuration${NC}"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to configure Supabase Auth URLs:${NC}"
echo ""
echo "1. Go to Supabase Dashboard → Authentication → URL Configuration"
echo "2. Set Site URL to: ${CYAN}https://aprils-pestcontrol-dashboard-fronte.vercel.app${NC}"
echo "3. Add Redirect URLs:"
echo "   - ${CYAN}https://aprils-pestcontrol-dashboard-fronte.vercel.app/**${NC}"
echo "   - ${CYAN}http://localhost:3000/**${NC}"
echo "   - ${CYAN}http://localhost:3001/**${NC}"
echo ""

echo -e "${BOLD}${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                    ✨ Setup Complete! ✨                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${BOLD}🎉 Your deployment is ready!${NC}"
echo ""
echo -e "${BLUE}Production URL:${NC} ${CYAN}https://aprils-pestcontrol-dashboard-fronte.vercel.app${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Wait 2-3 minutes for deployment to complete"
echo "2. Visit your production URL"
echo "3. Create your first user account"
echo "4. Start using your CRM!"
echo ""
echo -e "${BLUE}View deployment logs:${NC} npx vercel logs"
echo -e "${BLUE}Check deployment status:${NC} https://vercel.com/dashboard"
echo ""

