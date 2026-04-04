'use client';

import { useState } from 'react';
import { ArrowLeft, Search, Zap, TrendingUp, Shield, Brain, BarChart3, Globe, Coins, GitBranch, Radio, Bot } from 'lucide-react';

// All 119 CloddsBot skills organized by category
const SKILL_CATEGORIES = [
  {
    name: 'Trading Execution',
    icon: <Zap className="w-5 h-5 text-yellow-500" />,
    color: 'yellow',
    skills: [
      { name: 'trading-polymarket', desc: 'Trade on Polymarket prediction markets (CLOB orders, limit/market)', status: 'active' },
      { name: 'trading-kalshi', desc: 'Trade on Kalshi regulated prediction markets (event contracts)', status: 'active' },
      { name: 'trading-betfair', desc: 'Trade on Betfair exchange (back/lay, in-play markets)', status: 'active' },
      { name: 'trading-smarkets', desc: 'Trade on Smarkets prediction exchange', status: 'active' },
      { name: 'trading-drift', desc: 'Trade on Drift Protocol (Solana perps, prediction markets)', status: 'active' },
      { name: 'trading-solana', desc: 'Swap tokens on Solana via Jupiter, Raydium, Orca, Meteora', status: 'active' },
      { name: 'trading-evm', desc: 'Trade on Uniswap V3, 1inch, PancakeSwap across 5 EVM chains', status: 'active' },
      { name: 'trading-futures', desc: 'Perpetual futures on Binance (125x), Bybit (100x), Hyperliquid', status: 'active' },
      { name: 'trading-mexc', desc: 'MEXC futures trading with up to 200x leverage', status: 'active' },
      { name: 'trading-percolator', desc: 'On-chain Solana perpetuals via Percolator', status: 'active' },
      { name: 'trading-lighter', desc: 'Lighter DEX perpetuals on Arbitrum (50x)', status: 'active' },
    ],
  },
  {
    name: 'Strategies & Signals',
    icon: <TrendingUp className="w-5 h-5 text-green-500" />,
    color: 'green',
    skills: [
      { name: 'momentum', desc: 'Trend-following strategy using price momentum and volume confirmation', status: 'active' },
      { name: 'mean-reversion', desc: 'Trade oversold/overbought assets back to fair value', status: 'active' },
      { name: 'penny-clipper', desc: 'Scalp small profits on tight spreads in liquid markets', status: 'active' },
      { name: 'expiry-fade', desc: 'Fade prediction market prices as expiry approaches', status: 'active' },
      { name: 'dca-bot', desc: 'Dollar-cost averaging bot with configurable intervals and sizing', status: 'active' },
      { name: 'market-making', desc: 'Provide liquidity with bid/ask spreads, earn the spread', status: 'active' },
      { name: 'hft-divergence', desc: 'High-frequency trading based on price divergence signals', status: 'active' },
      { name: 'whale-tracking', desc: 'Monitor and mirror large wallet/whale transactions', status: 'active' },
      { name: 'copy-trading', desc: 'Automatically copy trades from specified successful wallets', status: 'active' },
      { name: 'smart-routing', desc: 'Route orders across venues for best price/liquidity/fees', status: 'active' },
      { name: 'ml-signals', desc: 'ML pipeline: feature engineering → training → signal generation', status: 'active' },
      { name: 'crypto-momentum', desc: 'Multi-timeframe crypto momentum (RSI, MACD, EMA, Volume)', status: 'active', source: 'studex' },
      { name: 'jse-value-vcp', desc: 'JSE value screening + Minervini VCP breakout patterns', status: 'active', source: 'studex' },
      { name: 'pair-trading', desc: 'Statistical arbitrage via cointegration and z-score mean reversion', status: 'active', source: 'studex' },
      { name: 'sentiment-swarm', desc: 'MiroFish-inspired 50-agent sentiment consensus analysis', status: 'active', source: 'studex' },
    ],
  },
  {
    name: 'Arbitrage & Alpha',
    icon: <GitBranch className="w-5 h-5 text-purple-500" />,
    color: 'purple',
    skills: [
      { name: 'arbitrage-internal', desc: 'Detect price discrepancies within a single platform', status: 'active' },
      { name: 'arbitrage-cross', desc: 'Cross-platform arbitrage (e.g., Polymarket vs Kalshi)', status: 'active' },
      { name: 'arbitrage-combinatorial', desc: 'Multi-leg arbitrage across correlated prediction markets', status: 'active' },
      { name: 'arbitrage-semantic', desc: 'Find equivalent questions across platforms via NLP matching', status: 'active' },
      { name: 'arbitrage-liquidity', desc: 'Score opportunities by available liquidity and execution cost', status: 'active' },
      { name: 'token-sniper', desc: 'Detect and trade new token launches on Pump.fun, Bags.fm', status: 'active' },
      { name: 'token-security', desc: 'GoPlus-powered audits: honeypot, rug-pull, holder analysis', status: 'active' },
    ],
  },
  {
    name: 'Risk Management',
    icon: <Shield className="w-5 h-5 text-red-500" />,
    color: 'red',
    skills: [
      { name: 'risk-engine', desc: '10-step pre-trade validation: kill switch → circuit breaker → VaR → Kelly', status: 'active' },
      { name: 'var-cvar', desc: 'Value at Risk and Conditional VaR calculations', status: 'active' },
      { name: 'volatility-regime', desc: 'Detect low/medium/high volatility regimes, adjust sizing', status: 'active' },
      { name: 'stress-test', desc: 'Run portfolio stress tests against historical scenarios', status: 'active' },
      { name: 'circuit-breaker', desc: 'Auto-halt trading on error rate spikes or loss cascades', status: 'active' },
      { name: 'kelly-sizing', desc: 'Kelly Criterion position sizing with fractional safety', status: 'active' },
      { name: 'kill-switch', desc: 'Emergency stop: close all positions, cancel all orders', status: 'active' },
      { name: 'exposure-coach', desc: 'Dynamic exposure limits based on regime and RALF feedback', status: 'active', source: 'studex' },
      { name: 'ralf-feedback', desc: 'Self-improving feedback loop: reason → act → learn → feedback', status: 'active', source: 'studex' },
    ],
  },
  {
    name: 'AI & Analysis',
    icon: <Brain className="w-5 h-5 text-pink-500" />,
    color: 'pink',
    skills: [
      { name: 'regime-detection', desc: 'Macro regime classification: broadening, contraction, inflationary, etc.', status: 'active', source: 'studex' },
      { name: 'breadth-analysis', desc: 'Market health scoring (0-100) across sectors and participation', status: 'active', source: 'studex' },
      { name: 'rag-retrieve', desc: 'Retrieve past trades, strategy docs, and learnings from RAG store', status: 'active', source: 'studex' },
      { name: 'llm-analyst', desc: 'Ollama-powered trade validation and daily briefings', status: 'active', source: 'studex' },
      { name: 'news-sentiment', desc: 'Quick headline sentiment screening via Ollama', status: 'active', source: 'studex' },
      { name: 'memory-store', desc: 'Persistent per-user facts, preferences, and context via LanceDB', status: 'active' },
      { name: 'embeddings', desc: 'Local MiniLM-L6-v2 or nomic-embed-text for semantic search', status: 'active' },
      { name: 'context-compact', desc: 'Summarize old messages, keep last 20 full for context window', status: 'active' },
      { name: 'backtest', desc: 'Strategy backtesting with historical data, SL/TP, P&L analysis', status: 'active' },
      { name: 'trade-ledger', desc: 'SHA-256 hashed audit trail, optional on-chain anchoring', status: 'active' },
    ],
  },
  {
    name: 'DeFi & Blockchain',
    icon: <Coins className="w-5 h-5 text-orange-500" />,
    color: 'orange',
    skills: [
      { name: 'jupiter-swap', desc: 'Best-price token swaps on Solana via Jupiter aggregator', status: 'active' },
      { name: 'raydium-pool', desc: 'Provide liquidity on Raydium concentrated pools', status: 'active' },
      { name: 'orca-whirlpool', desc: 'Orca Whirlpool concentrated liquidity positions', status: 'active' },
      { name: 'meteora-dlmm', desc: 'Meteora dynamic liquidity market making', status: 'active' },
      { name: 'kamino-lend', desc: 'Kamino/MarginFi/Solend lending and borrowing', status: 'active' },
      { name: 'token-launch', desc: 'Launch Solana tokens via Meteora DBC (90/10 split, anti-snipe)', status: 'active' },
      { name: 'wormhole-bridge', desc: 'Cross-chain token transfers via Wormhole', status: 'active' },
      { name: 'bittensor-mine', desc: 'TAO subnet mining with wallet management and earnings tracking', status: 'active' },
      { name: 'uniswap-v3', desc: 'Uniswap V3 swaps and LP positions on ETH/ARB/OP/Base', status: 'active' },
      { name: 'oneinch-swap', desc: '1inch aggregator for best DEX routing across EVM chains', status: 'active' },
    ],
  },
  {
    name: 'Data & Feeds',
    icon: <Radio className="w-5 h-5 text-blue-500" />,
    color: 'blue',
    skills: [
      { name: 'feed-polymarket', desc: 'Real-time Polymarket CLOB data, orderbooks, trades', status: 'active' },
      { name: 'feed-kalshi', desc: 'Kalshi WebSocket streaming for event contracts', status: 'active' },
      { name: 'feed-manifold', desc: 'Manifold Markets community prediction data', status: 'active' },
      { name: 'feed-metaculus', desc: 'Metaculus forecasting platform data', status: 'active' },
      { name: 'feed-betfair', desc: 'Betfair exchange odds and market data', status: 'active' },
      { name: 'feed-news', desc: 'Aggregated news feeds for market-moving events', status: 'active' },
      { name: 'feed-luno', desc: 'LUNO ZAR crypto pairs (BTC, ETH, XRP, SOL)', status: 'active', source: 'studex' },
      { name: 'feed-jse', desc: 'JSE Top 40 stock data via Yahoo Finance', status: 'active', source: 'studex' },
      { name: 'feed-sarb', desc: 'SARB rate decisions and SA economic calendar', status: 'active', source: 'studex' },
    ],
  },
  {
    name: 'Infrastructure & Tools',
    icon: <Bot className="w-5 h-5 text-gray-500" />,
    color: 'gray',
    skills: [
      { name: 'browser', desc: 'Headless browser for web scraping and screenshot capture', status: 'active' },
      { name: 'docker', desc: 'Run containerized environments for isolated execution', status: 'active' },
      { name: 'exec', desc: 'Execute shell commands in sandboxed environment', status: 'active' },
      { name: 'files', desc: 'Read, write, and manage local files', status: 'active' },
      { name: 'git', desc: 'Git operations (clone, commit, push, PR)', status: 'active' },
      { name: 'email-sms', desc: 'Send email and SMS notifications', status: 'active' },
      { name: 'webhooks', desc: 'Incoming and outgoing webhook management', status: 'active' },
      { name: 'sql', desc: 'Direct SQL queries against SQLite/PostgreSQL', status: 'active' },
      { name: 'vision', desc: 'Image analysis and chart reading via multimodal AI', status: 'active' },
      { name: 'mcp-server', desc: 'Expose all 119 skills as MCP tools for Claude Desktop/Code', status: 'active' },
      { name: 'x402-payments', desc: 'Machine-to-machine USDC payments on Base and Solana', status: 'active' },
      { name: 'agent-forum', desc: 'AI agent discussion forum for market insights', status: 'active' },
      { name: 'agent-marketplace', desc: 'Buy/sell strategies, APIs, datasets with USDC escrow', status: 'active' },
    ],
  },
];

export default function SkillsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const totalSkills = SKILL_CATEGORIES.reduce((sum, cat) => sum + cat.skills.length, 0);
  const studexSkills = SKILL_CATEGORIES.reduce(
    (sum, cat) => sum + cat.skills.filter(s => s.source === 'studex').length, 0
  );

  const filteredCategories = SKILL_CATEGORIES
    .filter(cat => !selectedCategory || cat.name === selectedCategory)
    .map(cat => ({
      ...cat,
      skills: cat.skills.filter(
        s => !search || s.name.includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(cat => cat.skills.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <a href="/trading" className="p-2 hover:bg-gray-200 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trading Skills</h1>
              <p className="text-gray-500 text-sm">
                {totalSkills} total skills ({studexSkills} Studex + {totalSkills - studexSkills} CloddsBot)
              </p>
            </div>
          </div>
        </div>

        {/* Search + Category Filter */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-white"
            />
          </div>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="">All Categories</option>
            {SKILL_CATEGORIES.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name} ({cat.skills.length})</option>
            ))}
          </select>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 p-6 mb-6">
          <h2 className="font-semibold text-purple-900 mb-2">How Skills Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-800">
            <div>
              <span className="font-medium">CloddsBot Skills</span> — 119 built-in capabilities from the agent (trading, DeFi, arbitrage, risk). These are lazy-loaded TypeScript modules.
            </div>
            <div>
              <span className="font-medium">Studex Skills</span> — Our custom SA-market skills (JSE, LUNO, SARB, sentiment swarm, RALF loop). These are Python modules fed to CloddsBot.
            </div>
            <div>
              <span className="font-medium">Skill Selection</span> — CloddsBot auto-selects the best skills based on market conditions, regime, and RALF feedback. Only ~20 tools are active per analysis to save tokens.
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="space-y-8">
          {filteredCategories.map((cat) => (
            <div key={cat.name}>
              <div className="flex items-center gap-2 mb-3">
                {cat.icon}
                <h2 className="text-lg font-semibold">{cat.name}</h2>
                <span className="text-sm text-gray-400">({cat.skills.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <code className="text-sm font-mono font-medium text-gray-900">{skill.name}</code>
                      {skill.source === 'studex' && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">STUDEX</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{skill.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
