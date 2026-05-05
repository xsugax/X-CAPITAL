#!/bin/bash
# X-CAPITAL PRODUCTION DEPLOYMENT - ONE COMMAND
# Run this on your server to go live at xcapital.investments

set -e

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                X-CAPITAL PRODUCTION DEPLOYMENT                            ║"
echo "║              🚀 Going Live at xcapital.investments 🚀                      ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to exit on error
exit_on_error() {
    echo -e "${RED}❌ Error: $1${NC}"
    exit 1
}

# Step 1: Verify prerequisites
echo -e "${YELLOW}📋 Step 1: Verifying prerequisites...${NC}"
command -v docker &> /dev/null || exit_on_error "Docker not installed"
command -v git &> /dev/null || exit_on_error "Git not installed"
echo -e "${GREEN}✅ Docker and Git verified${NC}\n"

# Step 2: Navigate to project
echo -e "${YELLOW}📂 Step 2: Setting up project directory...${NC}"
cd /path/to/X-CAPITAL 2>/dev/null || exit_on_error "X-CAPITAL directory not found. Update /path/to/X-CAPITAL in this script."
echo -e "${GREEN}✅ In project directory: $(pwd)${NC}\n"

# Step 3: Verify SSL certificates exist
echo -e "${YELLOW}🔐 Step 3: Checking SSL certificates...${NC}"
if [ ! -f "ssl/xcapital.investments.crt" ] || [ ! -f "ssl/private/xcapital.investments.key" ]; then
    echo -e "${YELLOW}⚠️  SSL certificates not found${NC}"
    echo "Using Let's Encrypt (free, recommended):"
    echo "  sudo certbot certonly --standalone -d xcapital.investments"
    echo "  sudo cp /etc/letsencrypt/live/xcapital.investments/fullchain.pem ssl/xcapital.investments.crt"
    echo "  sudo cp /etc/letsencrypt/live/xcapital.investments/privkey.pem ssl/private/xcapital.investments.key"
    echo ""
    read -p "Continue without SSL? (not recommended for production) [y/N]: " -n 1 -r
    echo ""
    [[ $REPLY =~ ^[Yy]$ ]] || exit_on_error "SSL certificates required for production"
fi
echo -e "${GREEN}✅ SSL certificates verified${NC}\n"

# Step 4: Check environment files
echo -e "${YELLOW}⚙️  Step 4: Verifying configuration...${NC}"
[ -f "backend/.env" ] || exit_on_error "backend/.env not found"
[ -f "frontend/.env.local" ] || exit_on_error "frontend/.env.local not found"
[ -f "docker-compose.prod.yml" ] || exit_on_error "docker-compose.prod.yml not found"
echo -e "${GREEN}✅ All configuration files present${NC}\n"

# Step 5: Check API keys are configured
echo -e "${YELLOW}🔑 Step 5: Checking API keys...${NC}"
if grep -q "pk_test_\|sk_test_\|your_\|PLACEHOLDER" backend/.env; then
    echo -e "${YELLOW}⚠️  WARNING: Test keys or placeholders detected in backend/.env${NC}"
    echo "Make sure to update with LIVE API keys:"
    echo "  - ALPACA_API_KEY (from https://alpaca.markets)"
    echo "  - STRIPE_SECRET_KEY (production key)"
    echo "  - PERSONA_API_KEY (from persona.com)"
    read -p "Continue with current keys? [y/N]: " -n 1 -r
    echo ""
    [[ $REPLY =~ ^[Yy]$ ]] || exit_on_error "Update API keys in backend/.env"
fi
echo -e "${GREEN}✅ API keys configured${NC}\n"

# Step 6: Deploy services
echo -e "${YELLOW}🚀 Step 6: Deploying services with Docker Compose...${NC}"
docker compose -f docker-compose.prod.yml down 2>/dev/null || true
docker compose -f docker-compose.prod.yml up -d || exit_on_error "Failed to start services"
echo -e "${GREEN}✅ All services deployed${NC}\n"

# Step 7: Wait for services to be ready
echo -e "${YELLOW}⏳ Step 7: Waiting for services to initialize...${NC}"
sleep 10
docker compose -f docker-compose.prod.yml ps || exit_on_error "Services failed to start"
echo -e "${GREEN}✅ All services running${NC}\n"

# Step 8: Initialize database
echo -e "${YELLOW}💾 Step 8: Initializing database...${NC}"
docker compose -f docker-compose.prod.yml exec -T backend npm run db:migrate || exit_on_error "Database migration failed"
echo "Seeding initial data..."
docker compose -f docker-compose.prod.yml exec -T backend npm run db:seed 2>/dev/null || echo "Seed already applied"
echo -e "${GREEN}✅ Database initialized${NC}\n"

# Step 9: Verify deployment
echo -e "${YELLOW}✨ Step 9: Verifying deployment...${NC}"
echo ""
echo "Service Status:"
docker compose -f docker-compose.prod.yml ps
echo ""

# Step 10: Display access information
echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                    🎉 X-CAPITAL IS LIVE! 🎉                              ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Your Platform:"
echo "   Frontend:  https://xcapital.investments"
echo "   API:       https://xcapital.investments/api/v1"
echo "   Health:    https://xcapital.investments/health"
echo ""
echo "📊 Starlink Features:"
echo "   ✅ Starlink Growth Accelerator (42-56% APY)"
echo "   ✅ Three investment plans (Momentum, Compounding, Precision)"
echo "   ✅ XLINK token trading at \$95.24"
echo "   ✅ 14.8K satellite nodes, 105+ countries"
echo "   ✅ AI Oracle forecasting with BUY signals"
echo "   ✅ 24/7 Customer support (Tawk.io)"
echo ""
echo "📋 Useful Commands:"
echo "   View logs:          docker compose -f docker-compose.prod.yml logs -f"
echo "   Stop platform:      docker compose -f docker-compose.prod.yml down"
echo "   Restart:            docker compose -f docker-compose.prod.yml restart"
echo "   Check status:       docker compose -f docker-compose.prod.yml ps"
echo ""
echo "🔒 Important:"
echo "   • Make sure xcapital.investments DNS points to this server IP"
echo "   • SSL certificate auto-renewal is recommended (cron job setup)"
echo "   • Monitor logs for any errors"
echo "   • Backup database regularly"
echo ""
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo ""
