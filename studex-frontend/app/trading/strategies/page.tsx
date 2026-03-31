'use client';

import { useState } from 'react';
import { ArrowLeft, Zap, TrendingUp, GitBranch, Brain, BarChart2 } from 'lucide-react';

interface Strategy {
  name: string;
  displayName: string;
  description: string;
  markets: string[];
  icon: React.ReactNode;
  features: string[];
  status: 'active' | 'paper' | 'disabled';
  methodology: string;
}

const STRATEGIES: Strategy[] = [
  {
    name: 'crypto_momentum',
    displayName: 'Crypto Momentum',
    description: 'Multi-timeframe trend following with volume confirmation for crypto pairs.',
    markets: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BTC/ZAR'],
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    features: [
      'Triple timeframe alignment (1h, 4h, 1d)',
      'RSI + MACD + ADX + Volume confirmation',
      'ATR-based stop loss (2x) and take profit (4x)',
      'Max 5% per position',
    ],
    status: 'paper',
    methodology: 'Claude Trading Skills — CANSLIM adapted for crypto',
  },
  {
    name: 'jse_value_momentum',
    displayName: 'JSE Value + VCP',
    description: 'Value screening combined with Minervini VCP breakout entry for JSE stocks.',
    markets: ['NPN', 'ANG', 'SOL', 'SBK', 'FSR', 'MTN', 'SHP'],
    icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
    features: [
      'P/E <= 20, Div Yield >= 2%, ROE >= 15%',
      'Volatility Contraction Pattern detection',
      'Above 200-day MA requirement',
      '7% stop loss, 15% trailing stop',
    ],
    status: 'paper',
    methodology: 'Claude Trading Skills — VCP + Value Dividend',
  },
  {
    name: 'pair_trading',
    displayName: 'Pair Trading',
    description: 'Statistical arbitrage on cointegrated pairs using z-score mean reversion.',
    markets: ['BTC/ETH', 'NPN/MTN', 'ANG/GFI'],
    icon: <GitBranch className="w-6 h-6 text-purple-500" />,
    features: [
      'Cointegration testing (Engle-Granger)',
      'Z-score entry at 2.0, exit at 0.5',
      'Market-neutral positioning',
      'Hedge ratio calculation via OLS',
    ],
    status: 'paper',
    methodology: 'Claude Trading Skills — Pair Trade Screener',
  },
  {
    name: 'sentiment_swarm',
    displayName: 'Sentiment Swarm',
    description: 'MiroFish-inspired multi-agent consensus with 50 AI trading personalities.',
    markets: ['All markets'],
    icon: <Brain className="w-6 h-6 text-pink-500" />,
    features: [
      '50 agents with 10 archetypes (momentum, value, macro, etc.)',
      'Consensus threshold: 70% agreement',
      'Contrarian signal detection at >85%',
      'Runs on local Ollama (GPU)',
    ],
    status: 'paper',
    methodology: 'MiroFish swarm intelligence + Ollama LLM',
  },
];

export default function StrategiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <a href="/trading" className="p-2 hover:bg-gray-200 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trading Strategies</h1>
            <p className="text-gray-500 text-sm">Configure and monitor strategy performance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {STRATEGIES.map((strategy) => (
            <div key={strategy.name} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">{strategy.icon}</div>
                  <div>
                    <h3 className="font-semibold text-lg">{strategy.displayName}</h3>
                    <p className="text-xs text-gray-400">{strategy.methodology}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  strategy.status === 'active' ? 'bg-green-100 text-green-800' :
                  strategy.status === 'paper' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {strategy.status.toUpperCase()}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">{strategy.description}</p>

              <div className="mb-4">
                <div className="text-xs text-gray-400 uppercase mb-2">Markets</div>
                <div className="flex flex-wrap gap-1">
                  {strategy.markets.map(m => (
                    <span key={m} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">{m}</span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 uppercase mb-2">Rules</div>
                <ul className="space-y-1">
                  {strategy.features.map((f, i) => (
                    <li key={i} className="text-sm text-gray-500 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
