@echo off
REM ============================================================
REM Studex Trading Bot - Desktop Setup Script (Windows)
REM Run this on your DESKTOP (the Brain - 2x 8GB GPU)
REM ============================================================

echo ============================================================
echo   STUDEX GLOBAL MARKETS - DESKTOP SETUP (THE BRAIN)
echo   This machine runs: Trading Engine + Ollama + Strategies
echo ============================================================
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Install Python 3.11+ from python.org
    pause
    exit /b 1
)

REM Check Ollama
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Ollama not found.
    echo Download from: https://ollama.ai/download/windows
    echo.
)

REM Create virtual environment
echo [1/6] Creating Python virtual environment...
python -m venv venv
call venv\Scripts\activate

REM Install dependencies
echo [2/6] Installing Python dependencies...
pip install -r requirements.txt

REM Create data directories
echo [3/6] Creating data directories...
mkdir data\logs 2>nul
mkdir data\trades 2>nul
mkdir data\backtest 2>nul

REM Setup Ollama models
echo [4/6] Pulling Ollama models (this may take a while)...
ollama pull mistral:7b-instruct-v0.3-q5_K_M
ollama pull llama3.1:8b-instruct-q4_K_M

REM Copy environment file
echo [5/6] Setting up configuration...
if not exist config\.env (
    copy config\.env.example config\.env
    echo.
    echo IMPORTANT: Edit config\.env with your API keys!
    echo   - LUNO_API_KEY and LUNO_API_SECRET (for SA crypto)
    echo   - BINANCE_API_KEY and BINANCE_API_SECRET (for global crypto)
    echo   - EASY_USERNAME and EASY_PASSWORD (for JSE)
    echo   - TV_WEBHOOK_SECRET (for TradingView)
    echo.
)

REM Install Redis (optional)
echo [6/6] Setup complete!
echo.
echo ============================================================
echo   NEXT STEPS:
echo ============================================================
echo   1. Edit config\.env with your API keys
echo   2. Edit config\settings.yaml to customize strategies
echo   3. Start Ollama: ollama serve
echo   4. Run the bot: python main.py --paper
echo   5. Dashboard API will be at: http://localhost:8000
echo   6. TradingView webhooks at: http://localhost:8080
echo.
echo   For live trading (USE WITH CAUTION):
echo   python main.py
echo ============================================================

pause
