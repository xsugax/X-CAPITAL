@echo off
REM X-CAPITAL Deployment Script for Windows
REM This script sets up and starts all services using Docker

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  X-CAPITAL Multi-Rail Capital Execution Platform               ║
echo ║  Starting Docker Deployment...                                 ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
  echo ❌ Docker is not running. Please start Docker Desktop.
  exit /b 1
)

echo ✓ Docker is running
echo.

REM Check if .env exists in backend
if not exist "backend\.env" (
  echo ⚠️  backend\.env not found. Creating from .env.example...
  copy backend\.env.example backend\.env
  echo ⚠️  Please update backend\.env with your API keys
)

echo 🔨 Building and starting all services...
echo.

REM Build and start services
docker compose up -d

echo.
echo ⏳ Waiting for services to be healthy...
timeout /t 10 /nobreak

REM Check service health
echo.
echo 📊 Service Status:
docker compose ps

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  ✅ X-CAPITAL Deployment Complete!                             ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 🌐 Access Points:
echo    Frontend:     http://localhost:3000
echo    Backend API:  http://localhost:4000/api/v1
echo    AI Oracle:    http://localhost:8000
echo    Database:     localhost:5432 (xcapital / xcapital_secret)
echo.
echo 📝 View logs:    docker compose logs -f
echo 🛑 Stop services: docker compose down
echo 🗑️  Clean up:      docker compose down -v
echo.

endlocal
