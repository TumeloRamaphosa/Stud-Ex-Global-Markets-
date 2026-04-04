"""
Orchestration Layer — Connects CloddsBot Agent with our data pipeline.

This is the glue between:
- Our data collection (JSE, LUNO, sentiment, RAG, RALF)
- CloddsBot's 119 skills and trading intelligence
- Our execution layer (exchange connectors)

The workflow WITHOUT any LLM/AI dependency:

  Market Data → Indicators (math) → Strategy Rules → Signal → Risk Check → Execute
       │                                                            │
       └──── RALF records outcome ← trade closes ←─────────────────┘

The workflow WITH CloddsBot as the brain:

  Market Data ──┐
  Indicators ───┤
  Regime ───────┤
  RALF Stats ───┼──→ CloddsBot Agent ──→ Enhanced Signal ──→ Risk Check ──→ Execute
  RAG Context ──┤         │                                        │
  Sentiment ────┘         │                                        │
                          ├── Arbitrage scan                       │
                          ├── Prediction markets                   │
                          └── Strategy selection                   │
                                                                   │
       RALF records outcome ← trade closes ←───────────────────────┘

Key principle: CloddsBot is an AMPLIFIER, not a dependency.
If CloddsBot is unavailable, the Python strategies run independently.
"""

import asyncio
from datetime import datetime
from typing import Optional

from loguru import logger

from agents.cloddsbot_agent import CloddsBotAgent
from core.models import (
    AssetClass,
    Signal,
    SignalType,
    TimeFrame,
)
from rag.rag_engine import TradingRAG
from ralf.ralf_engine import RALFEngine
from sentiment.swarm_engine import SwarmSentimentEngine


class AgentOrchestrator:
    """
    Coordinates data flow between our pipeline and CloddsBot.

    Runs on a schedule alongside the regular strategy loop:
    - Every 5 min: Feed CloddsBot latest data, get trade decisions
    - Every 30 min: Ask CloddsBot for strategy recommendations
    - Every 1 hour: Run arbitrage scan
    - Every 4 hours: Run prediction market analysis
    """

    def __init__(
        self,
        config: dict,
        cloddsbot: CloddsBotAgent,
        rag: TradingRAG,
        ralf: RALFEngine,
        swarm: SwarmSentimentEngine,
    ):
        self.config = config
        self.agent = cloddsbot
        self.rag = rag
        self.ralf = ralf
        self.swarm = swarm
        self.is_running = False

    async def run_analysis_cycle(
        self,
        symbol: str,
        market_data: dict,
        indicators: dict,
        regime: str,
    ) -> Optional[Signal]:
        """
        Run a full analysis cycle for a symbol through CloddsBot.

        1. Get RALF stats for this symbol's strategies
        2. Retrieve RAG context (similar past trades)
        3. Get sentiment if available
        4. Feed everything to CloddsBot
        5. Convert response to a Signal
        """
        if not self.agent.is_available:
            return None

        # 1. RALF stats
        ralf_stats = self.ralf.get_strategy_stats("cloddsbot")

        # 2. RAG context
        rag_context = await self.rag.retrieve_for_trade(
            symbol=symbol,
            strategy="cloddsbot",
            regime=regime,
        )

        # 3. Feed to CloddsBot
        decision = await self.agent.analyze_and_decide(
            symbol=symbol,
            market_data=market_data,
            indicators=indicators,
            regime=regime,
            ralf_stats=ralf_stats,
            rag_context=rag_context,
        )

        if not decision:
            return None

        # 4. Convert to Signal
        action = decision.get("action", "hold")
        if action == "hold":
            return None

        signal_type_map = {
            "buy": SignalType.BUY,
            "sell": SignalType.SELL,
            "close": SignalType.CLOSE,
        }

        signal_type = signal_type_map.get(action)
        if not signal_type:
            return None

        asset_class = AssetClass.CRYPTO if "/" in symbol else AssetClass.JSE_EQUITY

        return Signal(
            strategy_name=f"cloddsbot:{decision.get('strategy_used', 'auto')}",
            symbol=symbol,
            signal_type=signal_type,
            confidence=decision.get("confidence", 0.5),
            timestamp=datetime.now(),
            timeframe=TimeFrame.H1,
            asset_class=asset_class,
            entry_price=decision.get("entry_price"),
            stop_loss=decision.get("stop_loss"),
            take_profit=decision.get("take_profit"),
            metadata={
                "source": "cloddsbot",
                "strategy_used": decision.get("strategy_used"),
                "reasoning": decision.get("reasoning", ""),
                "risk_level": decision.get("risk_level", "medium"),
                "max_position_pct": decision.get("position_size_pct", 5),
            },
        )

    async def run_arbitrage_scan(self, symbols: list[str]) -> list[dict]:
        """Run CloddsBot's cross-platform arbitrage detection."""
        if not self.agent.is_available:
            return []

        opportunities = await self.agent.scan_arbitrage(symbols)
        if opportunities:
            logger.info(
                f"[Orchestrator] Found {len(opportunities)} arbitrage opportunities"
            )
        return opportunities

    async def get_strategy_allocation(
        self, portfolio: dict, regime: str, ralf_feedback: dict
    ) -> Optional[dict]:
        """Ask CloddsBot which strategies to run given current conditions."""
        return await self.agent.get_strategy_recommendation(
            portfolio=portfolio,
            regime=regime,
            ralf_feedback=ralf_feedback,
        )
