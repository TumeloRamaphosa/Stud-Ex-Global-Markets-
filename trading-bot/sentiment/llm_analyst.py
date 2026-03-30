"""
Ollama LLM Strategy Analyst

Uses local Ollama models (running on desktop GPUs) to perform
Claude Trading Skills-style analysis:
- Market regime detection
- Breadth analysis interpretation
- Trade setup validation
- Risk assessment

This replaces the need for expensive cloud API calls for routine analysis.
Claude API is reserved for complex edge cases only.
"""

import json
from datetime import datetime
from typing import Optional

import httpx
from loguru import logger

from core.models import BreadthData, MarketRegime


class OllamaAnalyst:
    """
    Local LLM analyst using Ollama for trading analysis.

    Recommended models for 2x 8GB GPUs:
    - mistral:7b-instruct-v0.3-q5_K_M (best quality/speed balance)
    - llama3.1:8b-instruct-q4_K_M (faster, good for screening)
    - deepseek-coder-v2:16b-lite-instruct-q4_K_M (for backtesting code)

    With 2 GPUs, you can run 2 models concurrently:
    - GPU 0: Strategy analysis model
    - GPU 1: Screening/sentiment model
    """

    def __init__(self, config: dict):
        ollama_config = config.get("ollama", {})
        self.base_url = ollama_config.get("base_url", "http://localhost:11434")
        self.strategy_model = ollama_config.get("models", {}).get("strategy", "mistral:7b-instruct-v0.3-q5_K_M")
        self.screening_model = ollama_config.get("models", {}).get("screening", "llama3.1:8b-instruct-q4_K_M")
        self.timeout = ollama_config.get("timeout", 120)

    async def detect_market_regime(self, market_data: dict) -> MarketRegime:
        """
        Detect current market regime using Claude Trading Skills methodology.
        Analyzes: breadth, yield curve, credit spreads, sector rotation, VIX.
        """
        prompt = f"""You are a market regime analyst using the following framework.
Classify the current market into ONE of these regimes:

1. CONCENTRATION - Few leaders driving market. Breadth narrowing.
2. BROADENING - Wide participation. Healthy breadth. Many sectors rising.
3. CONTRACTION - Declining breadth. Risk-off. Defensive rotation.
4. INFLATIONARY - Rising commodities, falling bonds, sector rotation to energy/materials.
5. TRANSITIONAL - Mixed signals. Regime changing. Unclear direction.

CURRENT MARKET DATA:
{json.dumps(market_data, indent=2)}

Analyze the data and respond with EXACTLY this format:
REGIME: [one of: CONCENTRATION, BROADENING, CONTRACTION, INFLATIONARY, TRANSITIONAL]
CONFIDENCE: [LOW/MEDIUM/HIGH]
REASONING: [2-3 sentences explaining your classification]
EXPOSURE_RECOMMENDATION: [0-100]% equity exposure"""

        response = await self._query(prompt, model=self.strategy_model)
        if not response:
            return MarketRegime.TRANSITIONAL

        text_upper = response.upper()
        for regime in MarketRegime:
            if regime.value.upper() in text_upper:
                return regime

        return MarketRegime.TRANSITIONAL

    async def analyze_trade_setup(self, setup: dict) -> dict:
        """
        Validate a trade setup using multi-factor analysis.
        Returns quality score and recommendation.
        """
        prompt = f"""You are a professional trade analyst. Evaluate this trade setup:

SYMBOL: {setup.get('symbol')}
DIRECTION: {setup.get('direction', 'LONG')}
ENTRY PRICE: {setup.get('entry_price')}
STOP LOSS: {setup.get('stop_loss')}
TAKE PROFIT: {setup.get('take_profit')}
TIMEFRAME: {setup.get('timeframe')}

TECHNICAL DATA:
- RSI: {setup.get('rsi')}
- MACD Histogram: {setup.get('macd_histogram')}
- ADX: {setup.get('adx')}
- Volume vs Average: {setup.get('volume_ratio')}x
- Above 200 MA: {setup.get('above_200ma')}
- ATR: {setup.get('atr')}

STRATEGY: {setup.get('strategy_name')}
MARKET REGIME: {setup.get('regime')}

Evaluate using these criteria:
1. Edge Plausibility (is there a real edge?)
2. Risk/Reward Ratio (is it favorable?)
3. Regime Alignment (does the regime support this trade?)
4. Technical Confirmation (do indicators align?)
5. Timing Quality (is the entry well-timed?)

Respond with EXACTLY:
SCORE: [1-10]
VERDICT: [TAKE/PASS/REDUCE_SIZE]
RISK_REWARD: [calculated R:R ratio]
KEY_RISK: [main risk to this trade]
RECOMMENDATION: [one sentence actionable advice]"""

        response = await self._query(prompt, model=self.strategy_model)

        result = {
            "score": 5,
            "verdict": "PASS",
            "risk_reward": "unknown",
            "key_risk": "analysis unavailable",
            "recommendation": "review manually",
        }

        if response:
            for line in response.split("\n"):
                line = line.strip()
                if line.startswith("SCORE:"):
                    try:
                        result["score"] = int(line.split(":")[1].strip().split("/")[0].strip())
                    except (ValueError, IndexError):
                        pass
                elif line.startswith("VERDICT:"):
                    result["verdict"] = line.split(":")[1].strip()
                elif line.startswith("RISK_REWARD:"):
                    result["risk_reward"] = line.split(":")[1].strip()
                elif line.startswith("KEY_RISK:"):
                    result["key_risk"] = line.split(":", 1)[1].strip()
                elif line.startswith("RECOMMENDATION:"):
                    result["recommendation"] = line.split(":", 1)[1].strip()

        return result

    async def generate_daily_briefing(self, portfolio: dict, market_data: dict) -> str:
        """Generate a morning briefing report (Claude Trading Skills daily workflow)."""
        prompt = f"""Generate a concise morning trading briefing for a South African trader.

PORTFOLIO:
- Total Equity: R{portfolio.get('total_equity', 0):,.2f}
- Cash: R{portfolio.get('cash', 0):,.2f}
- Open Positions: {portfolio.get('position_count', 0)}
- Daily P&L: R{portfolio.get('daily_pnl', 0):,.2f}
- Unrealized P&L: R{portfolio.get('unrealized_pnl', 0):,.2f}

MARKET OVERVIEW:
{json.dumps(market_data, indent=2)}

Generate a briefing covering:
1. Key overnight developments affecting crypto and JSE
2. Today's watchlist priorities
3. Risk alerts or position management needed
4. Key economic events (SARB, US Fed, etc.)

Keep it under 300 words. Be direct and actionable."""

        return await self._query(prompt, model=self.strategy_model) or "Briefing unavailable."

    async def screen_news_sentiment(self, headlines: list[str], symbol: str) -> dict:
        """Quick news sentiment screening using the faster model."""
        prompt = f"""Analyze these headlines for {symbol} sentiment.

HEADLINES:
{chr(10).join(f'{i+1}. {h}' for i, h in enumerate(headlines[:10]))}

Respond with:
SENTIMENT: [BULLISH/BEARISH/NEUTRAL]
STRENGTH: [1-5]
KEY_FACTOR: [most important headline and why]
TRADE_IMPACT: [NONE/MINOR/SIGNIFICANT/MAJOR]"""

        response = await self._query(prompt, model=self.screening_model)

        result = {"sentiment": "neutral", "strength": 1, "key_factor": "", "trade_impact": "none"}
        if response:
            for line in response.split("\n"):
                line = line.strip()
                if line.startswith("SENTIMENT:"):
                    result["sentiment"] = line.split(":")[1].strip().lower()
                elif line.startswith("STRENGTH:"):
                    try:
                        result["strength"] = int(line.split(":")[1].strip())
                    except ValueError:
                        pass
                elif line.startswith("KEY_FACTOR:"):
                    result["key_factor"] = line.split(":", 1)[1].strip()
                elif line.startswith("TRADE_IMPACT:"):
                    result["trade_impact"] = line.split(":")[1].strip().lower()

        return result

    async def _query(self, prompt: str, model: str = None) -> Optional[str]:
        """Send a query to Ollama and return the response text."""
        model = model or self.strategy_model

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.3,
                            "num_predict": 500,
                        },
                    },
                )

                if response.status_code == 200:
                    return response.json().get("response", "")
                else:
                    logger.error(f"[Ollama] Error {response.status_code}: {response.text[:200]}")
                    return None

        except httpx.ConnectError:
            logger.error(f"[Ollama] Cannot connect to {self.base_url}. Is Ollama running?")
            return None
        except Exception as e:
            logger.error(f"[Ollama] Query failed: {e}")
            return None

    async def check_health(self) -> bool:
        """Check if Ollama is running and models are available."""
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                if response.status_code == 200:
                    models = response.json().get("models", [])
                    model_names = [m["name"] for m in models]
                    logger.info(f"[Ollama] Available models: {model_names}")
                    return True
                return False
        except Exception:
            return False
