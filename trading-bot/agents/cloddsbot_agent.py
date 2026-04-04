"""
CloddsBot Agent Integration

CloddsBot (https://github.com/alsk1992/CloddsBot) is a full AI trading
terminal with 119 skills, 10 prediction markets, 7 futures exchanges,
and Solana/EVM DeFi support. It becomes the CENTRAL BRAIN of the system.

Architecture — CloddsBot as the core agent:

┌──────────────────────────────────────────────────────────┐
│                    CloddsBot Agent                        │
│              (TypeScript/Node.js process)                 │
│                                                          │
│  119 Skills: momentum, mean reversion, arbitrage,        │
│  DCA bots, whale tracking, copy trading, penny clipper   │
│                                                          │
│  10 Prediction Markets: Polymarket, Kalshi, Betfair...   │
│  7 Futures Exchanges: Binance 125x, Bybit, Hyperliquid  │
│  9 Solana DeFi: Jupiter, Raydium, Orca, Pump.fun...     │
│  5 EVM Chains: Uniswap, 1inch, PancakeSwap...           │
│                                                          │
│  Built-in: Risk engine, VaR/CVaR, circuit breaker,       │
│  Kelly sizing, kill switch, arbitrage detection           │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP API / MCP
┌────────────────────────┼─────────────────────────────────┐
│  Studex Data Pipeline  │  (our Python system)            │
│                        │                                  │
│  FEEDS CloddsBot:      │  RECEIVES from CloddsBot:        │
│  ├── JSE market data   │  ├── Trade signals               │
│  ├── LUNO ZAR prices   │  ├── Strategy selections         │
│  ├── Sentiment scores  │  ├── Risk assessments            │
│  ├── RALF learnings    │  ├── Arbitrage opportunities     │
│  ├── RAG context       │  └── Portfolio recommendations   │
│  └── Regime detection  │                                  │
└──────────────────────────────────────────────────────────┘

How they work together:
1. Our Python bot collects SA-specific data (JSE, LUNO ZAR, SARB news)
2. RAG retrieves relevant historical context
3. RALF provides strategy performance stats
4. All this is fed to CloddsBot as context
5. CloddsBot (with Claude + 119 skills) makes the final trading decision
6. Our Python bot executes on SA exchanges (LUNO, EasyEquities)
7. CloddsBot handles global crypto directly (Binance, Solana DeFi)
8. Results feed back into RALF for learning

This is NOT a dependency — if CloddsBot is down, the Python strategies
still run independently. CloddsBot is an intelligence amplifier.
"""

import asyncio
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

import httpx
from loguru import logger


class CloddsBotAgent:
    """
    Interface to CloddsBot running as a separate Node.js process.

    CloddsBot can run in two modes:
    1. LOCAL: npm process on the same machine (desktop with GPUs)
    2. REMOTE: CloddsBot running elsewhere, accessed via HTTP API

    Communication is via CloddsBot's HTTP API / MCP server.
    """

    def __init__(self, config: dict):
        clodds_config = config.get("cloddsbot", {})
        self.enabled = clodds_config.get("enabled", False)
        self.mode = clodds_config.get("mode", "local")  # local | remote
        self.api_url = clodds_config.get("api_url", "http://localhost:3117")
        self.install_path = clodds_config.get("install_path", "")
        self.api_key = clodds_config.get("api_key", "")
        self.timeout = clodds_config.get("timeout", 60)

        # CloddsBot process handle (for local mode)
        self._process: Optional[subprocess.Popen] = None
        self._healthy = False

    # ================================================================
    # LIFECYCLE
    # ================================================================

    async def start(self) -> bool:
        """Start CloddsBot agent."""
        if not self.enabled:
            logger.info("[CloddsBot] Disabled in config")
            return False

        if self.mode == "local":
            return await self._start_local()
        else:
            return await self._check_remote()

    async def _start_local(self) -> bool:
        """Start CloddsBot as a local Node.js process."""
        # Check if CloddsBot is installed
        try:
            result = subprocess.run(
                ["npx", "clodds", "--version"],
                capture_output=True, text=True, timeout=15,
            )
            if result.returncode == 0:
                logger.info(f"[CloddsBot] Found: {result.stdout.strip()}")
            else:
                logger.warning(
                    "[CloddsBot] Not installed. Install with: npm install -g clodds"
                )
                return False
        except FileNotFoundError:
            logger.warning("[CloddsBot] Node.js/npm not found. Install Node.js 22+")
            return False
        except subprocess.TimeoutExpired:
            logger.warning("[CloddsBot] Version check timed out")
            return False

        # Start CloddsBot in API mode
        try:
            self._process = subprocess.Popen(
                ["npx", "clodds", "--api", "--port", "3117"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            # Wait for it to be ready
            for _ in range(30):
                await asyncio.sleep(1)
                if await self._check_remote():
                    logger.info("[CloddsBot] Local agent started on port 3117")
                    return True

            logger.error("[CloddsBot] Failed to start within 30 seconds")
            return False

        except Exception as e:
            logger.error(f"[CloddsBot] Start failed: {e}")
            return False

    async def _check_remote(self) -> bool:
        """Check if CloddsBot API is reachable."""
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(f"{self.api_url}/health")
                if response.status_code == 200:
                    self._healthy = True
                    logger.info(f"[CloddsBot] Connected at {self.api_url}")
                    return True
        except Exception:
            pass
        self._healthy = False
        return False

    async def stop(self):
        """Stop CloddsBot local process."""
        if self._process:
            self._process.terminate()
            self._process.wait(timeout=10)
            logger.info("[CloddsBot] Stopped")

    # ================================================================
    # CORE: Feed data → Get trading decisions
    # ================================================================

    async def analyze_and_decide(
        self,
        symbol: str,
        market_data: dict,
        indicators: dict,
        regime: str,
        ralf_stats: dict,
        rag_context: str,
        sentiment: dict = None,
    ) -> Optional[dict]:
        """
        Feed all our data to CloddsBot and get a trading decision.

        This is the key integration point. We give CloddsBot:
        - Raw market data (OHLCV, volume)
        - Our calculated indicators (RSI, MACD, etc.)
        - Market regime (broadening, contraction, etc.)
        - RALF learning stats (win rate, best conditions, etc.)
        - RAG context (similar past trades, strategy docs)
        - Sentiment swarm results

        CloddsBot returns:
        - Action: buy/sell/hold/close
        - Confidence: 0-1
        - Strategy used (from its 119 skills)
        - Position sizing recommendation
        - Stop loss / take profit levels
        - Reasoning
        """
        if not self._healthy:
            return None

        payload = {
            "task": "analyze_trade_setup",
            "symbol": symbol,
            "data": {
                "market": market_data,
                "indicators": indicators,
                "regime": regime,
                "ralf_performance": ralf_stats,
                "historical_context": rag_context,
                "sentiment": sentiment or {},
            },
            "instructions": f"""Analyze {symbol} and make a trading decision.

MARKET REGIME: {regime}
This is a South African trader using LUNO (ZAR crypto) and JSE equities.

RALF LEARNING STATS (from our self-improving feedback loop):
{json.dumps(ralf_stats, indent=2)}

HISTORICAL CONTEXT (from RAG — similar past trades):
{rag_context[:2000]}

SENTIMENT (from 50-agent swarm analysis):
{json.dumps(sentiment or {}, indent=2)}

Based on ALL this data, provide your trading decision as JSON:
{{
  "action": "buy|sell|hold|close",
  "confidence": 0.0-1.0,
  "strategy_used": "name of your chosen strategy",
  "entry_price": number or null,
  "stop_loss": number or null,
  "take_profit": number or null,
  "position_size_pct": 1-10,
  "reasoning": "brief explanation",
  "risk_level": "low|medium|high",
  "timeframe": "scalp|intraday|swing|position"
}}""",
        }

        return await self._call_api("/api/chat", payload)

    async def scan_arbitrage(self, symbols: list[str]) -> list[dict]:
        """
        Use CloddsBot's arbitrage detection (arXiv:2508.03474) to find
        cross-platform opportunities between our connected exchanges.
        """
        if not self._healthy:
            return []

        result = await self._call_api("/api/skill", {
            "skill": "arbitrage_scan",
            "params": {
                "symbols": symbols,
                "platforms": ["binance", "luno", "polymarket"],
                "min_spread_pct": 0.5,
            },
        })

        return result.get("opportunities", []) if result else []

    async def get_strategy_recommendation(
        self, portfolio: dict, regime: str, ralf_feedback: dict
    ) -> Optional[dict]:
        """
        Ask CloddsBot which of its 119 strategies to activate
        given current market conditions and our RALF performance data.
        """
        if not self._healthy:
            return None

        return await self._call_api("/api/chat", {
            "task": "strategy_recommendation",
            "instructions": f"""Given this portfolio state and market regime, recommend
which trading strategies to activate/deactivate.

PORTFOLIO: {json.dumps(portfolio, indent=2)}
REGIME: {regime}
RALF FEEDBACK: {json.dumps(ralf_feedback, indent=2)}

Recommend the top 3 strategies from your 119 available skills
that best fit these conditions. Return as JSON:
{{
  "recommended_strategies": [
    {{"name": "...", "reason": "...", "allocation_pct": 10-40}},
  ],
  "strategies_to_pause": ["...", "..."],
  "overall_exposure_recommendation": 0-100,
  "regime_analysis": "brief assessment"
}}""",
        })

    async def execute_prediction_market_trade(
        self, market: str, question: str, position: str, amount: float
    ) -> Optional[dict]:
        """
        Use CloddsBot to trade on prediction markets.
        Opens up a whole new asset class beyond crypto and equities.
        """
        if not self._healthy:
            return None

        return await self._call_api("/api/skill", {
            "skill": "prediction_trade",
            "params": {
                "platform": market,  # polymarket, kalshi, etc.
                "question": question,
                "position": position,  # yes/no
                "amount": amount,
            },
        })

    async def run_skill(self, skill_name: str, params: dict = None) -> Optional[dict]:
        """Run any of CloddsBot's 119 skills directly."""
        if not self._healthy:
            return None

        return await self._call_api("/api/skill", {
            "skill": skill_name,
            "params": params or {},
        })

    # ================================================================
    # API Communication
    # ================================================================

    async def _call_api(self, endpoint: str, payload: dict) -> Optional[dict]:
        """Call CloddsBot's API."""
        try:
            headers = {"Content-Type": "application/json"}
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.api_url}{endpoint}",
                    json=payload,
                    headers=headers,
                )

                if response.status_code == 200:
                    return response.json()
                else:
                    logger.warning(
                        f"[CloddsBot] {endpoint} returned {response.status_code}: "
                        f"{response.text[:200]}"
                    )
                    return None

        except httpx.ConnectError:
            logger.debug(f"[CloddsBot] Cannot connect to {self.api_url}")
            self._healthy = False
            return None
        except Exception as e:
            logger.error(f"[CloddsBot] API call failed: {e}")
            return None

    @property
    def is_available(self) -> bool:
        return self._healthy
