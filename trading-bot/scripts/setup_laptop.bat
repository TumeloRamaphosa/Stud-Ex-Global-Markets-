@echo off
REM ============================================================
REM Studex Trading Bot - Laptop Setup Script (Windows)
REM Run this on your LAPTOP (The Monitor - 8GB RAM)
REM ============================================================

echo ============================================================
echo   STUDEX GLOBAL MARKETS - LAPTOP SETUP (THE MONITOR)
echo   This machine runs: Dashboard + Monitoring + Alerts
echo ============================================================
echo.

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

REM Navigate to frontend
echo [1/3] Setting up the dashboard frontend...
cd ..\studex-frontend

REM Install npm dependencies
echo [2/3] Installing dependencies...
call npm install

REM Create .env.local for API connection
echo [3/3] Configuring API connection...
echo NEXT_PUBLIC_TRADING_API_URL=http://DESKTOP_IP:8000 > .env.local
echo NEXT_PUBLIC_WS_URL=ws://DESKTOP_IP:8765 >> .env.local

echo.
echo ============================================================
echo   SETUP COMPLETE!
echo ============================================================
echo.
echo   IMPORTANT: Update .env.local with your desktop's IP address
echo   Replace DESKTOP_IP with the actual IP of your desktop
echo   (Find it by running 'ipconfig' on the desktop)
echo.
echo   To start the dashboard:
echo     cd studex-frontend
echo     npm run dev
echo.
echo   Then open http://localhost:3000 in your browser
echo.
echo   The dashboard will connect to the trading bot running
echo   on your desktop at the configured IP address.
echo ============================================================

pause
