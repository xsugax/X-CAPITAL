#!/bin/bash
# X-CAPITAL PRODUCTION QUICK START
# Deploy xcapital.investments in 5 minutes

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║  X-CAPITAL PRODUCTION DEPLOYMENT                                  ║"
echo "║  xcapital.investments                                             ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Step 1: Verify Docker${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker not found. Please install Docker first.${NC}"
    exit 1
fi
docker --version

echo ""
echo -e "${GREEN}Step 2: Configure SSL Certificates${NC}"
echo "Choose your SSL option:"
echo "  1) Let's Encrypt (automatic, recommended)"
echo "  2) Skip (manually configure later)"
read -p "Enter choice (1-2): " ssl_choice

if [ "$ssl_choice" = "1" ]; then
    echo -e "${YELLOW}Install Certbot and run:${NC}"
    echo "sudo certbot certonly --standalone -d xcapital.investments"
    echo "cp /etc/letsencrypt/live/xcapital.investments/fullchain.pem ssl/"
    echo "cp /etc/letsencrypt/live/xcapital.investments/privkey.pem ssl/private/"
fi

echo ""
echo -e "${GREEN}Step 3: Update API Keys${NC}"
echo "Edit backend/.env with your credentials:"
echo "  - ALPACA_API_KEY"
echo "  - ALPACA_SECRET_KEY"
echo "  - STRIPE_SECRET_KEY"
echo "  - PERSONA_API_KEY"
echo ""
read -p "Press Enter when ready..."

echo ""
echo -e "${GREEN}Step 4: Deploy Services${NC}"
echo "Running: docker compose -f docker-compose.prod.yml up -d"
echo ""
docker compose -f docker-compose.prod.yml up -d

echo ""
echo -e "${GREEN}Step 5: Initialize Database${NC}"
echo "Running migrations..."
docker compose -f docker-compose.prod.yml exec backend npm run db:migrate

echo "Seeding data..."
docker compose -f docker-compose.prod.yml exec backend npm run db:seed

echo ""
echo -e "${GREEN}Step 6: Verify Deployment${NC}"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║  ✅ X-CAPITAL IS LIVE!                                            ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Access your platform:"
echo "   https://xcapital.investments"
echo ""
echo "📊 Monitor services:"
echo "   docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker compose -f docker-compose.prod.yml down"
echo ""
echo "✅ Features deployed:"
echo "   • Starlink Growth Accelerator (42-56% APY)"
echo "   • Real-time market data"
echo "   • AI Oracle forecasting"
echo "   • 24/7 Customer support (Tawk.io)"
echo "   • Enterprise infrastructure"
echo ""
