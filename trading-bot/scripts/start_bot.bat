@echo off
REM ============================================================
REM Studex Trading Bot - Start Script (Desktop)
REM ============================================================

echo Starting Studex Trading Bot...

REM Activate virtual environment
call venv\Scripts\activate

REM Ensure Ollama is running
echo Checking Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Ollama server...
    start /B ollama serve
    timeout /t 5 /nobreak >nul
)

REM Start the trading bot in paper mode (safe default)
echo.
echo ============================================================
echo   Starting in PAPER TRADING mode (no real money)
echo   To switch to live: edit config/settings.yaml
echo     Change environment: "paper" to "live"
echo     Change sandbox: true to false
echo ============================================================
echo.

python main.py --paper

pause
