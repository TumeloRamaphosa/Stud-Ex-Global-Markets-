/**
 * Trading Database Schema & Queries
 *
 * Uses Vercel Postgres (Neon) for:
 * - Trade history and analytics
 * - Portfolio snapshots (time-series)
 * - RALF feedback and learnings
 * - Signal log
 *
 * Setup: Connect Vercel Postgres from your Vercel dashboard,
 * then the POSTGRES_URL env var is auto-injected.
 */

// For local dev or when Vercel Postgres isn't connected yet,
// we use an in-memory store that persists to the API response.
// In production, replace with: import { sql } from '@vercel/postgres';

export interface Trade {
  id: string;
  symbol: string;
  strategy: string;
  direction: 'buy' | 'sell';
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  pnl: number | null;
  pnl_pct: number | null;
  regime: string;
  confidence: number;
  outcome: string | null;
  entry_time: string;
  exit_time: string | null;
  hold_duration_hours: number | null;
  exchange: string;
}

export interface PortfolioSnapshot {
  total_equity: number;
  cash: number;
  unrealized_pnl: number;
  realized_pnl: number;
  daily_pnl: number;
  max_drawdown: number;
  position_count: number;
  regime: string;
  timestamp: string;
}

export interface Signal {
  id: string;
  strategy: string;
  symbol: string;
  signal_type: 'buy' | 'sell' | 'close' | 'hold';
  confidence: number;
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  regime: string;
  timestamp: string;
  executed: boolean;
}

export interface RALFFeedback {
  strategy: string;
  health: string;
  win_rate: number;
  profit_factor: number;
  trade_count: number;
  adjustments: Array<{
    type: string;
    direction: string;
    suggestion: string;
    reason: string;
  }>;
  regime_performance: Record<string, { trades: number; wins: number; total_pnl: number }>;
  timestamp: string;
}

// ============================================================
// In-Memory Store (works without Vercel Postgres)
// Replace with @vercel/postgres in production
// ============================================================

class TradingStore {
  private trades: Trade[] = [];
  private portfolioSnapshots: PortfolioSnapshot[] = [];
  private signals: Signal[] = [];
  private ralfFeedback: RALFFeedback[] = [];

  // Trades
  addTrade(trade: Trade) {
    this.trades.push(trade);
    // Keep last 10,000 trades in memory
    if (this.trades.length > 10000) this.trades = this.trades.slice(-10000);
  }

  getTrades(limit = 50, strategy?: string): Trade[] {
    let filtered = this.trades;
    if (strategy) filtered = filtered.filter(t => t.strategy === strategy);
    return filtered.slice(-limit).reverse();
  }

  getTradeStats(strategy?: string) {
    let trades = this.trades.filter(t => t.exit_time !== null);
    if (strategy) trades = trades.filter(t => t.strategy === strategy);

    if (trades.length === 0) return { total_trades: 0 };

    const wins = trades.filter(t => (t.pnl || 0) > 0);
    const losses = trades.filter(t => (t.pnl || 0) <= 0);

    return {
      total_trades: trades.length,
      winning_trades: wins.length,
      losing_trades: losses.length,
      win_rate: (wins.length / trades.length) * 100,
      total_pnl: trades.reduce((sum, t) => sum + (t.pnl || 0), 0),
      avg_win: wins.length > 0 ? wins.reduce((s, t) => s + (t.pnl || 0), 0) / wins.length : 0,
      avg_loss: losses.length > 0 ? losses.reduce((s, t) => s + (t.pnl || 0), 0) / losses.length : 0,
      best_trade: Math.max(...trades.map(t => t.pnl || 0)),
      worst_trade: Math.min(...trades.map(t => t.pnl || 0)),
      avg_hold_hours: trades.reduce((s, t) => s + (t.hold_duration_hours || 0), 0) / trades.length,
      strategies: [...new Set(trades.map(t => t.strategy))],
    };
  }

  // Portfolio
  addPortfolioSnapshot(snapshot: PortfolioSnapshot) {
    this.portfolioSnapshots.push(snapshot);
    if (this.portfolioSnapshots.length > 8640) { // ~30 days of 5-min snapshots
      this.portfolioSnapshots = this.portfolioSnapshots.slice(-8640);
    }
  }

  getLatestPortfolio(): PortfolioSnapshot | null {
    return this.portfolioSnapshots[this.portfolioSnapshots.length - 1] || null;
  }

  getPortfolioHistory(hours = 24): PortfolioSnapshot[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    return this.portfolioSnapshots.filter(s => s.timestamp >= cutoff);
  }

  // Signals
  addSignal(signal: Signal) {
    this.signals.push(signal);
    if (this.signals.length > 5000) this.signals = this.signals.slice(-5000);
  }

  getRecentSignals(limit = 20): Signal[] {
    return this.signals.slice(-limit).reverse();
  }

  // RALF
  addRALFFeedback(feedback: RALFFeedback) {
    this.ralfFeedback.push(feedback);
    if (this.ralfFeedback.length > 500) this.ralfFeedback = this.ralfFeedback.slice(-500);
  }

  getLatestRALF(strategy?: string): RALFFeedback | null {
    const filtered = strategy
      ? this.ralfFeedback.filter(f => f.strategy === strategy)
      : this.ralfFeedback;
    return filtered[filtered.length - 1] || null;
  }

  getAllRALF(): RALFFeedback[] {
    return this.ralfFeedback;
  }
}

// Singleton store
export const tradingStore = new TradingStore();

// ============================================================
// SQL Schema (for Vercel Postgres production setup)
// Run this once via Vercel Postgres console or migration
// ============================================================
export const SQL_SCHEMA = `
-- Trade history
CREATE TABLE IF NOT EXISTS trades (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  strategy TEXT NOT NULL,
  direction TEXT NOT NULL,
  entry_price DECIMAL(18,8),
  exit_price DECIMAL(18,8),
  quantity DECIMAL(18,8),
  pnl DECIMAL(18,2),
  pnl_pct DECIMAL(8,4),
  regime TEXT,
  confidence DECIMAL(4,3),
  outcome TEXT,
  entry_time TIMESTAMP NOT NULL,
  exit_time TIMESTAMP,
  hold_duration_hours DECIMAL(10,2),
  exchange TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Portfolio time-series
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id SERIAL PRIMARY KEY,
  total_equity DECIMAL(18,2),
  cash DECIMAL(18,2),
  unrealized_pnl DECIMAL(18,2),
  realized_pnl DECIMAL(18,2),
  daily_pnl DECIMAL(18,2),
  max_drawdown DECIMAL(8,4),
  position_count INTEGER,
  regime TEXT,
  timestamp TIMESTAMP NOT NULL
);

-- Signal log
CREATE TABLE IF NOT EXISTS signals (
  id TEXT PRIMARY KEY,
  strategy TEXT NOT NULL,
  symbol TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  confidence DECIMAL(4,3),
  entry_price DECIMAL(18,8),
  stop_loss DECIMAL(18,8),
  take_profit DECIMAL(18,8),
  regime TEXT,
  timestamp TIMESTAMP NOT NULL,
  executed BOOLEAN DEFAULT FALSE
);

-- RALF feedback
CREATE TABLE IF NOT EXISTS ralf_feedback (
  id SERIAL PRIMARY KEY,
  strategy TEXT NOT NULL,
  health TEXT,
  win_rate DECIMAL(5,4),
  profit_factor DECIMAL(8,4),
  trade_count INTEGER,
  adjustments JSONB,
  regime_performance JSONB,
  timestamp TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trades_strategy ON trades(strategy);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_entry_time ON trades(entry_time);
CREATE INDEX IF NOT EXISTS idx_portfolio_timestamp ON portfolio_snapshots(timestamp);
CREATE INDEX IF NOT EXISTS idx_signals_timestamp ON signals(timestamp);
CREATE INDEX IF NOT EXISTS idx_ralf_strategy ON ralf_feedback(strategy);
`;
