"""
RALF Loop Engine — Reason → Act → Learn → Feedback

The self-improving core of the trading bot. Every trade goes through:

1. REASON: Analyze market conditions, generate hypothesis
   - "BTC is oversold with bullish divergence in a broadening regime"
   - Records the reasoning BEFORE the trade

2. ACT: Execute the trade with full context logging
   - Entry, exit, position size, strategy, regime, indicators

3. LEARN: Post-trade analysis (Signal Postmortem)
   - Classify outcome: TRUE_POSITIVE, FALSE_POSITIVE, MISSED_OPPORTUNITY, REGIME_MISMATCH
   - Calculate actual R:R, hold time, max adverse excursion
   - Compare predicted vs actual outcome

4. FEEDBACK: Adjust strategy parameters
   - Update win rates, avg win/loss for Kelly sizing
   - Adjust signal confidence weights
   - Detect strategy decay (rolling win rate declining)
   - Recommend parameter changes or strategy pivots

This creates a flywheel: more trades → better data → smarter decisions → better trades.
"""

import json
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

from loguru import logger


class TradeOutcome:
    TRUE_POSITIVE = "true_positive"       # Predicted direction, made money
    FALSE_POSITIVE = "false_positive"     # Predicted direction, lost money
    MISSED_OPPORTUNITY = "missed"         # Signal rejected but would have worked
    REGIME_MISMATCH = "regime_mismatch"   # Right idea, wrong market regime
    STOPPED_OUT = "stopped_out"           # Hit stop loss
    TIME_DECAY = "time_decay"            # Took too long, closed flat


class RALFEngine:
    """
    Reason-Act-Learn-Feedback engine for continuous strategy improvement.
    Stores all trade reasoning, outcomes, and learnings in SQLite.
    """

    def __init__(self, db_path: str = None):
        self.db_path = db_path or str(Path(__file__).parent.parent / "data" / "ralf.db")
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        self._init_db()
        self._strategy_stats: dict[str, dict] = {}
        logger.info(f"[RALF] Engine initialized. DB: {self.db_path}")

    def _init_db(self):
        """Initialize the RALF database schema."""
        with sqlite3.connect(self.db_path) as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS trade_journal (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    trade_id TEXT UNIQUE,
                    symbol TEXT NOT NULL,
                    strategy TEXT NOT NULL,
                    direction TEXT NOT NULL,

                    -- REASON phase
                    hypothesis TEXT,
                    regime TEXT,
                    confidence REAL,
                    reasoning_snapshot TEXT,  -- JSON: indicators, news, sentiment at entry

                    -- ACT phase
                    entry_price REAL,
                    entry_time TEXT,
                    position_size REAL,
                    stop_loss REAL,
                    take_profit REAL,

                    -- LEARN phase (filled after trade closes)
                    exit_price REAL,
                    exit_time TEXT,
                    pnl REAL,
                    pnl_pct REAL,
                    max_favorable_excursion REAL,   -- Best unrealized PnL during trade
                    max_adverse_excursion REAL,     -- Worst unrealized PnL during trade
                    actual_rr REAL,                 -- Actual risk/reward achieved
                    hold_duration_hours REAL,
                    outcome TEXT,                    -- TradeOutcome classification

                    -- FEEDBACK phase
                    postmortem TEXT,                -- LLM-generated analysis
                    lessons TEXT,                   -- Key takeaways
                    parameter_adjustments TEXT,     -- JSON: suggested param changes

                    created_at TEXT DEFAULT (datetime('now'))
                );

                CREATE TABLE IF NOT EXISTS strategy_performance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    strategy TEXT NOT NULL,
                    period TEXT NOT NULL,            -- 'daily', 'weekly', 'monthly'
                    period_start TEXT NOT NULL,
                    total_trades INTEGER,
                    wins INTEGER,
                    losses INTEGER,
                    win_rate REAL,
                    avg_win REAL,
                    avg_loss REAL,
                    profit_factor REAL,
                    sharpe_ratio REAL,
                    max_drawdown REAL,
                    avg_hold_hours REAL,
                    regime_breakdown TEXT,           -- JSON: performance per regime
                    created_at TEXT DEFAULT (datetime('now'))
                );

                CREATE TABLE IF NOT EXISTS learnings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category TEXT NOT NULL,          -- 'strategy', 'regime', 'risk', 'sentiment'
                    insight TEXT NOT NULL,
                    confidence REAL,
                    evidence_count INTEGER DEFAULT 1,
                    first_observed TEXT,
                    last_confirmed TEXT,
                    applies_to TEXT,                 -- strategy name or 'all'
                    actionable_change TEXT,          -- specific parameter adjustment
                    created_at TEXT DEFAULT (datetime('now'))
                );

                CREATE TABLE IF NOT EXISTS feedback_actions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    action_type TEXT NOT NULL,       -- 'param_adjust', 'strategy_pause', 'weight_change'
                    strategy TEXT,
                    description TEXT NOT NULL,
                    old_value TEXT,
                    new_value TEXT,
                    reason TEXT,
                    applied_at TEXT,
                    reverted_at TEXT,
                    performance_impact REAL,         -- measured after applying
                    created_at TEXT DEFAULT (datetime('now'))
                );

                CREATE INDEX IF NOT EXISTS idx_journal_strategy ON trade_journal(strategy);
                CREATE INDEX IF NOT EXISTS idx_journal_symbol ON trade_journal(symbol);
                CREATE INDEX IF NOT EXISTS idx_journal_outcome ON trade_journal(outcome);
                CREATE INDEX IF NOT EXISTS idx_performance_strategy ON strategy_performance(strategy, period);
            """)

    # ================================================================
    # PHASE 1: REASON — Record the hypothesis before trading
    # ================================================================

    def record_reasoning(
        self,
        trade_id: str,
        symbol: str,
        strategy: str,
        direction: str,
        hypothesis: str,
        regime: str,
        confidence: float,
        indicators_snapshot: dict,
        entry_price: float,
        position_size: float,
        stop_loss: float = None,
        take_profit: float = None,
    ):
        """Record the reasoning behind a trade BEFORE execution."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """INSERT OR REPLACE INTO trade_journal
                   (trade_id, symbol, strategy, direction, hypothesis, regime,
                    confidence, reasoning_snapshot, entry_price, entry_time,
                    position_size, stop_loss, take_profit)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    trade_id, symbol, strategy, direction, hypothesis, regime,
                    confidence, json.dumps(indicators_snapshot), entry_price,
                    datetime.now().isoformat(), position_size, stop_loss, take_profit,
                ),
            )
        logger.info(f"[RALF:REASON] {trade_id}: {hypothesis[:100]}")

    # ================================================================
    # PHASE 2: ACT — Trade execution is handled by the engine
    # (The engine calls record_reasoning before, record_outcome after)
    # ================================================================

    # ================================================================
    # PHASE 3: LEARN — Post-trade analysis
    # ================================================================

    def record_outcome(
        self,
        trade_id: str,
        exit_price: float,
        pnl: float,
        pnl_pct: float,
        max_favorable: float = 0,
        max_adverse: float = 0,
    ):
        """Record trade outcome and classify it."""
        with sqlite3.connect(self.db_path) as conn:
            # Get the original trade data
            row = conn.execute(
                "SELECT entry_price, stop_loss, take_profit, direction, confidence, regime "
                "FROM trade_journal WHERE trade_id = ?",
                (trade_id,),
            ).fetchone()

            if not row:
                logger.warning(f"[RALF:LEARN] Trade {trade_id} not found in journal")
                return

            entry_price, stop_loss, take_profit, direction, confidence, regime = row

            # Calculate metrics
            hold_start = conn.execute(
                "SELECT entry_time FROM trade_journal WHERE trade_id = ?",
                (trade_id,),
            ).fetchone()

            hold_duration = 0
            if hold_start and hold_start[0]:
                entry_dt = datetime.fromisoformat(hold_start[0])
                hold_duration = (datetime.now() - entry_dt).total_seconds() / 3600

            # Calculate actual R:R
            actual_rr = 0
            if stop_loss and entry_price and stop_loss != entry_price:
                risk = abs(entry_price - stop_loss)
                reward = abs(pnl) / (risk * 1) if risk > 0 else 0
                actual_rr = reward if pnl > 0 else -reward

            # Classify outcome
            outcome = self._classify_outcome(
                pnl=pnl,
                pnl_pct=pnl_pct,
                stop_loss=stop_loss,
                exit_price=exit_price,
                entry_price=entry_price,
                direction=direction,
                hold_duration=hold_duration,
            )

            conn.execute(
                """UPDATE trade_journal SET
                   exit_price=?, exit_time=?, pnl=?, pnl_pct=?,
                   max_favorable_excursion=?, max_adverse_excursion=?,
                   actual_rr=?, hold_duration_hours=?, outcome=?
                   WHERE trade_id=?""",
                (
                    exit_price, datetime.now().isoformat(), pnl, pnl_pct,
                    max_favorable, max_adverse, actual_rr, hold_duration,
                    outcome, trade_id,
                ),
            )

        logger.info(
            f"[RALF:LEARN] {trade_id}: {outcome} | "
            f"PnL: {pnl:+.2f} ({pnl_pct:+.2f}%) | R:R: {actual_rr:.2f} | "
            f"Hold: {hold_duration:.1f}h"
        )

        return outcome

    def _classify_outcome(
        self, pnl, pnl_pct, stop_loss, exit_price, entry_price, direction, hold_duration
    ) -> str:
        """Classify trade outcome for learning."""
        if pnl > 0 and pnl_pct > 0.5:
            return TradeOutcome.TRUE_POSITIVE

        if stop_loss:
            if direction == "buy" and exit_price <= stop_loss:
                return TradeOutcome.STOPPED_OUT
            elif direction == "sell" and exit_price >= stop_loss:
                return TradeOutcome.STOPPED_OUT

        if hold_duration > 72 and abs(pnl_pct) < 1.0:
            return TradeOutcome.TIME_DECAY

        if pnl < 0:
            return TradeOutcome.FALSE_POSITIVE

        return TradeOutcome.TRUE_POSITIVE

    # ================================================================
    # PHASE 4: FEEDBACK — Strategy adjustment recommendations
    # ================================================================

    def generate_feedback(self, strategy: str, lookback_days: int = 30) -> dict:
        """
        Analyze recent performance and generate feedback for strategy adjustment.
        This is the key innovation — the bot adapts its own parameters.
        """
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cutoff = (datetime.now() - timedelta(days=lookback_days)).isoformat()

            trades = conn.execute(
                """SELECT * FROM trade_journal
                   WHERE strategy = ? AND exit_time IS NOT NULL AND entry_time > ?
                   ORDER BY entry_time DESC""",
                (strategy, cutoff),
            ).fetchall()

        if len(trades) < 5:
            return {"status": "insufficient_data", "trade_count": len(trades)}

        # Calculate rolling statistics
        wins = [t for t in trades if t["pnl"] and t["pnl"] > 0]
        losses = [t for t in trades if t["pnl"] and t["pnl"] < 0]

        total = len(trades)
        win_rate = len(wins) / total if total > 0 else 0
        avg_win = sum(t["pnl"] for t in wins) / len(wins) if wins else 0
        avg_loss = abs(sum(t["pnl"] for t in losses) / len(losses)) if losses else 1
        profit_factor = (sum(t["pnl"] for t in wins) / abs(sum(t["pnl"] for t in losses))) if losses and sum(t["pnl"] for t in losses) != 0 else float("inf")

        # Outcome distribution
        outcomes = {}
        for t in trades:
            o = t["outcome"] or "unknown"
            outcomes[o] = outcomes.get(o, 0) + 1

        # Regime performance breakdown
        regime_perf = {}
        for t in trades:
            r = t["regime"] or "unknown"
            if r not in regime_perf:
                regime_perf[r] = {"trades": 0, "wins": 0, "total_pnl": 0}
            regime_perf[r]["trades"] += 1
            if t["pnl"] and t["pnl"] > 0:
                regime_perf[r]["wins"] += 1
            regime_perf[r]["total_pnl"] += t["pnl"] or 0

        # Generate adjustment recommendations
        adjustments = []

        # 1. Win rate declining? Tighten entry criteria
        recent_5 = trades[:5]
        recent_win_rate = len([t for t in recent_5 if t["pnl"] and t["pnl"] > 0]) / 5
        if recent_win_rate < win_rate * 0.7:
            adjustments.append({
                "type": "confidence_threshold",
                "direction": "increase",
                "reason": f"Recent win rate ({recent_win_rate:.0%}) dropped vs overall ({win_rate:.0%})",
                "suggestion": "Increase minimum confidence from 0.5 to 0.6",
            })

        # 2. Too many stopped out? Widen stops
        stop_rate = outcomes.get(TradeOutcome.STOPPED_OUT, 0) / total
        if stop_rate > 0.4:
            adjustments.append({
                "type": "stop_loss",
                "direction": "widen",
                "reason": f"{stop_rate:.0%} of trades stopped out (too many)",
                "suggestion": "Increase ATR stop multiplier from 2.0 to 2.5",
            })

        # 3. Regime underperforming? Disable in that regime
        for regime, perf in regime_perf.items():
            regime_wr = perf["wins"] / perf["trades"] if perf["trades"] > 0 else 0
            if perf["trades"] >= 3 and regime_wr < 0.3:
                adjustments.append({
                    "type": "regime_filter",
                    "direction": "disable",
                    "reason": f"Win rate in {regime} regime is only {regime_wr:.0%}",
                    "suggestion": f"Disable strategy in {regime} regime",
                })

        # 4. Profit factor deteriorating? Reduce position size
        if profit_factor < 1.2 and total >= 10:
            adjustments.append({
                "type": "position_size",
                "direction": "decrease",
                "reason": f"Profit factor ({profit_factor:.2f}) is marginal",
                "suggestion": "Reduce max position size by 25%",
            })

        # 5. Holding too long? Tighten time-based exits
        avg_hold = sum(t["hold_duration_hours"] or 0 for t in trades) / total
        losing_hold = sum(t["hold_duration_hours"] or 0 for t in losses) / len(losses) if losses else 0
        if losing_hold > avg_hold * 1.5:
            adjustments.append({
                "type": "time_exit",
                "direction": "add",
                "reason": f"Losing trades held {losing_hold:.0f}h vs avg {avg_hold:.0f}h",
                "suggestion": f"Add time-based exit at {avg_hold * 1.2:.0f} hours",
            })

        # 6. MFE/MAE analysis: leaving money on the table?
        trades_with_mfe = [t for t in wins if t["max_favorable_excursion"] and t["pnl"]]
        if trades_with_mfe:
            avg_mfe_ratio = sum(
                t["max_favorable_excursion"] / t["pnl"]
                for t in trades_with_mfe if t["pnl"] > 0
            ) / len(trades_with_mfe)
            if avg_mfe_ratio > 2.0:
                adjustments.append({
                    "type": "take_profit",
                    "direction": "widen",
                    "reason": f"Avg MFE is {avg_mfe_ratio:.1f}x actual profit — exiting too early",
                    "suggestion": "Use trailing stop instead of fixed take profit",
                })

        feedback = {
            "status": "analysis_complete",
            "strategy": strategy,
            "period_days": lookback_days,
            "trade_count": total,
            "win_rate": win_rate,
            "profit_factor": profit_factor,
            "avg_win": avg_win,
            "avg_loss": avg_loss,
            "avg_hold_hours": avg_hold,
            "outcome_distribution": outcomes,
            "regime_performance": regime_perf,
            "adjustments": adjustments,
            "health": self._assess_strategy_health(win_rate, profit_factor, total, recent_win_rate),
        }

        # Store feedback
        self._store_feedback(feedback)

        logger.info(
            f"[RALF:FEEDBACK] {strategy}: {total} trades | "
            f"WR: {win_rate:.0%} | PF: {profit_factor:.2f} | "
            f"{len(adjustments)} adjustments recommended"
        )

        return feedback

    def _assess_strategy_health(
        self, win_rate: float, profit_factor: float, trade_count: int, recent_wr: float
    ) -> str:
        """Assess overall strategy health: HEALTHY, WARNING, CRITICAL, DEAD."""
        if trade_count < 10:
            return "EVALUATING"
        if win_rate >= 0.5 and profit_factor >= 1.5 and recent_wr >= 0.4:
            return "HEALTHY"
        if win_rate >= 0.4 and profit_factor >= 1.0:
            return "WARNING"
        if profit_factor < 1.0 or recent_wr < 0.2:
            return "CRITICAL"
        return "WARNING"

    def _store_feedback(self, feedback: dict):
        """Store feedback actions in the database."""
        with sqlite3.connect(self.db_path) as conn:
            for adj in feedback.get("adjustments", []):
                conn.execute(
                    """INSERT INTO feedback_actions
                       (action_type, strategy, description, reason, created_at)
                       VALUES (?, ?, ?, ?, ?)""",
                    (
                        adj["type"],
                        feedback["strategy"],
                        adj["suggestion"],
                        adj["reason"],
                        datetime.now().isoformat(),
                    ),
                )

    # ================================================================
    # LEARNING EXTRACTION — Mine patterns from trade history
    # ================================================================

    def extract_learnings(self, min_trades: int = 20) -> list[dict]:
        """
        Mine the trade journal for patterns and generate learnings.
        This is what makes the bot smarter over time.
        """
        learnings = []

        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row

            # Learning 1: Best performing time of day
            hourly = conn.execute("""
                SELECT CAST(strftime('%H', entry_time) AS INTEGER) as hour,
                       COUNT(*) as trades,
                       AVG(CASE WHEN pnl > 0 THEN 1.0 ELSE 0.0 END) as win_rate,
                       AVG(pnl) as avg_pnl
                FROM trade_journal
                WHERE exit_time IS NOT NULL
                GROUP BY hour
                HAVING trades >= 3
                ORDER BY win_rate DESC
            """).fetchall()

            if hourly:
                best_hour = hourly[0]
                worst_hour = hourly[-1]
                learnings.append({
                    "category": "timing",
                    "insight": f"Best entry hour: {best_hour['hour']}:00 "
                              f"(WR: {best_hour['win_rate']:.0%}, {best_hour['trades']} trades). "
                              f"Worst: {worst_hour['hour']}:00 "
                              f"(WR: {worst_hour['win_rate']:.0%})",
                    "confidence": min(best_hour["trades"] / 10, 1.0),
                })

            # Learning 2: Confidence calibration
            conf_buckets = conn.execute("""
                SELECT CASE
                    WHEN confidence < 0.6 THEN 'low'
                    WHEN confidence < 0.8 THEN 'medium'
                    ELSE 'high'
                END as conf_level,
                COUNT(*) as trades,
                AVG(CASE WHEN pnl > 0 THEN 1.0 ELSE 0.0 END) as win_rate
                FROM trade_journal
                WHERE exit_time IS NOT NULL AND confidence IS NOT NULL
                GROUP BY conf_level
            """).fetchall()

            for bucket in conf_buckets:
                if bucket["trades"] >= 5:
                    learnings.append({
                        "category": "confidence_calibration",
                        "insight": f"{bucket['conf_level'].upper()} confidence signals: "
                                  f"WR={bucket['win_rate']:.0%} ({bucket['trades']} trades)",
                        "confidence": min(bucket["trades"] / 15, 1.0),
                    })

            # Learning 3: Regime-strategy combinations
            regime_strategy = conn.execute("""
                SELECT regime, strategy,
                       COUNT(*) as trades,
                       AVG(CASE WHEN pnl > 0 THEN 1.0 ELSE 0.0 END) as win_rate,
                       SUM(pnl) as total_pnl
                FROM trade_journal
                WHERE exit_time IS NOT NULL AND regime IS NOT NULL
                GROUP BY regime, strategy
                HAVING trades >= 3
                ORDER BY win_rate DESC
            """).fetchall()

            for rs in regime_strategy:
                learnings.append({
                    "category": "regime_strategy",
                    "insight": f"{rs['strategy']} in {rs['regime']}: "
                              f"WR={rs['win_rate']:.0%}, PnL={rs['total_pnl']:+.2f} "
                              f"({rs['trades']} trades)",
                    "confidence": min(rs["trades"] / 10, 1.0),
                })

        # Store learnings
        with sqlite3.connect(self.db_path) as conn:
            for learning in learnings:
                conn.execute(
                    """INSERT INTO learnings
                       (category, insight, confidence, first_observed, last_confirmed, applies_to)
                       VALUES (?, ?, ?, ?, ?, ?)""",
                    (
                        learning["category"],
                        learning["insight"],
                        learning["confidence"],
                        datetime.now().isoformat(),
                        datetime.now().isoformat(),
                        "all",
                    ),
                )

        logger.info(f"[RALF] Extracted {len(learnings)} learnings from trade history")
        return learnings

    def get_strategy_stats(self, strategy: str) -> dict:
        """Get cached strategy statistics for Kelly sizing and confidence calibration."""
        with sqlite3.connect(self.db_path) as conn:
            row = conn.execute(
                """SELECT
                       COUNT(*) as total,
                       AVG(CASE WHEN pnl > 0 THEN 1.0 ELSE 0.0 END) as win_rate,
                       AVG(CASE WHEN pnl > 0 THEN pnl ELSE NULL END) as avg_win,
                       AVG(CASE WHEN pnl < 0 THEN ABS(pnl) ELSE NULL END) as avg_loss
                   FROM trade_journal
                   WHERE strategy = ? AND exit_time IS NOT NULL""",
                (strategy,),
            ).fetchone()

            if row and row[0] > 0:
                return {
                    "total_trades": row[0],
                    "win_rate": row[1] or 0.5,
                    "avg_win": row[2] or 1.0,
                    "avg_loss": row[3] or 1.0,
                }

        return {"total_trades": 0, "win_rate": 0.5, "avg_win": 1.0, "avg_loss": 1.0}
