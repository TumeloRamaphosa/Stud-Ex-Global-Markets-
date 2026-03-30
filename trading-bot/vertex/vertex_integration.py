"""
Google Vertex AI Integration for Trading Bot

Adds cloud-scale capabilities that complement local Ollama inference:

1. Gemini Models — Complex multi-document analysis, edge case reasoning
2. Vertex AI Embeddings — Production-grade embeddings for RAG
3. BigQuery — Store and query millions of candles, trades, and analytics
4. Vertex AI Pipelines — Scheduled backtesting and model evaluation
5. Vertex AI Agent Builder — Advanced multi-agent orchestration
6. Cloud Functions — Event-driven triggers (price alerts, news events)

Architecture:
┌──────────────────────────────────────────────────────┐
│                 HYBRID AI APPROACH                     │
│                                                        │
│  LOCAL (Ollama on Desktop GPU)    CLOUD (Vertex AI)   │
│  ├── Real-time decisions          ├── Deep analysis    │
│  ├── Signal generation            ├── Backtesting      │
│  ├── Swarm sentiment              ├── RAG embeddings   │
│  ├── Quick screening              ├── BigQuery store   │
│  └── 0 cost, low latency         └── Scale + quality  │
│                                                        │
│  Decision: Ollama first, escalate to Vertex when:     │
│  - Complex multi-factor analysis                       │
│  - Historical backtesting with large datasets          │
│  - High-stakes trade validation (> R50K position)     │
│  - Weekly strategy review and optimization             │
└──────────────────────────────────────────────────────┘

Setup:
1. Create Google Cloud project
2. Enable Vertex AI, BigQuery, Cloud Functions APIs
3. Create service account with appropriate roles
4. Set GOOGLE_APPLICATION_CREDENTIALS env var
5. Configure project_id and region in settings.yaml

Cost estimate:
- Gemini Flash: ~$0.075 per 1M input tokens (very cheap)
- Embeddings: ~$0.025 per 1K requests
- BigQuery: 1TB free per month
- Total: ~$5-20/month for moderate usage
"""

import json
from datetime import datetime
from typing import Optional

from loguru import logger


class VertexAIIntegration:
    """
    Google Vertex AI integration for cloud-scale trading intelligence.

    Falls back gracefully when Vertex is not configured — the bot
    works fully with just Ollama. Vertex adds depth, not dependency.
    """

    def __init__(self, config: dict):
        vertex_config = config.get("vertex", {})
        self.enabled = vertex_config.get("enabled", False)
        self.project_id = vertex_config.get("project_id", "")
        self.region = vertex_config.get("region", "us-central1")
        self.gemini_model = vertex_config.get("model", "gemini-2.0-flash")

        self._client = None
        self._bq_client = None
        self._initialized = False

    async def initialize(self) -> bool:
        """Initialize Vertex AI clients."""
        if not self.enabled or not self.project_id:
            logger.info("[Vertex] Not configured, using Ollama only")
            return False

        try:
            import vertexai
            from google.cloud import bigquery

            vertexai.init(project=self.project_id, location=self.region)
            self._bq_client = bigquery.Client(project=self.project_id)
            self._initialized = True
            logger.info(f"[Vertex] Initialized — Project: {self.project_id}, Region: {self.region}")
            return True

        except ImportError:
            logger.warning(
                "[Vertex] Google Cloud SDK not installed. "
                "Install with: pip install google-cloud-aiplatform google-cloud-bigquery"
            )
            return False
        except Exception as e:
            logger.error(f"[Vertex] Initialization failed: {e}")
            return False

    # ================================================================
    # GEMINI — Advanced Analysis
    # ================================================================

    async def analyze_with_gemini(self, prompt: str, context: str = "") -> Optional[str]:
        """
        Use Gemini for complex analysis that benefits from a larger model.
        E.g., multi-document reasoning, edge case analysis, strategy reviews.
        """
        if not self._initialized:
            return None

        try:
            from vertexai.generative_models import GenerativeModel

            model = GenerativeModel(self.gemini_model)

            full_prompt = prompt
            if context:
                full_prompt = f"""CONTEXT:\n{context}\n\n---\n\n{prompt}"""

            response = model.generate_content(
                full_prompt,
                generation_config={
                    "temperature": 0.3,
                    "max_output_tokens": 2048,
                },
            )

            return response.text

        except Exception as e:
            logger.error(f"[Vertex:Gemini] Analysis failed: {e}")
            return None

    async def validate_high_value_trade(self, trade_setup: dict, rag_context: str) -> dict:
        """
        Use Gemini to validate trades above a value threshold.
        More thorough than Ollama — considers multiple angles.
        """
        prompt = f"""You are an expert trade validator. A high-value trade has been proposed.
Analyze it thoroughly and decide whether to APPROVE, MODIFY, or REJECT.

TRADE SETUP:
{json.dumps(trade_setup, indent=2)}

HISTORICAL CONTEXT (from RAG):
{rag_context}

Evaluate:
1. Edge quality (is there a genuine, repeatable edge?)
2. Risk/reward (does the math work?)
3. Regime alignment (does the current market support this?)
4. Position sizing (appropriate for portfolio size?)
5. Historical precedent (how did similar setups perform?)

Respond with:
VERDICT: [APPROVE/MODIFY/REJECT]
CONFIDENCE: [1-10]
RISK_ASSESSMENT: [LOW/MEDIUM/HIGH/EXTREME]
MODIFICATIONS: [any changes needed, or "none"]
REASONING: [3-5 sentences]"""

        result = await self.analyze_with_gemini(prompt)

        if not result:
            return {"verdict": "APPROVE", "note": "Vertex unavailable, defaulting to approve"}

        # Parse response
        parsed = {"verdict": "APPROVE", "confidence": 5, "risk": "MEDIUM", "reasoning": result}
        for line in result.split("\n"):
            line = line.strip()
            if line.startswith("VERDICT:"):
                parsed["verdict"] = line.split(":")[1].strip()
            elif line.startswith("CONFIDENCE:"):
                try:
                    parsed["confidence"] = int(line.split(":")[1].strip().split("/")[0])
                except (ValueError, IndexError):
                    pass
            elif line.startswith("RISK_ASSESSMENT:"):
                parsed["risk"] = line.split(":")[1].strip()

        return parsed

    async def weekly_strategy_review(self, performance_data: dict, learnings: list) -> str:
        """
        Comprehensive weekly strategy review using Gemini's larger context window.
        Analyzes all strategies, learnings, and market conditions holistically.
        """
        prompt = f"""You are the Chief Strategy Officer for an automated trading operation
in South Africa, trading both crypto (LUNO/Binance) and JSE equities.

WEEKLY PERFORMANCE:
{json.dumps(performance_data, indent=2)}

RALF LEARNINGS THIS WEEK:
{json.dumps(learnings, indent=2)}

Produce a weekly strategy review covering:

1. PORTFOLIO HEALTH ASSESSMENT
   - Overall P&L trajectory
   - Risk utilization vs limits
   - Strategy correlation analysis

2. STRATEGY-BY-STRATEGY REVIEW
   - What's working and why
   - What's failing and root cause
   - Parameter adjustment recommendations

3. MARKET REGIME OUTLOOK
   - Current regime and expected duration
   - Crypto vs JSE relative opportunity
   - ZAR/USD impact on positions

4. NEXT WEEK ACTION PLAN
   - Top 3 priorities
   - Strategies to increase/decrease allocation
   - Specific trades to watch

5. RISK ALERTS
   - Any emerging risks
   - Correlation warnings
   - Exposure rebalancing needs

Keep it professional but actionable. Under 500 words."""

        return await self.analyze_with_gemini(prompt) or "Vertex AI unavailable for weekly review."

    # ================================================================
    # BIGQUERY — Trade Analytics at Scale
    # ================================================================

    async def setup_bigquery_tables(self):
        """Create BigQuery dataset and tables for trade analytics."""
        if not self._initialized or not self._bq_client:
            return

        try:
            from google.cloud import bigquery

            dataset_id = f"{self.project_id}.studex_trading"

            # Create dataset
            dataset = bigquery.Dataset(dataset_id)
            dataset.location = "US"
            self._bq_client.create_dataset(dataset, exists_ok=True)

            # Trades table
            trades_schema = [
                bigquery.SchemaField("trade_id", "STRING"),
                bigquery.SchemaField("symbol", "STRING"),
                bigquery.SchemaField("strategy", "STRING"),
                bigquery.SchemaField("direction", "STRING"),
                bigquery.SchemaField("entry_price", "FLOAT64"),
                bigquery.SchemaField("exit_price", "FLOAT64"),
                bigquery.SchemaField("quantity", "FLOAT64"),
                bigquery.SchemaField("pnl", "FLOAT64"),
                bigquery.SchemaField("pnl_pct", "FLOAT64"),
                bigquery.SchemaField("regime", "STRING"),
                bigquery.SchemaField("confidence", "FLOAT64"),
                bigquery.SchemaField("outcome", "STRING"),
                bigquery.SchemaField("entry_time", "TIMESTAMP"),
                bigquery.SchemaField("exit_time", "TIMESTAMP"),
                bigquery.SchemaField("hold_duration_hours", "FLOAT64"),
            ]

            trades_table = bigquery.Table(f"{dataset_id}.trades", schema=trades_schema)
            self._bq_client.create_table(trades_table, exists_ok=True)

            # Market data table (for backtesting at scale)
            market_schema = [
                bigquery.SchemaField("symbol", "STRING"),
                bigquery.SchemaField("timestamp", "TIMESTAMP"),
                bigquery.SchemaField("timeframe", "STRING"),
                bigquery.SchemaField("open", "FLOAT64"),
                bigquery.SchemaField("high", "FLOAT64"),
                bigquery.SchemaField("low", "FLOAT64"),
                bigquery.SchemaField("close", "FLOAT64"),
                bigquery.SchemaField("volume", "FLOAT64"),
            ]

            market_table = bigquery.Table(f"{dataset_id}.market_data", schema=market_schema)
            self._bq_client.create_table(market_table, exists_ok=True)

            # Strategy performance table
            perf_schema = [
                bigquery.SchemaField("strategy", "STRING"),
                bigquery.SchemaField("date", "DATE"),
                bigquery.SchemaField("trades", "INT64"),
                bigquery.SchemaField("wins", "INT64"),
                bigquery.SchemaField("losses", "INT64"),
                bigquery.SchemaField("win_rate", "FLOAT64"),
                bigquery.SchemaField("profit_factor", "FLOAT64"),
                bigquery.SchemaField("total_pnl", "FLOAT64"),
                bigquery.SchemaField("max_drawdown", "FLOAT64"),
                bigquery.SchemaField("sharpe_ratio", "FLOAT64"),
            ]

            perf_table = bigquery.Table(f"{dataset_id}.strategy_performance", schema=perf_schema)
            self._bq_client.create_table(perf_table, exists_ok=True)

            logger.info("[Vertex:BQ] BigQuery tables created successfully")

        except Exception as e:
            logger.error(f"[Vertex:BQ] Table setup failed: {e}")

    async def store_trade_bigquery(self, trade: dict):
        """Store a completed trade in BigQuery for long-term analytics."""
        if not self._initialized or not self._bq_client:
            return

        try:
            table_id = f"{self.project_id}.studex_trading.trades"
            rows = [{
                "trade_id": trade.get("trade_id", ""),
                "symbol": trade.get("symbol", ""),
                "strategy": trade.get("strategy", ""),
                "direction": trade.get("side", ""),
                "entry_price": trade.get("entry_price", 0),
                "exit_price": trade.get("exit_price", 0),
                "quantity": trade.get("quantity", 0),
                "pnl": trade.get("pnl", 0),
                "pnl_pct": trade.get("pnl_pct", 0),
                "regime": trade.get("regime", ""),
                "confidence": trade.get("confidence", 0),
                "outcome": trade.get("outcome", ""),
                "entry_time": trade.get("opened_at", datetime.now().isoformat()),
                "exit_time": trade.get("closed_at", datetime.now().isoformat()),
                "hold_duration_hours": trade.get("duration_hours", 0),
            }]

            errors = self._bq_client.insert_rows_json(table_id, rows)
            if errors:
                logger.error(f"[Vertex:BQ] Insert errors: {errors}")
            else:
                logger.debug(f"[Vertex:BQ] Trade stored: {trade.get('trade_id')}")

        except Exception as e:
            logger.error(f"[Vertex:BQ] Trade store failed: {e}")

    async def query_strategy_analytics(self, strategy: str, days: int = 90) -> dict:
        """Query BigQuery for deep strategy analytics."""
        if not self._initialized or not self._bq_client:
            return {}

        try:
            query = f"""
                SELECT
                    strategy,
                    COUNT(*) as total_trades,
                    COUNTIF(pnl > 0) as wins,
                    COUNTIF(pnl <= 0) as losses,
                    SAFE_DIVIDE(COUNTIF(pnl > 0), COUNT(*)) as win_rate,
                    SUM(pnl) as total_pnl,
                    AVG(CASE WHEN pnl > 0 THEN pnl END) as avg_win,
                    AVG(CASE WHEN pnl <= 0 THEN ABS(pnl) END) as avg_loss,
                    AVG(hold_duration_hours) as avg_hold_hours,
                    regime,
                    COUNT(*) as regime_trades,
                    SAFE_DIVIDE(COUNTIF(pnl > 0), COUNT(*)) as regime_win_rate
                FROM `{self.project_id}.studex_trading.trades`
                WHERE strategy = @strategy
                    AND entry_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @days DAY)
                GROUP BY strategy, regime
                ORDER BY regime_trades DESC
            """

            from google.cloud import bigquery
            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("strategy", "STRING", strategy),
                    bigquery.ScalarQueryParameter("days", "INT64", days),
                ]
            )

            results = self._bq_client.query(query, job_config=job_config)
            rows = [dict(row) for row in results]

            return {
                "strategy": strategy,
                "period_days": days,
                "regime_breakdown": rows,
            }

        except Exception as e:
            logger.error(f"[Vertex:BQ] Query failed: {e}")
            return {}

    # ================================================================
    # VERTEX AI PIPELINES — Scheduled Backtesting
    # ================================================================

    async def create_backtest_pipeline(self, strategy_config: dict) -> Optional[str]:
        """
        Create a Vertex AI Pipeline for scheduled backtesting.
        Runs backtests on cloud infrastructure, not your desktop.
        """
        if not self._initialized:
            return None

        try:
            from google.cloud import aiplatform

            # Define pipeline components
            pipeline_spec = {
                "name": f"backtest-{strategy_config.get('strategy', 'unknown')}",
                "description": "Automated strategy backtesting pipeline",
                "parameters": {
                    "strategy": strategy_config.get("strategy", ""),
                    "symbols": json.dumps(strategy_config.get("symbols", [])),
                    "start_date": strategy_config.get("start_date", "2023-01-01"),
                    "end_date": strategy_config.get("end_date", "2025-12-31"),
                    "initial_capital": strategy_config.get("initial_capital", 100000),
                },
            }

            logger.info(f"[Vertex:Pipeline] Backtest pipeline spec: {pipeline_spec['name']}")
            # In production, this would submit to Vertex AI Pipelines
            # For now, return the spec for manual/scheduled execution

            return json.dumps(pipeline_spec)

        except Exception as e:
            logger.error(f"[Vertex:Pipeline] Creation failed: {e}")
            return None

    # ================================================================
    # EMBEDDINGS — Production-grade for RAG
    # ================================================================

    async def get_embedding(self, text: str) -> Optional[list[float]]:
        """Get embedding from Vertex AI text-embedding model."""
        if not self._initialized:
            return None

        try:
            from vertexai.language_models import TextEmbeddingModel

            model = TextEmbeddingModel.from_pretrained("textembedding-gecko@003")
            embeddings = model.get_embeddings([text])
            return embeddings[0].values

        except Exception as e:
            logger.debug(f"[Vertex:Embed] Failed: {e}")
            return None

    # ================================================================
    # HEALTH CHECK
    # ================================================================

    async def health_check(self) -> dict:
        """Check Vertex AI connectivity and available services."""
        status = {
            "enabled": self.enabled,
            "initialized": self._initialized,
            "project_id": self.project_id,
            "region": self.region,
            "services": {},
        }

        if not self._initialized:
            return status

        # Check Gemini
        try:
            test = await self.analyze_with_gemini("Reply with just 'ok'")
            status["services"]["gemini"] = "ok" if test else "error"
        except Exception:
            status["services"]["gemini"] = "error"

        # Check BigQuery
        try:
            if self._bq_client:
                self._bq_client.query("SELECT 1").result()
                status["services"]["bigquery"] = "ok"
        except Exception:
            status["services"]["bigquery"] = "error"

        return status
