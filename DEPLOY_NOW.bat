@echo off
REM X-CAPITAL PRODUCTION DEPLOYMENT - ONE COMMAND (Windows)
REM Run this on your Windows server to go live at xcapital.investments

setlocal enabledelayedexpansion
color 0A

echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║                X-CAPITAL PRODUCTION DEPLOYMENT                            ║
echo ║              Going Live at xcapital.investments                           ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.

REM Step 1: Check Docker
echo [Step 1] Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker not installed. Please install Docker for Windows.
    exit /b 1
)
echo OK - Docker found
echo.

REM Step 2: Navigate to project
echo [Step 2] Setting up project directory...
cd /d "C:\path\to\X-CAPITAL" 2>nul
if errorlevel 1 (
    echo ERROR: X-CAPITAL directory not found.
    echo Please update the path in this script.
    exit /b 1
)
echo OK - In: %cd%
echo.

REM Step 3: Check configuration files
echo [Step 3] Verifying configuration files...
if not exist "backend\.env" (
    echo ERROR: backend\.env not found
    exit /b 1
)
if not exist "frontend\.env.local" (
    echo ERROR: frontend\.env.local not found
    exit /b 1
)
if not exist "docker-compose.prod.yml" (
    echo ERROR: docker-compose.prod.yml not found
    exit /b 1
)
echo OK - All files present
echo.

REM Step 4: Check SSL certificates
echo [Step 4] Checking SSL certificates...
if not exist "ssl\xcapital.investments.crt" (
    echo WARNING: SSL certificate not found at ssl\xcapital.investments.crt
    echo.
    echo For production, you need an SSL certificate. Options:
    echo 1. Use Let's Encrypt (free)
    echo 2. Use a commercial certificate
    echo.
    echo Consider continuing without SSL only for testing.
)
echo.

REM Step 5: Stop existing containers
echo [Step 5] Stopping any existing containers...
docker compose -f docker-compose.prod.yml down 2>nul
echo.

REM Step 6: Start services
echo [Step 6] Starting all services...
docker compose -f docker-compose.prod.yml up -d
if errorlevel 1 (
    echo ERROR: Failed to start services
    exit /b 1
)
echo OK - Services started
echo.

REM Step 7: Wait for services
echo [Step 7] Waiting for services to initialize...
timeout /t 10 /nobreak
echo.

REM Step 8: Show service status
echo [Step 8] Service Status:
docker compose -f docker-compose.prod.yml ps
echo.

REM Step 9: Initialize database
echo [Step 9] Initializing database...
docker compose -f docker-compose.prod.yml exec -T backend npm run db:migrate
if errorlevel 1 (
    echo WARNING: Database migration may have failed
)
echo.

REM Step 10: Success
echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║                    X-CAPITAL IS LIVE!                                     ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.
echo Your Platform:
echo   Frontend:  https://xcapital.investments
echo   API:       https://xcapital.investments/api/v1
echo.
echo Features:
echo   * Starlink Growth Accelerator (42-56 APY)
echo   * XLINK token trading
echo   * AI Oracle forecasting
echo   * 24/7 Customer support
echo.
echo Useful Commands:
echo   View logs:     docker compose -f docker-compose.prod.yml logs -f
echo   Stop:          docker compose -f docker-compose.prod.yml down
echo   Status:        docker compose -f docker-compose.prod.yml ps
echo.
echo IMPORTANT: Ensure xcapital.investments DNS points to this server IP
echo.
pause
