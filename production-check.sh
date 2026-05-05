#!/bin/bash
# X-CAPITAL Production Deployment Configuration Check

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║  X-CAPITAL PRODUCTION DEPLOYMENT VERIFICATION                             ║"
echo "║  Domain: xcapital.investments                                             ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_mark="${GREEN}✓${NC}"
cross_mark="${RED}✗${NC}"

# Function to check file existence
check_file() {
    if [ -f "$1" ]; then
        echo -e "${check_mark} $1 exists"
        return 0
    else
        echo -e "${cross_mark} $1 MISSING"
        return 1
    fi
}

# Function to check directory existence
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${check_mark} $1 exists"
        return 0
    else
        echo -e "${cross_mark} $1 MISSING"
        return 1
    fi
}

# Function to check environment variable
check_env_var() {
    if grep -q "$1" backend/.env 2>/dev/null; then
        echo -e "${check_mark} $1 configured"
        return 0
    else
        echo -e "${cross_mark} $1 NOT configured"
        return 1
    fi
}

echo "📋 Configuration Files"
echo "─────────────────────────────────────────────────────────────────────────────"
check_file "docker-compose.prod.yml"
check_file "nginx.conf"
check_file "backend/.env"
check_file "frontend/.env.local"
check_file "PRODUCTION_DEPLOYMENT.md"
echo ""

echo "🗂️  Directory Structure"
echo "─────────────────────────────────────────────────────────────────────────────"
check_dir "backend"
check_dir "frontend"
check_dir "ai-oracle"
check_dir "ssl"
echo ""

echo "🔐 SSL Configuration"
echo "─────────────────────────────────────────────────────────────────────────────"
check_file "ssl/xcapital.investments.crt" || echo -e "${YELLOW}⚠${NC}  SSL cert will be auto-configured on deployment"
check_file "ssl/private/xcapital.investments.key" || echo -e "${YELLOW}⚠${NC}  SSL key will be auto-configured on deployment"
echo ""

echo "📝 Backend Environment Variables"
echo "─────────────────────────────────────────────────────────────────────────────"
check_env_var "NODE_ENV=production"
check_env_var "DATABASE_URL"
check_env_var "REDIS_URL"
check_env_var "JWT_SECRET"
check_env_var "FRONTEND_URL=https://xcapital.investments"
check_env_var "ALPACA_API_KEY"
echo ""

echo "🌐 Frontend Configuration"
echo "─────────────────────────────────────────────────────────────────────────────"
if grep -q "NEXT_PUBLIC_API_URL=https://xcapital.investments" frontend/.env.local 2>/dev/null; then
    echo -e "${check_mark} API URL configured for production"
else
    echo -e "${cross_mark} API URL not configured for production"
fi

if grep -q "NEXT_PUBLIC_WS_URL=wss://xcapital.investments" frontend/.env.local 2>/dev/null; then
    echo -e "${check_mark} WebSocket URL configured for production"
else
    echo -e "${cross_mark} WebSocket URL not configured for production"
fi
echo ""

echo "🐳 Docker Configuration"
echo "─────────────────────────────────────────────────────────────────────────────"
if docker --version > /dev/null 2>&1; then
    echo -e "${check_mark} Docker installed: $(docker --version)"
else
    echo -e "${cross_mark} Docker not installed"
fi

if docker compose version > /dev/null 2>&1; then
    echo -e "${check_mark} Docker Compose installed: $(docker compose version 2>&1 | head -1)"
else
    echo -e "${cross_mark} Docker Compose not installed"
fi
echo ""

echo "📊 Configuration Summary"
echo "─────────────────────────────────────────────────────────────────────────────"
echo "Domain:                  xcapital.investments"
echo "Environment:             Production"
echo "Database:                PostgreSQL 16 Alpine"
echo "Cache:                   Redis 7 Alpine"
echo "Reverse Proxy:           Nginx"
echo "SSL/TLS:                 HTTPS (Let's Encrypt recommended)"
echo ""

echo "🚀 Ready to Deploy?"
echo "─────────────────────────────────────────────────────────────────────────────"
echo "Run this command to deploy:"
echo ""
echo "  docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "Then initialize database:"
echo ""
echo "  docker compose -f docker-compose.prod.yml exec backend npm run db:migrate"
echo "  docker compose -f docker-compose.prod.yml exec backend npm run db:seed"
echo ""
echo "Verify deployment:"
echo ""
echo "  docker compose -f docker-compose.prod.yml ps"
echo "  curl https://xcapital.investments"
echo ""
