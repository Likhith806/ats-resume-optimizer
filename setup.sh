#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ATS Resume Optimizer — One-command setup script
# Usage: chmod +x setup.sh && ./setup.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   ATS Resume Optimizer — Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install it from https://nodejs.org (v18+)"
    exit 1
fi
NODE_VERSION=$(node --version | cut -d. -f1 | tr -d 'v')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js v18+ required. Current: $(node --version)"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Setup backend
echo ""
echo -e "${BLUE}[1/3] Installing backend dependencies...${NC}"
cd backend
npm install --silent
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Create .env if needed
if [ ! -f .env ]; then
    cp .env.example .env
    echo ""
    echo -e "${YELLOW}⚠️  Created backend/.env from template.${NC}"
    echo -e "${YELLOW}    Add your Anthropic API key:${NC}"
    echo -e "${YELLOW}    ANTHROPIC_API_KEY=sk-ant-api03-...${NC}"
    echo ""
    echo -n "    Enter your Anthropic API key now (or press Enter to skip): "
    read -r API_KEY
    if [ -n "$API_KEY" ]; then
        sed -i.bak "s/your_anthropic_api_key_here/$API_KEY/" .env
        rm -f .env.bak
        echo -e "${GREEN}    ✓ API key saved to backend/.env${NC}"
    fi
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi

# Ensure temp dir exists
mkdir -p temp

# Setup frontend
cd ../frontend
echo ""
echo -e "${BLUE}[2/3] Installing frontend dependencies...${NC}"
npm install --silent
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Done
cd ..
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}[3/3] Setup complete!${NC}"
echo ""
echo "  To start the app, open TWO terminals:"
echo ""
echo -e "  ${YELLOW}Terminal 1 (backend):${NC}"
echo "    cd backend && npm run dev"
echo ""
echo -e "  ${YELLOW}Terminal 2 (frontend):${NC}"
echo "    cd frontend && npm run dev"
echo ""
echo -e "  Then open ${BLUE}http://localhost:3000${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
