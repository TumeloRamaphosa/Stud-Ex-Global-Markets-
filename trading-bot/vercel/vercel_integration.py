"""
Vercel Platform Integration

Replaces Google Vertex AI with Vercel's simpler ecosystem:

1. Vercel AI SDK — Claude/OpenAI for trade analysis + embeddings
2. Vercel Postgres (Neon) — Trade analytics, RALF data, RAG vectors
3. Vercel Cron Jobs — Scheduled RALF feedback, backtesting, reports
4. Vercel KV (Redis) — Real-time caching, rate limiting
5. Vercel Edge Functions — Low-latency webhook processing

Why Vercel over Vertex:
- Zero GCP setup (no service accounts, IAM, billing alerts)
- Already using Next.js — everything stays in one ecosystem
- Generous free tier: 256MB Postgres, 30K KV requests, cron jobs
- One-click deploy from GitHub
- Edge functions = fast webhook processing globally

Cost estimate (Hobby plan = Free, Pro = $20/mo):
┌──────────────────┬────────┬──────────┐
│ Service          │ Free   │ Pro      │
├──────────────────┼────────┼──────────┤
│ Vercel Postgres  │ 256MB  │ 10GB     │
│ Vercel KV        │ 30K/mo │ 300K/mo  │
│ Cron Jobs        │ 1/day  │ 1/hour   │
│ Serverless Fn    │ 100GB-h│ 1000GB-h │
│ AI SDK calls     │ BYOK   │ BYOK     │
│ Bandwidth        │ 100GB  │ 1TB      │
├──────────────────┼────────┼──────────┤
│ Total            │ $0     │ $20/mo   │
└──────────────────┴────────┴──────────┘
(BYOK = Bring Your Own Key for Claude/OpenAI API)
"""

import json
from datetime import datetime
from typing import Optional

import httpx
from loguru import logger


class VercelIntegration:
    """
    Vercel platform integration for cloud features.

    Communicates with Vercel-hosted API routes from the trading bot
    running on the desktop. The Next.js app on Vercel acts as the
    cloud brain — storing data, running analysis, serving the dashboard.
    """

    def __init__(self, config: dict):
        vercel_config = config.get("vercel", {})
        self.enabled = vercel_config.get("enabled", False)
        self.api_url = vercel_config.get("api_url", "")  # e.g., https://studex.vercel.app
        self.api_secret = vercel_config.get("api_secret", "")
        self.timeout = 30

    async def push_trade(self, trade: dict) -> bool:
        """Push a completed trade to Vercel Postgres for analytics."""
        return await self._post("/api/trading/trades", trade)

    async def push_portfolio_snapshot(self, snapshot: dict) -> bool:
        """Push portfolio state for time-series tracking."""
        return await self._post("/api/trading/portfolio", snapshot)

    async def push_signal(self, signal: dict) -> bool:
        """Push a signal for real-time dashboard updates."""
        return await self._post("/api/trading/signals", signal)

    async def push_ralf_feedback(self, feedback: dict) -> bool:
        """Push RALF feedback results for dashboard display."""
        return await self._post("/api/trading/ralf", feedback)

    async def get_ai_analysis(self, prompt: str, context: str = "") -> Optional[str]:
        """
        Use Vercel AI SDK (via API route) for Claude-powered analysis.
        This runs Claude on Vercel's infrastructure, not your desktop.
        Useful for complex analysis when Ollama isn't enough.
        """
        result = await self._post(
            "/api/trading/analyze",
            {"prompt": prompt, "context": context},
            expect_json=True,
        )
        if isinstance(result, dict):
            return result.get("analysis")
        return None

    async def validate_high_value_trade(self, setup: dict, rag_context: str) -> dict:
        """Validate a high-value trade using Claude via Vercel."""
        result = await self._post(
            "/api/trading/validate",
            {"setup": setup, "context": rag_context},
            expect_json=True,
        )
        if isinstance(result, dict):
            return result
        return {"verdict": "APPROVE", "note": "Vercel unavailable, defaulting to approve"}

    async def health_check(self) -> dict:
        """Check Vercel API connectivity."""
        if not self.enabled or not self.api_url:
            return {"status": "disabled"}

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(
                    f"{self.api_url}/api/trading/health",
                    headers=self._headers(),
                )
                if response.status_code == 200:
                    return response.json()
                return {"status": "error", "code": response.status_code}
        except Exception as e:
            return {"status": "unreachable", "error": str(e)}

    async def _post(self, path: str, data: dict, expect_json: bool = False):
        """POST data to a Vercel API route."""
        if not self.enabled or not self.api_url:
            return False

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.api_url}{path}",
                    json=data,
                    headers=self._headers(),
                )
                if response.status_code == 200:
                    return response.json() if expect_json else True
                else:
                    logger.debug(f"[Vercel] {path} returned {response.status_code}")
                    return False if not expect_json else None
        except Exception as e:
            logger.debug(f"[Vercel] {path} failed: {e}")
            return False if not expect_json else None

    def _headers(self) -> dict:
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_secret}",
        }
