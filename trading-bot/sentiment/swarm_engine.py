"""
MiroFish-Inspired Swarm Sentiment Engine

Creates a population of simulated trading agents, each with distinct
personality profiles (bull/bear bias, risk tolerance, timeframe preference).
Feeds them market data and news, then aggregates their "decisions" to detect
consensus sentiment — similar to MiroFish's multi-agent social simulation
but focused specifically on trading decisions.

Uses Ollama (local LLM) for agent inference to run on the desktop GPU.
"""

import asyncio
import json
import random
from datetime import datetime
from typing import Optional

import httpx
from loguru import logger

from core.models import SentimentResult


# Agent personality archetypes for diverse opinions
AGENT_ARCHETYPES = [
    {
        "name": "Momentum Trader",
        "bias": "trend_follower",
        "description": "Follows price momentum and trend. Bullish when price is rising with volume.",
        "risk_tolerance": "high",
        "timeframe": "short",
    },
    {
        "name": "Value Investor",
        "bias": "contrarian",
        "description": "Looks for undervalued assets. Bullish when prices drop to fair value.",
        "risk_tolerance": "low",
        "timeframe": "long",
    },
    {
        "name": "Technical Analyst",
        "bias": "neutral",
        "description": "Trades chart patterns and indicators. Follows RSI, MACD, and support/resistance.",
        "risk_tolerance": "medium",
        "timeframe": "medium",
    },
    {
        "name": "Macro Strategist",
        "bias": "macro_driven",
        "description": "Focuses on interest rates, inflation, and global economic cycles.",
        "risk_tolerance": "medium",
        "timeframe": "long",
    },
    {
        "name": "Sentiment Trader",
        "bias": "sentiment_driven",
        "description": "Trades based on crowd sentiment, fear/greed, and social media buzz.",
        "risk_tolerance": "high",
        "timeframe": "short",
    },
    {
        "name": "Risk Manager",
        "bias": "defensive",
        "description": "Conservative approach. Focuses on capital preservation and downside protection.",
        "risk_tolerance": "very_low",
        "timeframe": "medium",
    },
    {
        "name": "Crypto Native",
        "bias": "crypto_bull",
        "description": "Long-term crypto believer. Bullish on adoption narrative. Buys dips aggressively.",
        "risk_tolerance": "very_high",
        "timeframe": "long",
    },
    {
        "name": "Quant Trader",
        "bias": "data_driven",
        "description": "Only trades with statistical edge. Requires backtested evidence before acting.",
        "risk_tolerance": "medium",
        "timeframe": "medium",
    },
    {
        "name": "SA Economist",
        "bias": "emerging_market",
        "description": "Specializes in South African markets, SARB policy, ZAR dynamics, and JSE cycles.",
        "risk_tolerance": "medium",
        "timeframe": "long",
    },
    {
        "name": "Day Trader",
        "bias": "scalper",
        "description": "Focuses on intraday price action. Quick in, quick out. Trades volatility.",
        "risk_tolerance": "high",
        "timeframe": "very_short",
    },
]


class SwarmSentimentEngine:
    """
    Multi-agent sentiment analysis engine.

    Creates N simulated trading agents with diverse personalities,
    feeds them market context, and aggregates their bullish/bearish
    voting to produce a consensus sentiment signal.

    Runs on Ollama (local GPU) for fast, free inference.
    """

    def __init__(self, config: dict):
        self.ollama_url = config.get("ollama", {}).get("base_url", "http://localhost:11434")
        self.model = config.get("ollama", {}).get("models", {}).get("sentiment", "mistral:7b-instruct-v0.3-q5_K_M")
        self.agent_count = config.get("strategies", {}).get("sentiment_swarm", {}).get("agent_count", 50)
        self.consensus_threshold = config.get("strategies", {}).get("sentiment_swarm", {}).get("consensus_threshold", 0.7)
        self.max_concurrent = config.get("ollama", {}).get("max_concurrent", 2)
        self._semaphore = asyncio.Semaphore(self.max_concurrent)

    async def analyze_sentiment(
        self,
        symbol: str,
        market_context: dict,
        news_headlines: list[str] = None,
    ) -> SentimentResult:
        """
        Run swarm sentiment analysis on a symbol.

        Args:
            symbol: Trading symbol (e.g., "BTC/USDT", "NPN")
            market_context: Dict with price, indicators, recent performance
            news_headlines: List of recent news headlines
        """
        logger.info(f"[Swarm] Analyzing sentiment for {symbol} with {self.agent_count} agents")

        # Create agent population with diverse archetypes
        agents = self._create_agent_population(self.agent_count)

        # Run all agents concurrently (throttled by semaphore)
        tasks = [
            self._run_agent(agent, symbol, market_context, news_headlines or [])
            for agent in agents
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Aggregate votes
        bullish = 0
        bearish = 0
        neutral = 0
        themes = []

        for result in results:
            if isinstance(result, Exception):
                neutral += 1
                continue
            if result is None:
                neutral += 1
                continue

            vote = result.get("vote", "neutral").lower()
            if vote in ("bullish", "buy", "long"):
                bullish += 1
            elif vote in ("bearish", "sell", "short"):
                bearish += 1
            else:
                neutral += 1

            if result.get("reasoning"):
                themes.append(result["reasoning"][:100])

        total = bullish + bearish + neutral
        if total == 0:
            total = 1

        bullish_pct = (bullish / total) * 100
        bearish_pct = (bearish / total) * 100
        neutral_pct = (neutral / total) * 100

        # Calculate consensus strength
        max_pct = max(bullish_pct, bearish_pct, neutral_pct) / 100
        consensus_strength = max_pct

        # Detect contrarian signal (overwhelming consensus often marks turning points)
        contrarian = max_pct > 0.85

        # Extract key themes (most common reasoning patterns)
        key_themes = self._extract_themes(themes)

        result = SentimentResult(
            symbol=symbol,
            bullish_pct=bullish_pct,
            bearish_pct=bearish_pct,
            neutral_pct=neutral_pct,
            consensus_strength=consensus_strength,
            agent_count=total,
            key_themes=key_themes[:5],
            contrarian_signal=contrarian,
            timestamp=datetime.now(),
        )

        logger.info(
            f"[Swarm] {symbol}: Bullish {bullish_pct:.0f}% | Bearish {bearish_pct:.0f}% | "
            f"Neutral {neutral_pct:.0f}% | Consensus: {consensus_strength:.2f}"
        )

        return result

    def _create_agent_population(self, count: int) -> list[dict]:
        """Create a diverse population of trading agents."""
        agents = []
        for i in range(count):
            archetype = AGENT_ARCHETYPES[i % len(AGENT_ARCHETYPES)]
            # Add some randomness to each agent
            agent = {
                "id": i,
                "archetype": archetype["name"],
                "bias": archetype["bias"],
                "description": archetype["description"],
                "risk_tolerance": archetype["risk_tolerance"],
                "timeframe": archetype["timeframe"],
                # Random personality variations
                "confidence_modifier": random.uniform(0.7, 1.3),
                "contrarian_tendency": random.random() < 0.15,  # 15% chance of going against type
            }
            agents.append(agent)
        return agents

    async def _run_agent(
        self,
        agent: dict,
        symbol: str,
        context: dict,
        headlines: list[str],
    ) -> Optional[dict]:
        """Run a single agent's analysis via Ollama."""
        async with self._semaphore:
            prompt = self._build_agent_prompt(agent, symbol, context, headlines)

            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.post(
                        f"{self.ollama_url}/api/generate",
                        json={
                            "model": self.model,
                            "prompt": prompt,
                            "stream": False,
                            "options": {
                                "temperature": 0.7 + random.uniform(-0.2, 0.2),
                                "num_predict": 150,
                            },
                        },
                    )

                    if response.status_code != 200:
                        return None

                    result = response.json()
                    text = result.get("response", "")
                    return self._parse_agent_response(text)

            except Exception as e:
                logger.debug(f"[Swarm] Agent {agent['id']} failed: {e}")
                return None

    def _build_agent_prompt(
        self,
        agent: dict,
        symbol: str,
        context: dict,
        headlines: list[str],
    ) -> str:
        """Build the prompt for an individual agent."""
        headlines_text = "\n".join(f"- {h}" for h in headlines[:5]) if headlines else "No recent news."

        return f"""You are a {agent['archetype']} analyzing {symbol}.
Your trading style: {agent['description']}
Risk tolerance: {agent['risk_tolerance']} | Timeframe: {agent['timeframe']}

MARKET DATA:
- Current Price: {context.get('price', 'N/A')}
- 24h Change: {context.get('change_24h', 'N/A')}%
- RSI(14): {context.get('rsi', 'N/A')}
- Volume vs Average: {context.get('volume_ratio', 'N/A')}x
- Trend: {context.get('trend', 'N/A')}
- Support: {context.get('support', 'N/A')}
- Resistance: {context.get('resistance', 'N/A')}

RECENT NEWS:
{headlines_text}

Based on your trading personality and this data, what is your verdict?
Reply with EXACTLY this format:
VOTE: [BULLISH/BEARISH/NEUTRAL]
REASONING: [One sentence explaining why]
CONFIDENCE: [LOW/MEDIUM/HIGH]"""

    def _parse_agent_response(self, text: str) -> Optional[dict]:
        """Parse the agent's response into a structured vote."""
        text_upper = text.upper()

        vote = "neutral"
        if "VOTE: BULLISH" in text_upper or "VOTE:BULLISH" in text_upper:
            vote = "bullish"
        elif "VOTE: BEARISH" in text_upper or "VOTE:BEARISH" in text_upper:
            vote = "bearish"

        # Extract reasoning
        reasoning = ""
        for line in text.split("\n"):
            if line.upper().startswith("REASONING:"):
                reasoning = line.split(":", 1)[1].strip()
                break

        return {"vote": vote, "reasoning": reasoning}

    def _extract_themes(self, reasoning_list: list[str]) -> list[str]:
        """Extract common themes from agent reasoning."""
        if not reasoning_list:
            return []

        # Simple keyword frequency analysis
        keyword_count: dict[str, int] = {}
        keywords_of_interest = [
            "momentum", "oversold", "overbought", "trend", "breakout",
            "support", "resistance", "volume", "bearish", "bullish",
            "macro", "inflation", "rates", "risk", "value", "growth",
            "reversal", "continuation", "divergence", "accumulation",
        ]

        for reasoning in reasoning_list:
            words = reasoning.lower().split()
            for kw in keywords_of_interest:
                if kw in words:
                    keyword_count[kw] = keyword_count.get(kw, 0) + 1

        # Sort by frequency and return top themes
        sorted_themes = sorted(keyword_count.items(), key=lambda x: x[1], reverse=True)
        return [theme for theme, count in sorted_themes[:5]]
