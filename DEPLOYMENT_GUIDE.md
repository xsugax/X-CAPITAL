# X-CAPITAL Deployment Guide

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Git configured
- Terminal/PowerShell access

### Step 1: Clone & Navigate

```bash
cd X-CAPITAL
```

### Step 2: Configure Backend

```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit backend/.env and add your API keys:
# - ALPACA_API_KEY
# - ALPACA_SECRET_KEY
# - JWT_SECRET (generate a random 64+ char string)
```

### Step 3: Deploy with Docker

```bash
# On macOS/Linux:
./deploy.sh

# On Windows (PowerShell):
docker compose up -d
```

### Step 4: Access the Platform

| Service         | URL                          | Purpose                |
| --------------- | ---------------------------- | ---------------------- |
| **Frontend**    | http://localhost:3000        | X-CAPITAL Dashboard    |
| **Backend API** | http://localhost:4000/api/v1 | REST API               |
| **AI Oracle**   | http://localhost:8000        | ML Forecasting Service |
| **Database**    | localhost:5432               | PostgreSQL             |

---

## 🛠️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  Frontend (Next.js 14, React 18, Tailwind)      │  :3000
│  - Dashboard, Trading, Portfolio, Oracle        │
│  - Starlink Growth Accelerator                  │
│  - Tawk.io Customer Support Widget              │
└────────────────┬────────────────────────────────┘
                 │ REST/JSON
┌────────────────▼────────────────────────────────┐
│  Backend API (Express.js, TypeScript)           │  :4000
│  - Auth (JWT), Trading, Portfolio               │
│  - KYC, Funds, Wallet, Commerce                 │
│  - WebSocket support for live data              │
└──────────┬─────────────────────────────┬────────┘
           │                             │
    ┌──────▼──────┐          ┌─────────┴────────┐
    │  PostgreSQL │          │ Polygon/Ethereum │
    │  + Redis    │          │ (Smart Contracts)│
    │             │          │ + Blockchain API │
    └─────────────┘          └──────────────────┘
           │
    ┌──────▼──────────┐
    │  AI Oracle      │  :8000
    │  (FastAPI)      │
    │  - LSTM/GBM     │
    │  - Forecasts    │
    └─────────────────┘
```

---

## 📊 Key Features Deployed

### ✨ Starlink Growth Accelerator

- **Momentum Plan**: 42% APY with high-frequency rebalancing
- **Compounding Plan**: 56% APY with monthly dividend reinvestment
- **Precision Plan**: 48% APY with AI-optimized allocation
- Live XLINK token trading on Trading page
- Real-time tracking across Dashboard, Funds, Trading, Portfolio, and Oracle pages

### 🤝 Customer Support

- **Tawk.io Widget** integrated in Header
- Professional dark-theme styling matching site aesthetics
- Custom visitor attributes from user data
- 24/7 availability

### 📈 Advanced Features

- AI-powered portfolio forecasting (X-ORACLE)
- Real-time market data (30-second refresh)
- Capital Rails infrastructure
- Multi-asset class support
- KYC verification workflow

---

## 🔑 Environment Variables

### Backend (.env)

```bash
# Server
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL="postgresql://xcapital:xcapital_secret@localhost:5432/xcapital_db"

# Cache
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your_super_secret_key_min_64_chars
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# Brokers
ALPACA_API_KEY=your_alpaca_key
ALPACA_SECRET_KEY=your_alpaca_secret
ALPACA_BASE_URL=https://paper-api.alpaca.markets

# Blockchain
ETHEREUM_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your_alchemy_key

# AI Oracle
AI_ORACLE_URL=http://localhost:8000

# KYC
KYC_PROVIDER=persona
PERSONA_API_KEY=your_persona_key

# Payments
STRIPE_SECRET_KEY=sk_test_your_key
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_key
```

---

## 📋 Docker Commands Reference

```bash
# Start all services
docker compose up -d

# View service status
docker compose ps

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f ai-oracle

# Stop services
docker compose down

# Stop and remove volumes (full reset)
docker compose down -v

# Rebuild after code changes
docker compose up -d --build

# Execute command in container
docker compose exec backend npm run db:migrate
docker compose exec backend npm run db:seed
```

---

## 🗄️ Database Setup

### Initialize Database

```bash
# Run migrations
docker compose exec backend npm run db:migrate

# Seed demo data
docker compose exec backend npm run db:seed

# Open Prisma Studio (visual database editor)
docker compose exec backend npm run db:studio
# Access at http://localhost:5555
```

---

## 🐛 Troubleshooting

### Problem: Port already in use

```bash
# Check which service is using the port
lsof -i :3000  # Frontend
lsof -i :4000  # Backend
lsof -i :8000  # AI Oracle

# Kill the process
kill -9 <PID>
```

### Problem: Docker not starting

```bash
# Ensure Docker Desktop is running
docker ps

# If not, restart Docker daemon
sudo systemctl restart docker  # Linux
```

### Problem: Database connection failed

```bash
# Check PostgreSQL logs
docker compose logs postgres

# Verify database is healthy
docker compose exec postgres pg_isready -U xcapital
```

### Problem: Frontend not building

```bash
# Clear Next.js cache
rm -rf frontend/.next
docker compose up -d --build frontend
```

---

## 🚀 Production Deployment

### Pre-Production Checklist

- [ ] Update all `.env` secrets
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/SSL
- [ ] Configure domain name
- [ ] Set up monitoring/alerting
- [ ] Configure backup strategy
- [ ] Review security settings

### Deployment Platforms

- **Vercel** (Frontend): https://vercel.com/docs/getting-started
- **Railway** (Backend): https://railway.app/docs
- **AWS/GCP** (Full Stack): Use Docker Compose to Kubernetes

---

## 📞 Support & Resources

- **Documentation**: [README.md](./README.md)
- **Issues**: Report in repository
- **Customer Support**: Tawk.io widget on platform

---

**Version**: 1.0.0  
**Last Updated**: May 4, 2026  
**Status**: ✅ Production Ready
