"""
RALF Loop Runner — Scheduled feedback loop execution.
Runs the Learn → Feedback cycle on a schedule (daily/weekly).
"""

import asyncio
from datetime import datetime
from loguru import logger

from ralf.ralf_engine import RALFEngine


class RALFRunner:
    """
    Runs the RALF feedback loop on a schedule.

    Daily: Generate feedback for each active strategy
    Weekly: Extract learnings, recalibrate confidence weights
    Monthly: Full strategy health review, recommend pivots
    """

    def __init__(self, ralf_engine: RALFEngine, llm_analyst=None):
        self.ralf = ralf_engine
        self.analyst = llm_analyst  # OllamaAnalyst for LLM-powered postmortems
        self.strategies: list[str] = []

    def register_strategy(self, name: str):
        self.strategies.append(name)

    async def run_daily_feedback(self):
        """Run daily feedback cycle for all strategies."""
        logger.info("[RALF Runner] Starting daily feedback cycle")

        for strategy in self.strategies:
            feedback = self.ralf.generate_feedback(strategy, lookback_days=7)

            if feedback["status"] == "insufficient_data":
                logger.info(f"[RALF] {strategy}: Not enough trades yet ({feedback['trade_count']})")
                continue

            health = feedback.get("health", "UNKNOWN")
            adjustments = feedback.get("adjustments", [])

            logger.info(
                f"[RALF] {strategy}: Health={health} | "
                f"WR={feedback['win_rate']:.0%} | PF={feedback['profit_factor']:.2f} | "
                f"{len(adjustments)} adjustments"
            )

            # If LLM analyst available, generate deeper postmortem
            if self.analyst and health in ("WARNING", "CRITICAL"):
                postmortem = await self._generate_llm_postmortem(strategy, feedback)
                if postmortem:
                    logger.info(f"[RALF] LLM Postmortem for {strategy}:\n{postmortem}")

            # Log adjustment recommendations
            for adj in adjustments:
                logger.warning(
                    f"[RALF:ADJUST] {strategy} → {adj['type']}: {adj['suggestion']} "
                    f"(reason: {adj['reason']})"
                )

    async def run_weekly_learning(self):
        """Run weekly learning extraction."""
        logger.info("[RALF Runner] Starting weekly learning extraction")

        learnings = self.ralf.extract_learnings(min_trades=10)

        for learning in learnings:
            logger.info(
                f"[RALF:LEARNING] [{learning['category']}] {learning['insight']} "
                f"(confidence: {learning['confidence']:.0%})"
            )

        return learnings

    async def _generate_llm_postmortem(self, strategy: str, feedback: dict) -> str:
        """Use Ollama to generate a detailed strategy postmortem."""
        if not self.analyst:
            return ""

        prompt_data = {
            "strategy": strategy,
            "health": feedback["health"],
            "win_rate": f"{feedback['win_rate']:.0%}",
            "profit_factor": f"{feedback['profit_factor']:.2f}",
            "trade_count": feedback["trade_count"],
            "adjustments": [a["suggestion"] for a in feedback.get("adjustments", [])],
            "regime_performance": feedback.get("regime_performance", {}),
        }

        try:
            import json
            result = await self.analyst._query(
                f"""You are a trading strategy reviewer. Analyze this strategy's recent performance
and provide a concise postmortem with actionable recommendations.

STRATEGY PERFORMANCE:
{json.dumps(prompt_data, indent=2)}

Provide:
1. ROOT CAUSE: Why is this strategy underperforming?
2. MARKET FIT: Is the current market regime suitable?
3. TOP 3 FIXES: Specific parameter changes to implement
4. PIVOT RECOMMENDATION: Should we pivot the strategy approach?

Keep it under 200 words. Be direct.""",
                model=self.analyst.strategy_model,
            )
            return result
        except Exception as e:
            logger.error(f"[RALF] LLM postmortem failed: {e}")
            return ""

    async def run_loop(self, daily_hour: int = 17, weekly_day: int = 5):
        """
        Main RALF loop that runs continuously.
        Daily feedback at specified hour, weekly learning on specified day.
        """
        logger.info(f"[RALF Runner] Loop started. Daily at {daily_hour}:00, Weekly on day {weekly_day}")
        last_daily = None
        last_weekly = None

        while True:
            now = datetime.now()

            # Daily feedback
            if now.hour == daily_hour and (last_daily is None or last_daily.date() != now.date()):
                await self.run_daily_feedback()
                last_daily = now

            # Weekly learning (day 5 = Saturday)
            if now.weekday() == weekly_day and (last_weekly is None or (now - last_weekly).days >= 6):
                await self.run_weekly_learning()
                last_weekly = now

            await asyncio.sleep(300)  # Check every 5 minutes
