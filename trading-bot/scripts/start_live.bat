@echo off
REM ============================================================
REM Studex Trading Bot - LIVE TRADING Start Script
REM WARNING: This uses REAL MONEY!
REM ============================================================

echo ============================================================
echo   WARNING: LIVE TRADING MODE
echo   This will trade with REAL MONEY on connected exchanges!
echo.
echo   Make sure you have:
echo   1. Set up API keys in config/.env
echo   2. Tested thoroughly in paper mode
echo   3. Set appropriate risk limits in settings.yaml
echo   4. Understand the risks involved
echo ============================================================
echo.
set /p confirm="Type 'YES I UNDERSTAND' to continue: "

if not "%confirm%"=="YES I UNDERSTAND" (
    echo Aborted. Run start_bot.bat for paper trading.
    pause
    exit /b 0
)

REM Activate virtual environment
call venv\Scripts\activate

REM Start Ollama
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    start /B ollama serve
    timeout /t 5 /nobreak >nul
)

echo Starting LIVE trading...
python main.py

pause
