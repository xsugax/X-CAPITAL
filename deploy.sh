#!/bin/bash
# X-CAPITAL Deployment Script
# This script sets up and starts all services using Docker

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  X-CAPITAL Multi-Rail Capital Execution Platform               ║"
echo "║  Starting Docker Deployment...                                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker Desktop."
  exit 1
fi

echo "✓ Docker is running"
echo ""

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
  echo "⚠️  backend/.env not found. Creating from .env.example..."
  cp backend/.env.example backend/.env
  echo "⚠️  Please update backend/.env with your API keys"
fi

echo "🔨 Building and starting all services..."
echo ""

# Build and start services
docker compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ X-CAPITAL Deployment Complete!                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Access Points:"
echo "   Frontend:     http://localhost:3000"
echo "   Backend API:  http://localhost:4000/api/v1"
echo "   AI Oracle:    http://localhost:8000"
echo "   Database:     localhost:5432 (xcapital / xcapital_secret)"
echo ""
echo "📝 View logs:    docker compose logs -f"
echo "🛑 Stop services: docker compose down"
echo "🗑️  Clean up:      docker compose down -v"
echo ""
