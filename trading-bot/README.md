# Studex Global Markets - Automated Trading Bot

AI-powered automated trading system for cryptocurrency and Johannesburg Stock Exchange (JSE), combining Claude Trading Skills methodology with MiroFish-inspired swarm sentiment analysis.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DESKTOP (The Brain)                          │
│                 2x 8GB GPU + Ollama                             │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Ollama      │  │  Trading     │  │  FastAPI Dashboard   │  │
│  │   LLM Models  │  │  Engine      │  │  API (:8000)         │  │
│  │  - Mistral 7B │  │  - Signals   │  │  - REST endpoints    │  │
│  │  - Llama 3.1  │  │  - Risk Mgmt │  │  - WebSocket live    │  │
│  └──────┬───────┘  │  - Execution  │  └──────────────────────┘  │
│         │          └──────┬───────┘                              │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────────────────────┐  │
│  │  Swarm        │  │  Strategies   │  │  TradingView         │  │
│  │  Sentiment    │  │  - Crypto Mom │  │  Webhook (:8080)     │  │
│  │  (50 agents)  │  │  - JSE Value  │  │  - Receives alerts   │  │
│  │              │  │  - Pair Trade  │  │  - Pine Script       │  │
│  └──────────────┘  └──────┬───────┘  └──────────────────────┘  │
│                    ┌──────▼───────┐                              │
│                    │  Connectors   │                              │
│                    │  - LUNO (ZAR) │                              │
│                    │  - Binance    │                              │
│                    │  - JSE/Easy   │                              │
│                    └──────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
                           │ Network
┌─────────────────────────────────────────────────────────────────┐
│                    LAPTOP (The Monitor)                         │
│                       8GB RAM                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js Dashboard (localhost:3000)                       │  │
│  │  - Live portfolio view    - Trade history                 │  │
│  │  - Position monitoring    - Strategy controls             │  │
│  │  - P&L charts             - System health                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Trading Methodology

### From Claude Trading Skills (tradermonty)
- **Market Regime Detection** — Macro-first analysis (Druckenmiller-style)
- **Breadth Analysis** — Composite health scoring (0-100)
- **VCP Screening** — Minervini Volatility Contraction Patterns
- **CANSLIM Adapted** — O'Neil growth factors for crypto
- **Exposure Coach** — Dynamic position sizing based on regime
- **Risk Pipeline** — Fixed fractional, ATR-based, Kelly Criterion sizing

### From MiroFish (Swarm Intelligence)
- **Multi-Agent Sentiment** — 50 simulated trading agents with diverse personalities
- **Consensus Detection** — Aggregate bullish/bearish/neutral voting
- **Contrarian Signals** — Flag extreme consensus as potential reversals
- **Local LLM Inference** — Runs on Ollama (your desktop GPUs)

## Supported Markets

| Market | Exchange | Pairs/Stocks | API |
|--------|----------|-------------|-----|
| **Crypto (ZAR)** | LUNO | BTC/ZAR, ETH/ZAR, XRP/ZAR, SOL/ZAR | LUNO API |
| **Crypto (USD)** | Binance | BTC/USDT, ETH/USDT, SOL/USDT + more | Binance API |
| **JSE Equities** | EasyEquities | Top 40 stocks (NPN, ANG, SOL, etc.) | Paper/EasyEQ |

## Quick Start

### Desktop Setup (The Brain)

```bash
# 1. Install prerequisites
# - Python 3.11+: https://python.org
# - Ollama: https://ollama.ai/download/windows
# - Git: https://git-scm.com

# 2. Clone and setup
cd trading-bot
scripts\setup_desktop.bat

# 3. Configure API keys
notepad config\.env

# 4. Start paper trading
scripts\start_bot.bat
```

### Laptop Setup (The Monitor)

```bash
# 1. Install Node.js: https://nodejs.org
# 2. Run setup
cd trading-bot
scripts\setup_laptop.bat

# 3. Update desktop IP in studex-frontend/.env.local
# 4. Start dashboard
cd studex-frontend
npm run dev
```

### Ollama Models (Desktop)

```bash
# Pull recommended models for 2x 8GB GPUs
ollama pull mistral:7b-instruct-v0.3-q5_K_M    # Strategy analysis
ollama pull llama3.1:8b-instruct-q4_K_M         # Fast screening

# Start Ollama server
ollama serve
```

## Strategies

### 1. Crypto Momentum
Multi-timeframe trend following with volume confirmation.
- Entry: EMA crossover + RSI momentum + MACD + Volume spike
- Exit: ATR-based stop loss (2 ATR) and take profit (4 ATR)
- Risk: Max 5% per position

### 2. JSE Value + Momentum
Value screening combined with VCP breakout entry.
- Screen: P/E <= 20, Div Yield >= 2%, ROE >= 15%
- Entry: VCP pattern + volume breakout + above 200 MA
- Exit: 7% stop loss, 15% trailing stop

### 3. Pair Trading
Statistical arbitrage on cointegrated pairs.
- Pairs: BTC/ETH, NPN/MTN, ANG/GFI
- Entry: Z-score > 2.0 from mean
- Exit: Z-score returns to 0.5

### 4. Sentiment Swarm
MiroFish-inspired multi-agent consensus.
- 50 AI agents with diverse trading personalities
- Consensus threshold: 70% agreement for signal
- Contrarian mode available for extreme readings

## TradingView Integration

### Webhook Setup
1. In TradingView, create an alert on your strategy
2. Set webhook URL: `http://YOUR_DESKTOP_IP:8080/webhook`
3. Use this alert message format:
```json
{
  "symbol": "{{ticker}}",
  "action": "{{strategy.order.action}}",
  "price": {{close}},
  "volume": {{volume}},
  "timeframe": "{{interval}}",
  "exchange": "{{exchange}}",
  "secret": "your_webhook_secret"
}
```

### Pine Script
A ready-to-use Pine Script strategy template is included in `connectors/tradingview_webhook.py`.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | System health status |
| `/api/portfolio` | GET | Current portfolio state |
| `/api/positions` | GET | Open positions |
| `/api/trades` | GET | Trade history |
| `/api/trades/stats` | GET | Win rate, P&L stats |
| `/api/strategies` | GET | Strategy status |
| `/api/strategies/toggle` | POST | Enable/disable strategy |
| `/api/trade` | POST | Manual trade execution |
| `/api/market/{symbol}` | GET | Market data (OHLCV) |
| `/ws` | WebSocket | Real-time portfolio updates |

## Risk Management

- **Daily Loss Limit**: 5% — stops all trading
- **Max Drawdown**: 15% — suspends all strategies
- **Position Sizing**: ATR-based (default), Kelly, or fixed fractional
- **Max Positions**: 10 concurrent
- **Crypto Exposure**: Max 30% of portfolio
- **Equity Exposure**: Max 80% of portfolio
- **Cash Reserve**: Always maintain 10% minimum

## Configuration

All settings in `config/settings.yaml`:
- Exchange API connections
- Strategy parameters and schedules
- Risk limits and position sizing
- Ollama model selection
- Notification preferences (Telegram, Email)
- TradingView webhook settings

## Project Structure

```
trading-bot/
├── main.py                    # Entry point & orchestrator
├── requirements.txt           # Python dependencies
├── core/
│   ├── engine.py              # Trading engine (main loop)
│   ├── models.py              # Data models (Signal, Order, Position)
│   ├── risk_manager.py        # Risk checks & position sizing
│   └── position_manager.py    # Position tracking & P&L
├── connectors/
│   ├── base.py                # Abstract connector interface
│   ├── crypto_connector.py    # LUNO + Binance (via CCXT)
│   ├── jse_connector.py       # JSE / EasyEquities
│   └── tradingview_webhook.py # TradingView alert receiver
├── strategies/
│   ├── base_strategy.py       # Base strategy with indicators
│   ├── crypto_momentum.py     # Multi-TF crypto momentum
│   ├── jse_value_momentum.py  # JSE value + VCP breakout
│   └── pair_trading.py        # Statistical arbitrage
├── sentiment/
│   ├── swarm_engine.py        # MiroFish-style multi-agent
│   └── llm_analyst.py         # Ollama LLM strategy analyst
├── api/
│   └── server.py              # FastAPI dashboard server
├── config/
│   ├── settings.yaml          # Main configuration
│   └── .env.example           # API keys template
├── scripts/
│   ├── setup_desktop.bat      # Desktop setup (Windows)
│   ├── setup_laptop.bat       # Laptop setup (Windows)
│   ├── start_bot.bat          # Start paper trading
│   └── start_live.bat         # Start live trading
└── data/                      # Logs, trade history, DB
```

## Required API Keys

| Service | Required | Cost | Purpose |
|---------|----------|------|---------|
| LUNO | For SA crypto | Free | Trade BTC/ETH/XRP in ZAR |
| Binance | For global crypto | Free | Trade on world's largest exchange |
| EasyEquities | For JSE | Free account | Trade SA stocks |
| Ollama | Required | Free (local) | AI analysis on your GPU |
| TradingView | Optional | Free-$60/mo | Charts + webhook alerts |
| Claude API | Optional | Pay-per-use | Advanced analysis fallback |
| FMP API | Optional | Free tier | Extended market data |

## Safety Features

1. **Paper trading by default** — No real money until you explicitly switch
2. **Daily loss circuit breaker** — Auto-stops at 5% daily loss
3. **Max drawdown kill switch** — Suspends at 15% drawdown
4. **Position size limits** — Never risks more than configured %
5. **Regime-aware trading** — Reduces exposure in contracting markets
6. **Explicit live mode confirmation** — Must type "YES I UNDERSTAND"

## Disclaimer

This software is for educational and research purposes. Cryptocurrency and stock trading involves significant risk of financial loss. Past performance does not guarantee future results. Always test thoroughly with paper trading before using real funds. The developers are not responsible for any financial losses incurred through use of this software.
