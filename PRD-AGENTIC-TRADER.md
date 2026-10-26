# Product Requirements Document (PRD)
# Agentic Trader — AI-Powered Autonomous Trading Platform

**Version:** 2.0.0
**Date:** 2026-10-26
**Status:** Draft
**Author:** Studex Global Markets Engineering (t.ramaphosa@studex.dev)

---

## 1. Executive Summary

Agentic Trader is an AI-powered autonomous trading platform that combines four open-source technologies into a unified system capable of trading cryptocurrency (LUNO ZAR, Binance USDT, Solana DeFi), Johannesburg Stock Exchange (JSE) equities, prediction markets, and perpetual futures — all managed by a self-improving AI agent that learns from every trade it makes.

The platform integrates:
- **Claude Trading Skills** (tradermonty) — 50+ systematic trading methodologies including market regime detection, breadth analysis, VCP screening, CANSLIM, and exposure coaching
- **MiroFish** — Swarm intelligence engine using multi-agent social simulation for sentiment prediction
- **CloddsBot** (alsk1992) — Full AI trading terminal with 119 skills, 10 prediction markets, 7 futures exchanges, and Solana/EVM DeFi
- **OpenBB** — Open-source financial data platform aggregating 33 data providers through one unified API

The system runs on consumer hardware (Mac Mini or Windows desktop with GPUs) with a cloud dashboard on Vercel, costs $0-38/month to operate, starts in paper trading mode by default, and gets smarter with every trade through its RALF (Reason-Act-Learn-Feedback) self-improving loop with self-evolving skill capabilities.

---

## 2. Problem Statement

### Current Pain Points
1. **Manual trading is time-consuming** — Monitoring multiple markets (crypto 24/7, JSE 09:00-17:00 SAST) requires constant attention
2. **No SA-specific automation tools** — Most trading bots are built for US markets; none integrate LUNO (ZAR pairs), JSE equities, and SARB economic data natively
3. **Fragmented data sources** — Traders must manually check Yahoo Finance, TradingView, exchange apps, and news separately
4. **No learning from mistakes** — Most bots repeat the same errors without adapting; no feedback loop connects outcomes to strategy adjustments
5. **High barrier to entry** — Existing algorithmic trading platforms require expensive infrastructure, quant expertise, or costly subscriptions
6. **AI model lock-in** — Most AI trading tools force a single LLM provider; switching requires rewriting code

### Opportunity
By combining four proven open-source technologies with a self-improving AI agent, Agentic Trader provides a fully automated trading system that:
- Runs on hardware you already own (Mac or Windows)
- Costs near-zero to operate (free LLM via Ollama, free exchange APIs)
- Learns from its own trading history via RALF loop
- Evolves its own strategies via LLM-powered skill optimization
- Covers both South African markets (LUNO, JSE) and global markets (Binance, Solana, prediction markets)
- Lets you pick any AI provider (7 supported) and swap with one config change

---

## 3. Goals & Success Metrics

### Primary Goals
| Goal | Metric | Target |
|------|--------|--------|
| Automated trade execution | Trades executed without human intervention | 10+ per day |
| Self-improvement via RALF | Win rate improvement over 30 days | +5% from baseline |
| Multi-market coverage | Markets actively traded | 3+ (crypto, JSE, prediction) |
| Risk management | Maximum drawdown in any 30-day period | < 15% |
| Uptime | Bot running without manual restart | 99%+ (24/7 crypto, market hours JSE) |
| Cost efficiency | Monthly operating cost | < R700 ($38 USD) |

### Secondary Goals
- Achieve positive Sharpe ratio (> 1.0) within 90 days of live trading
- Generate 3+ actionable RALF learnings per week
- Successfully detect 2+ arbitrage opportunities per month via CloddsBot
- Maintain < 40% stop-out rate across all strategies
- Complete daily morning briefing within 2 minutes of scheduled time

---

## 4. User Personas

### 4.1 Primary: South African Active Trader
- **Profile:** Individual trader in South Africa with R50K-R500K trading capital
- **Needs:** Automated trading across LUNO (crypto) and JSE (equities), SARB-aware strategies, ZAR-denominated P&L tracking
- **Hardware:** Mac Mini or Windows desktop (GPU optional), plus laptop for monitoring
- **Technical level:** Comfortable with installing software and editing config files; not a programmer

### 4.2 Secondary: Global Crypto Trader
- **Profile:** Crypto-focused trader using Binance, Solana DeFi, and prediction markets
- **Needs:** 24/7 automated trading, arbitrage detection, sentiment analysis, DeFi integration
- **Hardware:** Any computer running Ollama or cloud-only setup
- **Technical level:** Comfortable with CLI tools and API keys

### 4.3 Tertiary: Quantitative Developer
- **Profile:** Developer building custom trading strategies on top of the platform
- **Needs:** Extensible architecture, Python/TypeScript APIs, backtesting framework, RAG knowledge base
- **Hardware:** Development machine with GPU for local LLM inference
- **Technical level:** Writes code, extends strategies, creates custom skills

---

## 5. Feature Requirements

### 5.1 Core Trading Engine

#### 5.1.1 Signal Processing Pipeline
- **Description:** Async event-driven engine that processes trading signals from multiple sources (strategies, TradingView webhooks, CloddsBot, sentiment swarm) through a unified risk management pipeline before execution.
- **Priority:** P0
- **Module:** `core/engine.py`
- **Key behaviors:**
  - Signal queue with priority ordering
  - Regime-aware filtering (block new entries in contraction)
  - Risk check before every execution
  - Position size calculation (ATR/Kelly/Fixed Fractional)
  - Order routing to correct exchange based on asset class

#### 5.1.2 Risk Management System
- **Description:** Multi-layered risk controls that protect capital at portfolio, strategy, and position levels.
- **Priority:** P0
- **Module:** `core/risk_manager.py`
- **Controls:**
  - Maximum 2% portfolio risk per trade
  - Daily loss limit: 5% (auto-pause all trading)
  - Maximum drawdown: 15% (kill switch)
  - Maximum 10 concurrent positions
  - Maximum 30% crypto exposure, 80% equity exposure
  - Minimum 10% cash reserve at all times
  - Maximum 3 correlated positions per sector

#### 5.1.3 Position Manager
- **Description:** Real-time tracking of all open positions with P&L calculation, stop loss monitoring, and trade history recording.
- **Priority:** P0
- **Module:** `core/position_manager.py`
- **Features:**
  - Live price updates from exchange connectors
  - Automatic stop loss / take profit execution
  - Trailing stop support
  - Trade history with full audit trail
  - Portfolio state snapshots for time-series analysis

### 5.2 Exchange Connectors

#### 5.2.1 LUNO Connector (South African Crypto)
- **Description:** Trade Bitcoin, Ethereum, XRP, and Solana in South African Rand via LUNO exchange.
- **Priority:** P0
- **Module:** `connectors/crypto_connector.py` (via CCXT)
- **Pairs:** XBTZAR, ETHZAR, XRPZAR, SOLZAR
- **Features:** Market/limit orders, balance queries, OHLCV data, order book

#### 5.2.2 Binance Connector (Global Crypto)
- **Description:** Global cryptocurrency trading with access to 500+ pairs and futures markets.
- **Priority:** P0
- **Module:** `connectors/crypto_connector.py` (via CCXT)
- **Pairs:** BTC/USDT, ETH/USDT, SOL/USDT, XRP/USDT, BNB/USDT (configurable)
- **Features:** Spot + futures, market/limit/stop orders, WebSocket streaming

#### 5.2.3 JSE Connector (Johannesburg Stock Exchange)
- **Description:** Trade South African equities via EasyEquities with Yahoo Finance data.
- **Priority:** P1
- **Module:** `connectors/jse_connector.py`
- **Stocks:** JSE Top 40 (NPN, ANG, SOL, SBK, FSR, BHP, MTN, VOD, SHP, ABG, etc.)
- **Features:** Paper trading (default), market data via Yahoo Finance (.JO suffix), JSE Top 40 screener
- **Note:** EasyEquities lacks an official API; paper trading until broker API available. Interactive Brokers recommended for live JSE execution.

#### 5.2.4 TradingView Webhook Receiver
- **Description:** HTTP server that receives alerts from TradingView Pine Script strategies and converts them to trading signals.
- **Priority:** P1
- **Module:** `connectors/tradingview_webhook.py`
- **Port:** 8080
- **Features:** JSON/text alert parsing, secret-based authentication, Pine Script template included

#### 5.2.5 CloddsBot Exchange Access
- **Description:** Via CloddsBot agent, access 10 prediction markets, 7 futures exchanges, and 14 DeFi protocols.
- **Priority:** P2
- **Module:** `agents/cloddsbot_agent.py`
- **Platforms:** Polymarket, Kalshi, Betfair, Binance Futures (125x), Bybit (100x), Hyperliquid (50x), MEXC (200x), Jupiter, Raydium, Uniswap V3, 1inch

### 5.3 Trading Strategies

#### 5.3.1 Crypto Momentum Strategy
- **Description:** Multi-timeframe trend following using EMA crossovers, RSI momentum, MACD confirmation, volume spikes, and ADX trend strength.
- **Priority:** P0
- **Module:** `strategies/crypto_momentum.py`
- **Methodology:** Adapted from Claude Trading Skills' CANSLIM for crypto
- **Entry:** All 3 timeframes (1h, 4h, 1d) must align. Score ≥ 3/6 per timeframe. Volume > 1.5x average.
- **Exit:** Stop loss at 2 ATR, take profit at 4 ATR (2:1 R:R minimum). Forced exit on RSI > 80 or MACD histogram negative.
- **Risk:** Maximum 5% per position.

#### 5.3.2 JSE Value + VCP Strategy
- **Description:** Value screening (P/E, dividend yield, ROE) combined with Minervini Volatility Contraction Pattern breakout entry.
- **Priority:** P0
- **Module:** `strategies/jse_value_momentum.py`
- **Methodology:** Claude Trading Skills' VCP Screener + Value Dividend Screener
- **Screen:** P/E ≤ 20, Dividend Yield ≥ 2%, ROE ≥ 15%
- **Entry:** VCP pattern detected + volume breakout + price above 200-day MA
- **Exit:** 7% stop loss, 15% trailing stop.
- **Risk:** Maximum 8% per position.

#### 5.3.3 Pair Trading (Statistical Arbitrage)
- **Description:** Mean reversion on cointegrated pairs using z-score signals and hedge ratios.
- **Priority:** P1
- **Module:** `strategies/pair_trading.py`
- **Methodology:** Claude Trading Skills' Pair Trade Screener + Engle-Granger cointegration
- **Pairs:** BTC/ETH (crypto), NPN/MTN (JSE tech), ANG/GFI (gold miners)
- **Entry:** Z-score > 2.0 (long cheap, short expensive). **Exit:** Z-score returns to 0.5.

#### 5.3.4 Sentiment Swarm Strategy
- **Description:** MiroFish-inspired multi-agent consensus analysis using 50 AI trading agents with diverse personality archetypes.
- **Priority:** P1
- **Module:** `sentiment/swarm_engine.py`
- **Agents:** 10 archetypes × 5 each = 50 agents (Momentum Trader, Value Investor, Technical Analyst, Macro Strategist, Sentiment Trader, Risk Manager, Crypto Native, Quant Trader, SA Economist, Day Trader)
- **Signal:** 70% consensus threshold for signal generation. Contrarian flag at > 85% agreement.
- **Inference:** Ollama (local GPU), ~2 seconds per full swarm analysis.

#### 5.3.5 CloddsBot Auto Strategy
- **Description:** Delegate strategy selection to CloddsBot's 119 skills based on current market conditions, regime, and RALF performance data.
- **Priority:** P2
- **Module:** `agents/orchestrator.py`
- **Features:** Auto-selects from 118+ strategies (momentum, mean reversion, penny clipper, expiry fade, DCA, arbitrage, whale tracking, copy trading). Includes cross-platform arbitrage detection (arXiv:2508.03474).

### 5.4 AI & Intelligence Layer

#### 5.4.1 Universal AI Provider System
- **Description:** Hot-swappable LLM backends with automatic fallback. Pick any provider in config — no code changes.
- **Priority:** P0
- **Module:** `core/ai_providers.py`
- **Providers:**

| Provider | Type | Cost | Best For |
|----------|------|------|----------|
| Ollama | Local | Free | Mac (Apple Silicon), Linux |
| LM Studio | Local | Free | Windows (NVIDIA GPU) |
| Claude (Anthropic) | Cloud | ~$3/M tokens | Best quality analysis |
| OpenAI GPT-4o | Cloud | ~$2.50/M tokens | General purpose |
| Groq | Cloud | Free tier | Ultra-fast inference |
| OpenRouter | Cloud | Varies | Any model, unified billing |
| Google Gemini | Cloud | Free tier | High volume, cheap |

- **Configuration:**
```yaml
ai:
  primary: "ollama"        # First choice
  fallback: "groq"         # Auto-fallback
  embed_provider: "ollama" # For RAG embeddings
```

#### 5.4.2 Ollama LLM Analyst
- **Description:** Local GPU-powered analyst for real-time market regime detection, trade setup validation, daily briefings, and news sentiment screening.
- **Priority:** P0
- **Module:** `sentiment/llm_analyst.py`
- **Models:** Mistral 7B (strategy analysis), Llama 3.1 8B (fast screening), nomic-embed-text (RAG embeddings)
- **Functions:** `detect_market_regime()`, `analyze_trade_setup()`, `generate_daily_briefing()`, `screen_news_sentiment()`

#### 5.4.3 CloddsBot Agent Integration
- **Description:** CloddsBot as the central AI brain with 119 skills, accessed via HTTP API or MCP server.
- **Priority:** P1
- **Module:** `agents/cloddsbot_agent.py`, `agents/orchestrator.py`
- **Functions:** `analyze_and_decide()`, `scan_arbitrage()`, `get_strategy_recommendation()`, `execute_prediction_market_trade()`, `run_skill()`
- **Key principle:** CloddsBot is an intelligence amplifier, not a dependency. If unavailable, Python strategies run independently.

### 5.5 RALF Self-Improvement Loop

#### 5.5.1 Trade Journal & Outcome Classification
- **Description:** Record every trade from hypothesis to outcome. Classify results as TRUE_POSITIVE, FALSE_POSITIVE, STOPPED_OUT, REGIME_MISMATCH, or TIME_DECAY.
- **Priority:** P0
- **Module:** `ralf/ralf_engine.py`
- **Storage:** SQLite (`data/ralf.db`)
- **Recorded per trade:** Hypothesis, regime, confidence, indicator snapshot (before); entry/exit prices, P&L, MFE/MAE, hold duration (after); outcome classification, postmortem (learn phase).

#### 5.5.2 Statistical Feedback Engine
- **Description:** Daily statistical analysis of strategy performance with automatic parameter adjustment recommendations.
- **Priority:** P0
- **Module:** `ralf/ralf_engine.py`
- **Schedule:** Daily at 17:00 SAST (after JSE close)
- **Adjustments detected:**
  1. Win rate declining → tighten entry confidence threshold
  2. Too many stop-outs (> 40%) → widen ATR stop multiplier
  3. Regime underperformance → disable strategy in that regime
  4. Profit factor < 1.2 → reduce position size by 25%
  5. Losing trades held too long → add time-based exit
  6. MFE >> actual profit → switch to trailing stop (exiting too early)

#### 5.5.3 Learning Extraction
- **Description:** Weekly mining of trade history for patterns (best hours, confidence calibration, regime-strategy combos).
- **Priority:** P0
- **Module:** `ralf/ralf_engine.py`
- **Schedule:** Weekly on Saturdays
- **Learnings extracted:** Best entry hour of day, confidence calibration per bucket (low/medium/high vs actual win rate), regime-strategy performance matrix.

#### 5.5.4 Self-Evolving Skills (JiuwenClaw-inspired)
- **Description:** When RALF detects a strategy is CRITICAL or WARNING, the skill evolution engine uses LLM to propose CODE-LEVEL fixes — not just parameter tweaks.
- **Priority:** P1
- **Module:** `ralf/skill_evolution.py`
- **Pipeline:**
  1. **SignalDetector** — Identifies structural issues: strategy decay (< 35% WR), regime blindness (< 25% WR in specific regime), repeated failure patterns (5+ stop-outs), anomalous RALF loops (same adjustment repeated).
  2. **SkillOptimizer** — LLM proposes specific changes: "Add RSI divergence check before entry," "Switch to trailing stop after 1 ATR profit," "Disable in contraction regime."
  3. **EvolutionRecord** — Full audit trail with status (proposed → applied → measured OR rejected/rolled back), impact scoring.
- **Storage:** `data/evolutions.json`
- **Rule-based fallback** when LLM unavailable.

### 5.6 RAG Knowledge System

#### 5.6.1 Vector Store & Retrieval
- **Description:** Semantic search over trade memory, strategy docs, news, and learnings using Ollama embeddings in SQLite.
- **Priority:** P0
- **Module:** `rag/rag_engine.py`
- **Embedding model:** nomic-embed-text (768 dimensions, via Ollama)
- **Storage:** SQLite (`data/rag.db`) with numpy vectors
- **Retrieval:** Cosine similarity + keyword fallback. Top-K (default 5), minimum similarity 0.3.

#### 5.6.2 Knowledge Base Documents
- **Description:** Curated strategy methodology documents ingested into RAG for informed decision-making.
- **Priority:** P0
- **Directory:** `knowledge_base/`
- **Documents:**
  - `market_regimes.md` — Regime classification framework (broadening, contraction, inflationary, transitional, concentration) with SA-specific notes (SARB, load shedding, ZAR dynamics)
  - `crypto_momentum_rules.md` — Entry/exit conditions, scoring system, position sizing, known edge decay signals
  - `jse_trading_guide.md` — JSE market hours, sector breakdown, VCP detection, SARB impact, economic calendar
  - `SKILLS.md` — Master registry of all 134 skills (15 Studex + 119 CloddsBot)
  - `MEMORY.md` — Complete memory architecture documentation (5 layers, data flow, "day in the life" timeline)

#### 5.6.3 Auto-Ingestion
- **Description:** Automatically ingest closed trades and RALF learnings into RAG for future context retrieval.
- **Priority:** P1
- **Triggers:** Every closed trade → `ingest_trade_memory()`. Every RALF learning → `ingest_learning()`. News articles → `ingest_news()`.

### 5.7 Dashboard & Monitoring

#### 5.7.1 Vercel-Hosted Dashboard (Next.js)
- **Description:** Cloud-accessible dashboard deployed on Vercel with real-time portfolio monitoring and AI chat.
- **Priority:** P0
- **Directory:** `studex-frontend/app/trading/`
- **Pages:**

| Page | Route | Description |
|------|-------|-------------|
| Main Dashboard | `/trading` | Portfolio summary, regime, signals, RALF status, AI chat bubble |
| Open Positions | `/trading/positions` | Live position table with P&L |
| Trade History | `/trading/history` | Filtered trade log with outcome classification |
| Strategies | `/trading/strategies` | Strategy cards with rules, status, methodology |
| Analytics | `/trading/analytics` | Win rate, profit factor, regime breakdown, RALF adjustments |
| Skills | `/trading/skills` | All 134 skills organized by category with search |
| Memory Log | `/trading/memory` | Daily timeline of bot activity (trades, signals, RALF, regime) |
| Simulate | `/trading/simulate` | Backtesting sandbox with strategy/symbol/date config |
| AI Settings | `/trading/ai-settings` | Pick LLM provider (Mac/Windows toggle, provider cards) |

#### 5.7.2 API Routes (Next.js)
- **Description:** REST API for the desktop bot to push data to Vercel and for the dashboard to query.
- **Priority:** P0
- **Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/trading/health` | GET | System health status |
| `/api/trading/trades` | GET/POST | Store and query trades |
| `/api/trading/portfolio` | GET/POST | Portfolio time-series |
| `/api/trading/signals` | GET/POST | Signal log |
| `/api/trading/ralf` | GET/POST | RALF feedback data |
| `/api/trading/analyze` | POST | Claude AI analysis (Vercel AI SDK) |
| `/api/trading/validate` | POST | High-value trade validation |
| `/api/trading/chat` | POST | Interactive AI trading assistant |
| `/api/trading/cron` | GET | Weekly RALF report (Vercel Cron) |

#### 5.7.3 AI Trading Chat Assistant
- **Description:** Floating chat bubble on the dashboard. Context-aware — injects portfolio, stats, signals, and RALF data into Claude prompts.
- **Priority:** P1
- **Module:** `studex-frontend/app/api/trading/chat/route.ts`
- **Features:** Claude via Vercel AI SDK when API key configured. Rule-based fallback (portfolio queries, win rate, strategy info) without API key.

#### 5.7.4 FastAPI Local Server
- **Description:** REST + WebSocket API server running on the desktop for local monitoring.
- **Priority:** P1
- **Module:** `api/server.py`
- **Port:** 8000
- **Features:** Portfolio state, positions, trades, strategy toggle, manual trade execution, WebSocket real-time updates.

---

## 6. Technical Architecture

### 6.1 System Architecture

```
┌── CloddsBot Agent (The Brain) ───────────────────────┐
│  TypeScript/Node.js | 119 Skills | Claude + Ollama    │
│  Prediction Markets | Futures | Solana/EVM DeFi       │
│  Arbitrage Detection | Risk Engine | Kill Switch       │
└───────────────────────┬──────────────────────────────┘
                        │ HTTP API / MCP
┌───────────────────────┼──────────────────────────────┐
│  Studex Python Pipeline (The Body)                    │
│  ├── Trading Engine (async signal processing)         │
│  ├── Strategies (momentum, VCP, pairs, swarm)        │
│  ├── Risk Manager (ATR/Kelly sizing, exposure limits) │
│  ├── RALF Loop (SQL-based self-improvement)          │
│  │   └── Skill Evolution (LLM-proposed code changes) │
│  ├── RAG Engine (trade memory + strategy knowledge)   │
│  ├── AI Providers (7 LLMs, hot-swappable)            │
│  ├── Swarm Sentiment (50 MiroFish-style agents)      │
│  ├── Exchange Connectors (LUNO, Binance, JSE)        │
│  └── TradingView Webhook Receiver (:8080)            │
│                                                       │
│  Local API Server (:8000) — REST + WebSocket          │
└───────────────────────┬──────────────────────────────┘
                        │ HTTPS
┌───────────────────────┼──────────────────────────────┐
│  Vercel (The Dashboard)                               │
│  ├── 9 Dashboard Pages (portfolio, trades, RALF, etc.)│
│  ├── 9 API Routes (data storage, AI analysis, chat)  │
│  ├── AI Chat Assistant (Claude via Vercel AI SDK)     │
│  ├── Vercel Cron (weekly RALF report, Saturdays)     │
│  └── In-memory store (upgradeable to Vercel Postgres)│
└──────────────────────────────────────────────────────┘
```

### 6.2 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Trading Engine** | Python 3.11+, asyncio | Core signal processing and execution |
| **Exchange API** | CCXT 4.4, yfinance | Unified exchange connector library |
| **Technical Analysis** | ta, pandas-ta, numpy, pandas | Indicator calculation |
| **AI (Local)** | Ollama, LM Studio | Free local LLM inference |
| **AI (Cloud)** | Claude API, OpenAI, Groq, Gemini, OpenRouter | Cloud LLM providers |
| **Agent** | CloddsBot (TypeScript/Node.js 22) | 119-skill trading agent |
| **RAG** | SQLite + numpy embeddings | Vector search for trade memory |
| **Dashboard** | Next.js 14, React 18, TypeScript | Vercel-hosted web dashboard |
| **Styling** | Tailwind CSS 3.4, Lucide icons | Dashboard UI |
| **Charts** | Recharts 2.10 | Performance visualization |
| **API** | FastAPI (local), Next.js API routes (cloud) | REST + WebSocket |
| **Database** | SQLite (local), Vercel Postgres (cloud) | Trade journal, RAG vectors |
| **Scheduling** | APScheduler, Vercel Cron | Strategy schedules, RALF cycles |
| **Logging** | Loguru | Structured logging with rotation |
| **Auth** | Firebase Auth | Dashboard user authentication |
| **Hosting** | Vercel (free tier) | Dashboard + API deployment |

### 6.3 Data Models

```json
{
  "Signal": {
    "strategy_name": "string",
    "symbol": "string",
    "signal_type": "buy | sell | hold | close",
    "confidence": "float (0-1)",
    "timestamp": "datetime",
    "timeframe": "1m | 5m | 15m | 30m | 1h | 4h | 1d | 1w",
    "asset_class": "crypto | jse_equity | us_equity",
    "entry_price": "float | null",
    "stop_loss": "float | null",
    "take_profit": "float | null",
    "metadata": {
      "source": "string",
      "atr": "float",
      "rsi": "float",
      "max_position_pct": "float"
    }
  },
  "Position": {
    "symbol": "string",
    "side": "buy | sell",
    "quantity": "float",
    "entry_price": "float",
    "current_price": "float",
    "unrealized_pnl": "float",
    "stop_loss": "float | null",
    "take_profit": "float | null",
    "strategy_name": "string",
    "asset_class": "string",
    "opened_at": "datetime"
  },
  "PortfolioState": {
    "total_equity": "float",
    "cash": "float",
    "positions": "Position[]",
    "unrealized_pnl": "float",
    "realized_pnl": "float",
    "daily_pnl": "float",
    "max_drawdown": "float (percentage)",
    "timestamp": "datetime"
  },
  "RALFFeedback": {
    "strategy": "string",
    "health": "HEALTHY | WARNING | CRITICAL | EVALUATING",
    "win_rate": "float",
    "profit_factor": "float",
    "trade_count": "integer",
    "adjustments": "Adjustment[]",
    "regime_performance": "Record<string, RegimePerf>"
  },
  "EvolutionRecord": {
    "id": "string",
    "strategy": "string",
    "signal_type": "decay | regime_fail | pattern | anomaly",
    "proposed_change": "string",
    "change_type": "param_tweak | logic_add | filter_add | rule_modify",
    "confidence": "float",
    "status": "proposed | applied | rejected | rolled_back",
    "impact_score": "float | null"
  }
}
```

### 6.4 Daily Schedule

```
SAST     Event                           Component
─────    ─────────────────────────────   ──────────────────
06:00    Morning briefing generation      Ollama LLM Analyst
06:30    Sentiment swarm analysis          Swarm Engine (50 agents)
07:00    Market regime detection            Ollama / CloddsBot
07:30    Breadth analysis                   Strategy Engine
08:00    Strategy signal generation         All strategies
08:30    Risk check and exposure review     Risk Manager
09:00    JSE market opens                   JSE Connector
12:00    Midday review                      Strategy Engine
17:00    JSE market closes                  JSE Connector
17:00    RALF daily feedback cycle          RALF Engine
17:05    Skill evolution check              Skill Evolution Engine
17:30    RAG ingestion (today's trades)     RAG Engine
17:30    Daily report generation            Ollama / Vercel
22:00    Crypto night scan                  Crypto Strategies
SAT      Weekly RALF learning extraction    RALF Runner
SAT      Weekly strategy review             Vercel Cron + Claude AI
```

---

## 7. Implementation Phases

### Phase 1: Core Engine (Complete)
- [x] Trading engine with async signal processing
- [x] Risk manager (ATR/Kelly/Fixed Fractional sizing)
- [x] Position manager with P&L tracking
- [x] LUNO connector (SA crypto)
- [x] Binance connector (global crypto)
- [x] JSE connector (paper trading + Yahoo Finance data)
- [x] Crypto momentum strategy
- [x] JSE value + VCP strategy
- [x] Pair trading strategy
- [x] TradingView webhook receiver
- [x] Configuration system (YAML + .env)
- [x] Windows setup/start scripts

### Phase 2: AI Intelligence (Complete)
- [x] MiroFish-inspired swarm sentiment engine (50 agents)
- [x] Ollama LLM analyst (regime detection, briefings, validation)
- [x] Universal AI provider system (7 providers, hot-swappable)
- [x] CloddsBot agent integration (119 skills)
- [x] Agent orchestrator (data flow coordination)
- [x] FastAPI local dashboard server

### Phase 3: Self-Improvement (Complete)
- [x] RALF engine (Reason-Act-Learn-Feedback)
- [x] Trade journal with outcome classification
- [x] Statistical feedback engine (daily)
- [x] Learning extraction (weekly)
- [x] Self-evolving skills (JiuwenClaw-inspired)
- [x] RAG knowledge system with vector search
- [x] Strategy knowledge base documents
- [x] SKILLS.md and MEMORY.md registries

### Phase 4: Cloud Dashboard (Complete)
- [x] Vercel deployment with Next.js API routes
- [x] Trading dashboard (9 pages)
- [x] AI chat assistant with context injection
- [x] Vercel Cron for weekly RALF reports
- [x] Sidebar navigation integration
- [x] In-memory trading store (Vercel Postgres-ready)

### Phase 5: Expansion (Planned)
- [ ] OpenBB integration (33 data providers, unified API)
- [ ] Live JSE execution (Interactive Brokers or broker API)
- [ ] Telegram/Discord notification channels
- [ ] Karpathy-style nanoGPT for price prediction on trade data
- [ ] Multi-machine orchestration (Mac Mini + MacBook)
- [ ] Vercel Postgres migration for persistent analytics
- [ ] Custom Pine Script strategy library
- [ ] Mobile-responsive dashboard optimization

---

## 8. Security & Compliance

### 8.1 Credential Management
- All API keys stored in `.env` file (gitignored)
- Environment variable substitution in YAML config (`${VAR_NAME}`)
- AES-256-GCM encrypted credentials in CloddsBot
- Webhook endpoints authenticated with shared secrets

### 8.2 Trading Safety
- Paper trading mode by default — no real money until explicit switch
- Live mode requires typed confirmation: "YES I UNDERSTAND"
- Daily loss circuit breaker (5%)
- Maximum drawdown kill switch (15%)
- All trade decisions logged with full audit trail
- SHA-256 trade ledger integrity hashing (via CloddsBot)

### 8.3 Data Privacy
- All data stored locally by default (SQLite)
- Cloud sync (Vercel) is optional and opt-in
- No customer data shared with third parties
- API keys never logged or transmitted beyond their target service

### 8.4 South African Compliance
- LUNO is FSCA-registered (SA Financial Sector Conduct Authority)
- JSE trading via regulated broker (EasyEquities or Interactive Brokers)
- ZAR-denominated reporting for SARS tax purposes
- Trade history export for tax compliance

---

## 9. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Startup time | < 30 seconds to first signal check |
| Signal processing latency | < 1 second (signal → risk check → order) |
| Ollama inference time | < 5 seconds for 7B model response |
| Swarm analysis time | < 30 seconds for 50-agent consensus |
| Dashboard load time | < 2 seconds (Vercel Edge) |
| WebSocket update frequency | Every 5 seconds (portfolio state) |
| Database query time | < 10ms (SQLite local) |
| RAG retrieval time | < 100ms (embedding search) |
| Daily uptime | 99%+ (crypto 24/7, JSE market hours) |
| Memory footprint | < 2GB RAM (Python bot) |
| Disk usage | < 5GB (including Ollama models) |

---

## 10. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Exchange API rate limiting | High | Medium | Built-in rate limiting via CCXT, request caching |
| Ollama model not loaded | Medium | Low | Automatic fallback to cloud provider (Groq free tier) |
| LUNO API downtime | Low | High | Alert + auto-pause LUNO strategies, continue Binance |
| Strategy generates bad signals | Medium | High | RALF loop auto-detects and adjusts; skill evolution proposes fixes |
| Network outage | Low | High | Local SQLite ensures no data loss; reconnect on recovery |
| Overfitting in RALF | Medium | Medium | Minimum trade count (5) before feedback; look-back windows |
| CloddsBot unavailable | Medium | Low | Python strategies run independently (CloddsBot is amplifier, not dependency) |
| Flash crash / black swan | Low | Critical | Circuit breaker (5% daily), kill switch (15% drawdown), cash reserve (10%) |
| API key compromise | Low | Critical | Keys in .env (gitignored), per-IP restrictions on exchanges |
| Vercel free tier limits | Medium | Low | In-memory store works without Postgres; upgrade to Pro ($20/mo) if needed |

---

## 11. Cost Analysis

### 11.1 Monthly Operating Costs

| Service | Free Tier | Pro Setup | Notes |
|---------|-----------|-----------|-------|
| **Vercel** | $0 (Hobby) | $20 | Dashboard hosting + API routes |
| **Ollama** | $0 | $0 | Runs locally on your hardware |
| **LUNO** | $0 | $0 | No API fees; trading commissions only |
| **Binance** | $0 | $0 | No API fees; trading commissions 0.1% |
| **EasyEquities** | $0 | $0 | Free account; brokerage fees on trades |
| **Claude API** | — | ~$5-15 | Optional, for advanced analysis (~R0.05/call) |
| **Groq** | $0 (30 req/min) | $0 | Free tier sufficient for most use |
| **TradingView** | $0 | $12.95 | Free for charts; Essential for webhooks |
| **OpenBB** | $0 | $0 | Open source, free yfinance data |
| **Total** | **$0** | **$33-48** | **R0 – R700/month** |

### 11.2 Hardware Requirements

| Machine | Minimum | Recommended |
|---------|---------|-------------|
| **Mac Mini** | M1, 8GB RAM | M2/M4, 16GB RAM |
| **Windows Desktop** | 8GB RAM, any GPU | 16GB RAM, 2× 8GB NVIDIA |
| **MacBook (monitor)** | Any | 8GB+ RAM |

---

## 12. Project Structure

```
agentic-trader/
├── trading-bot/                      # Python trading engine
│   ├── main.py                       # Entry point & orchestrator
│   ├── requirements.txt              # Python dependencies
│   ├── core/
│   │   ├── engine.py                 # Trading engine (async signals)
│   │   ├── models.py                 # Data models
│   │   ├── risk_manager.py           # Risk management
│   │   ├── position_manager.py       # Position tracking
│   │   └── ai_providers.py           # Universal AI provider layer
│   ├── connectors/
│   │   ├── base.py                   # Abstract connector interface
│   │   ├── crypto_connector.py       # LUNO + Binance (CCXT)
│   │   ├── jse_connector.py          # JSE / EasyEquities
│   │   └── tradingview_webhook.py    # TradingView alerts
│   ├── strategies/
│   │   ├── base_strategy.py          # Base with indicator calc
│   │   ├── crypto_momentum.py        # Multi-TF crypto momentum
│   │   ├── jse_value_momentum.py     # JSE value + VCP
│   │   └── pair_trading.py           # Statistical arbitrage
│   ├── sentiment/
│   │   ├── swarm_engine.py           # MiroFish 50-agent swarm
│   │   └── llm_analyst.py            # Ollama LLM analyst
│   ├── agents/
│   │   ├── cloddsbot_agent.py        # CloddsBot API client
│   │   └── orchestrator.py           # Data flow coordinator
│   ├── ralf/
│   │   ├── ralf_engine.py            # RALF feedback loop
│   │   ├── ralf_runner.py            # Scheduled RALF execution
│   │   └── skill_evolution.py        # Self-evolving skills
│   ├── rag/
│   │   └── rag_engine.py             # RAG vector store
│   ├── vercel/
│   │   └── vercel_integration.py     # Vercel API client
│   ├── api/
│   │   └── server.py                 # FastAPI local server
│   ├── knowledge_base/
│   │   ├── market_regimes.md         # Regime framework
│   │   ├── crypto_momentum_rules.md  # Crypto strategy rules
│   │   ├── jse_trading_guide.md      # JSE trading guide
│   │   ├── SKILLS.md                 # Master skills registry
│   │   └── MEMORY.md                 # Memory architecture
│   ├── config/
│   │   ├── settings.yaml             # Main configuration
│   │   └── .env.example              # API keys template
│   ├── scripts/                      # Windows batch scripts
│   └── data/                         # Runtime data (gitignored)
│
├── studex-frontend/                  # Next.js dashboard (Vercel)
│   ├── app/
│   │   ├── trading/                  # 9 dashboard pages
│   │   └── api/trading/              # 9 API routes
│   ├── lib/
│   │   └── trading-db.ts             # Trading data store
│   ├── components/                   # UI components
│   └── vercel.json                   # Vercel config + cron
│
├── DEPLOY_MEGA_PROMPT.md             # Full deployment guide
└── PRD-AGENTIC-TRADER.md            # This document
```

---

## 13. Appendix

### A. Source Technologies

| Technology | Repository | What We Use |
|-----------|-----------|-------------|
| Claude Trading Skills | `tradermonty/claude-trading-skills` | Trading methodology: regime detection, VCP, CANSLIM, exposure coaching, breadth analysis |
| MiroFish | `666ghj/MiroFish` | Swarm intelligence: multi-agent sentiment simulation with diverse personality archetypes |
| CloddsBot | `alsk1992/CloddsBot` | AI agent: 119 skills, 10 prediction markets, 7 futures exchanges, Solana/EVM DeFi, arbitrage |
| OpenBB | `OpenBB-finance/OpenBB` | Data layer: 33 providers, unified API, technical analysis, JSE/crypto/macro data (Phase 5) |
| JiuwenClaw | `openJiuwen-ai/jiuwenclaw` | Concept only: self-evolving skill pattern (SignalDetector + SkillOptimizer) adapted for trading |

### B. Exchange API References

| Exchange | API Documentation | Key Required |
|----------|------------------|-------------|
| LUNO | https://www.luno.com/en/developers/api | Yes (free) |
| Binance | https://binance-docs.github.io/apidocs/ | Yes (free) |
| EasyEquities | No official API | Username/password |
| TradingView | Webhook-based (no API) | Webhook secret |

### C. Recommended Ollama Models

| Model | Size | Use Case | Command |
|-------|------|----------|---------|
| mistral:7b-instruct-v0.3-q5_K_M | ~5GB | Strategy analysis, trade validation | `ollama pull mistral:7b` |
| llama3.1:8b-instruct-q4_K_M | ~4.5GB | Fast screening, sentiment | `ollama pull llama3.1:8b` |
| nomic-embed-text | ~275MB | RAG embeddings | `ollama pull nomic-embed-text` |
| gemma2:9b | ~5.5GB | Alternative general model | `ollama pull gemma2:9b` |

### D. Configuration Quick Reference

```yaml
# Minimum viable config (paper trading, Ollama only):
app:
  environment: "paper"
ai:
  primary: "ollama"
  fallback: "groq"       # Free cloud fallback
exchanges:
  luno:
    enabled: true
    sandbox: true
  binance:
    enabled: true
    sandbox: true
strategies:
  crypto_momentum:
    enabled: true
risk:
  max_daily_loss_pct: 5.0
  max_drawdown_pct: 15.0
```

---

*Last updated: 2026-10-26*
*Total codebase: ~11,000 lines across 50+ files*
*Status: Phase 1-4 complete. Phase 5 (OpenBB, live JSE, notifications) planned.*
