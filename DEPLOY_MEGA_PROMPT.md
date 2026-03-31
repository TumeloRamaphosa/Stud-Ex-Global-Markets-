# ============================================================
# STUDEX GLOBAL MARKETS — FULL DEPLOYMENT MEGA PROMPT
# Paste this into OpenAI Codex, Claude Code, or any AI agent
# ============================================================
#
# WHAT THIS DEPLOYS:
# - Automated trading bot (Python) on a Windows desktop with 2x 8GB GPUs
# - Next.js dashboard + API on Vercel (free tier)
# - Ollama LLM for local AI inference
# - Crypto trading via LUNO (ZAR) + Binance (USDT)
# - JSE stock trading via EasyEquities
# - TradingView webhook integration
# - RALF self-learning feedback loop
# - RAG knowledge base for trade memory
# - MiroFish-inspired swarm sentiment (50 AI agents)
#
# REPO: https://github.com/TumeloRamaphosa/Stud-Ex-Global-Markets-
# BRANCH: claude/automated-trading-bot-A2cwB
# ============================================================

"""
MEGA DEPLOYMENT PROMPT — COPY EVERYTHING BELOW INTO CODEX
"""

# ============================================================
# STEP 1: CLONE AND CHECKOUT
# ============================================================

# Clone the repository and switch to the trading bot branch:

git clone https://github.com/TumeloRamaphosa/Stud-Ex-Global-Markets-.git
cd Stud-Ex-Global-Markets-
git checkout claude/automated-trading-bot-A2cwB

# ============================================================
# STEP 2: DEPLOY FRONTEND TO VERCEL
# ============================================================

# 2a. Install Vercel CLI globally
npm install -g vercel

# 2b. Navigate to the frontend directory
cd studex-frontend

# 2c. Install dependencies
npm install

# 2d. Add the Vercel AI SDK packages (for Claude-powered trade analysis)
npm install ai @ai-sdk/anthropic

# 2e. Deploy to Vercel
# When prompted:
#   - Set up and deploy? YES
#   - Which scope? (select your account)
#   - Link to existing project? NO (create new)
#   - Project name? studex-trading
#   - Directory? ./
#   - Override settings? NO
vercel --prod

# 2f. After deploy, note your Vercel URL (e.g., https://studex-trading.vercel.app)
# Set environment variables in Vercel dashboard (vercel.com → project → Settings → Environment Variables):
#
#   ANTHROPIC_API_KEY       = sk-ant-xxx...         (from console.anthropic.com)
#   TRADING_BOT_SECRET      = (generate a random string, e.g.: openssl rand -hex 32)
#   CRON_SECRET             = (another random string for cron auth)
#
# Or set via CLI:
vercel env add ANTHROPIC_API_KEY
vercel env add TRADING_BOT_SECRET
vercel env add CRON_SECRET

# 2g. Redeploy to pick up env vars
vercel --prod

# ============================================================
# STEP 3: SETUP DESKTOP TRADING BOT (Windows — The Brain)
# ============================================================

# 3a. Open a terminal on your DESKTOP (the machine with 2x 8GB GPUs)

cd Stud-Ex-Global-Markets-/trading-bot

# 3b. Create Python virtual environment (requires Python 3.11+)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# 3c. Install Python dependencies
pip install -r requirements.txt

# 3d. Create data directories
mkdir data\logs data\trades data\backtest

# 3e. Create your .env file from the template
copy config\.env.example config\.env

# 3f. Edit config/.env with your actual API keys:
#
#   LUNO_API_KEY=xxx           ← Get from luno.com → Settings → API Keys
#   LUNO_API_SECRET=xxx        ← Same place
#   BINANCE_API_KEY=xxx        ← Get from binance.com → API Management
#   BINANCE_API_SECRET=xxx     ← Same place
#   EASY_USERNAME=xxx          ← Your EasyEquities login email
#   EASY_PASSWORD=xxx          ← Your EasyEquities password
#   TV_WEBHOOK_SECRET=xxx      ← Any random string for TradingView webhook auth
#   ANTHROPIC_API_KEY=xxx      ← Optional, for Claude analysis fallback
#   VERCEL_API_SECRET=xxx      ← MUST MATCH the TRADING_BOT_SECRET you set in Vercel
#   OLLAMA_BASE_URL=http://localhost:11434

# 3g. Edit config/settings.yaml — update the Vercel section:
#
#   vercel:
#     enabled: true
#     api_url: "https://studex-trading.vercel.app"   ← YOUR actual Vercel URL
#     api_secret: "${VERCEL_API_SECRET}"

# ============================================================
# STEP 4: SETUP OLLAMA (Local LLM on Desktop GPUs)
# ============================================================

# 4a. Download and install Ollama from https://ollama.ai/download/windows

# 4b. Pull the required models (this downloads ~5GB total)
ollama pull mistral:7b-instruct-v0.3-q5_K_M
ollama pull llama3.1:8b-instruct-q4_K_M
ollama pull nomic-embed-text

# 4c. Verify Ollama is running
curl http://localhost:11434/api/tags
# Should return JSON with your models listed

# ============================================================
# STEP 5: SETUP API KEYS (Where to get each one)
# ============================================================

# LUNO (South African crypto exchange — FREE):
#   1. Go to https://www.luno.com/en/signup
#   2. Verify your identity (SA ID required)
#   3. Go to Settings → API Keys → Create API Key
#   4. Permissions needed: View balance, Trade
#   5. Copy API Key and API Secret to .env

# BINANCE (Global crypto — FREE):
#   1. Go to https://www.binance.com/en/register
#   2. Complete verification
#   3. Go to Account → API Management → Create API
#   4. Enable: Read, Spot Trading
#   5. Restrict to your desktop IP for security
#   6. Copy API Key and Secret to .env

# EASYEQUITIES (JSE stocks — FREE account):
#   1. Go to https://www.easyequities.co.za
#   2. Sign up and fund your account
#   3. Use your login email/password in .env
#   (Note: Currently uses paper trading; live API coming)

# TRADINGVIEW (Charts + Webhooks — FREE plan works):
#   1. Go to https://www.tradingview.com
#   2. Create a free account
#   3. For webhooks, you need at minimum the Essential plan ($12.95/mo)
#   4. Or use the free plan with manual chart monitoring

# ANTHROPIC (Claude API — Optional, pay-per-use):
#   1. Go to https://console.anthropic.com
#   2. Create an account and add billing
#   3. Generate an API key
#   4. ~$0.003 per trade analysis call (very cheap)

# ============================================================
# STEP 6: START THE TRADING BOT
# ============================================================

# 6a. Make sure Ollama is running in a separate terminal:
ollama serve

# 6b. Start the bot in PAPER TRADING mode (safe — no real money):
cd Stud-Ex-Global-Markets-/trading-bot
venv\Scripts\activate
python main.py --paper

# You should see:
#   ============================================================
#     STUDEX GLOBAL MARKETS - AUTOMATED TRADING BOT
#     Environment: paper
#     Timezone: Africa/Johannesburg
#   ============================================================
#   Ollama LLM analyst connected
#   RALF Loop initialized
#   RAG System initialized — 3 docs, X chunks
#   Vercel connected — cloud dashboard at https://studex-trading.vercel.app
#   Trading Engine starting...

# 6c. Access the dashboard:
#   Cloud: https://studex-trading.vercel.app/trading
#   Local: http://localhost:8000/api/health

# ============================================================
# STEP 7: SETUP TRADINGVIEW WEBHOOKS (Optional)
# ============================================================

# 7a. In TradingView, create a strategy alert on any chart

# 7b. Set the webhook URL to your desktop's public IP:
#     http://YOUR_PUBLIC_IP:8080/webhook
#     (You'll need to port-forward 8080 on your router, or use ngrok)

# 7c. For easy setup with ngrok (free):
#     Download from https://ngrok.com
#     ngrok http 8080
#     Use the ngrok URL as your TradingView webhook

# 7d. Alert message format (paste this in TradingView alert):
# {
#   "symbol": "{{ticker}}",
#   "action": "{{strategy.order.action}}",
#   "price": {{close}},
#   "volume": {{volume}},
#   "timeframe": "{{interval}}",
#   "exchange": "{{exchange}}",
#   "secret": "YOUR_TV_WEBHOOK_SECRET"
# }

# ============================================================
# STEP 8: SETUP LAPTOP AS MONITOR (Optional)
# ============================================================

# On your LAPTOP (8GB RAM):

cd Stud-Ex-Global-Markets-/studex-frontend
npm install
echo "NEXT_PUBLIC_TRADING_API_URL=http://DESKTOP_LOCAL_IP:8000" > .env.local
npm run dev

# Open http://localhost:3000/trading on the laptop browser
# It connects to the bot running on your desktop via local network

# ============================================================
# STEP 9: GO LIVE (When you're ready — USE WITH CAUTION)
# ============================================================

# ONLY after you've tested thoroughly in paper mode:

# 9a. Edit config/settings.yaml:
#   app:
#     environment: "live"
#
#   exchanges:
#     luno:
#       sandbox: false
#     binance:
#       sandbox: false

# 9b. Start with the live script (requires confirmation):
scripts\start_live.bat

# Or manually:
python main.py
# (No --paper flag = live mode)

# ============================================================
# ARCHITECTURE SUMMARY
# ============================================================
#
# ┌── VERCEL (Free) ──────────────────────────────┐
# │  Next.js Dashboard    https://your.vercel.app  │
# │  ├── /trading          Portfolio overview       │
# │  ├── /trading/positions Open positions          │
# │  ├── /trading/history   Trade log               │
# │  ├── /trading/strategies Strategy cards          │
# │  ├── /trading/analytics  RALF intelligence      │
# │  API Routes:                                    │
# │  ├── /api/trading/*    Trade storage + stats    │
# │  ├── /api/trading/analyze  Claude AI analysis   │
# │  └── /api/trading/cron  Weekly RALF report      │
# └─────────────────┬────────────────────────────────┘
#                   │ HTTPS
# ┌── DESKTOP ──────┼────────────────────────────────┐
# │  Trading Bot    │  (Python, async)                │
# │  ├── Engine ────┘  Pushes data to Vercel          │
# │  ├── RALF Loop     Self-improving feedback        │
# │  ├── RAG Engine    Trade memory + knowledge       │
# │  ├── Ollama        Mistral 7B + Llama 3.1 (GPU)  │
# │  ├── Swarm         50 AI sentiment agents         │
# │  ├── Strategies    Crypto + JSE + Pairs           │
# │  ├── LUNO          BTC/ZAR, ETH/ZAR              │
# │  ├── Binance       BTC/USDT, ETH/USDT            │
# │  ├── JSE           NPN, ANG, MTN, SHP...          │
# │  └── TradingView   Webhook alerts (:8080)         │
# └──────────────────────────────────────────────────┘
#
# COST:
#   Vercel ............ Free (Hobby) or $20/mo (Pro)
#   Ollama ............ Free (runs on your GPUs)
#   LUNO .............. Free API (trading fees only)
#   Binance ........... Free API (trading fees only)
#   EasyEquities ...... Free account
#   Claude API ........ ~$5/mo (optional, for advanced analysis)
#   TradingView ....... Free or $12.95/mo (for webhooks)
#   TOTAL ............. $0-38/month
#
# ============================================================
# TROUBLESHOOTING
# ============================================================
#
# Bot won't start?
#   → Check Python 3.11+: python --version
#   → Check venv activated: venv\Scripts\activate
#   → Check .env file exists: dir config\.env
#
# Ollama not connecting?
#   → Start Ollama: ollama serve
#   → Test: curl http://localhost:11434/api/tags
#   → Pull models: ollama pull mistral:7b-instruct-v0.3-q5_K_M
#
# Exchange connection failed?
#   → Check API keys in config/.env
#   → For LUNO: ensure API key has trade permissions
#   → For Binance: check IP whitelist includes your desktop
#   → The bot runs fine with just paper trading if exchanges fail
#
# Vercel not receiving data?
#   → Check vercel.enabled: true in settings.yaml
#   → Check api_url matches your Vercel deployment URL
#   → Check api_secret matches TRADING_BOT_SECRET in Vercel env vars
#   → Test: curl https://your.vercel.app/api/trading/health
#
# Dashboard showing no data?
#   → Data appears after the bot starts generating signals
#   → In paper mode, it takes a few minutes for first analysis cycle
#   → Check browser console for API errors
#
# TradingView webhooks not working?
#   → Port 8080 must be accessible (port forward or ngrok)
#   → Check webhook secret matches TV_WEBHOOK_SECRET in .env
#   → Test: curl -X POST http://localhost:8080/tradingview/test -d '{"test":true}'
#
# ============================================================
# DONE! Your automated trading bot is now running.
# Dashboard: https://your-app.vercel.app/trading
# ============================================================
