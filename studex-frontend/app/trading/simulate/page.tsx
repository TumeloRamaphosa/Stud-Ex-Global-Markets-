'use client';

import { useState } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Settings, Zap } from 'lucide-react';

interface SimConfig {
  strategy: string;
  symbol: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  timeSpeed: number;
}

interface SimResult {
  totalTrades: number;
  winRate: number;
  totalPnl: number;
  maxDrawdown: number;
  sharpeRatio: number;
  bestTrade: number;
  worstTrade: number;
  avgHoldHours: number;
}

export default function SimulatePage() {
  const [config, setConfig] = useState<SimConfig>({
    strategy: 'crypto_momentum',
    symbol: 'BTC/USDT',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    initialCapital: 100000,
    timeSpeed: 10,
  });
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SimResult | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);

    // Simulate progress (in production, calls the Python backtest API)
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(r => setTimeout(r, 50));
      setProgress(i);
    }

    // Simulated result
    setResult({
      totalTrades: 127,
      winRate: 58.3,
      totalPnl: 14230,
      maxDrawdown: 8.7,
      sharpeRatio: 1.42,
      bestTrade: 3200,
      worstTrade: -1850,
      avgHoldHours: 6.2,
    });
    setRunning(false);
  };

  const formatZAR = (n: number) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <a href="/trading" className="p-2 hover:bg-gray-200 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Simulation Sandbox</h1>
            <p className="text-gray-500 text-sm">Backtest strategies with historical data — no real money</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config Panel */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Strategy</label>
                <select value={config.strategy} onChange={e => setConfig({...config, strategy: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="crypto_momentum">Crypto Momentum</option>
                  <option value="jse_value_momentum">JSE Value + VCP</option>
                  <option value="pair_trading">Pair Trading</option>
                  <option value="sentiment_swarm">Sentiment Swarm</option>
                  <option value="cloddsbot_auto">CloddsBot Auto (119 skills)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1">Symbol</label>
                <select value={config.symbol} onChange={e => setConfig({...config, symbol: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm">
                  <optgroup label="Crypto">
                    <option value="BTC/USDT">BTC/USDT</option>
                    <option value="ETH/USDT">ETH/USDT</option>
                    <option value="SOL/USDT">SOL/USDT</option>
                    <option value="XBTZAR">BTC/ZAR (LUNO)</option>
                  </optgroup>
                  <optgroup label="JSE">
                    <option value="NPN">NPN (Naspers)</option>
                    <option value="ANG">ANG (AngloGold)</option>
                    <option value="SBK">SBK (Standard Bank)</option>
                    <option value="MTN">MTN Group</option>
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Start Date</label>
                  <input type="date" value={config.startDate}
                    onChange={e => setConfig({...config, startDate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">End Date</label>
                  <input type="date" value={config.endDate}
                    onChange={e => setConfig({...config, endDate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1">Initial Capital (ZAR)</label>
                <input type="number" value={config.initialCapital}
                  onChange={e => setConfig({...config, initialCapital: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>

              <button
                onClick={handleRun}
                disabled={running}
                className={`w-full py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 ${
                  running ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {running ? <><Pause className="w-4 h-4" /> Running...</> : <><Play className="w-4 h-4" /> Run Simulation</>}
              </button>

              {running && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{width: `${progress}%`}} />
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {result ? (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border p-6">
                  <h2 className="font-semibold mb-4">Simulation Results</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ResultBox label="Total P&L" value={formatZAR(result.totalPnl)} color={result.totalPnl > 0 ? 'green' : 'red'} />
                    <ResultBox label="Win Rate" value={`${result.winRate}%`} color={result.winRate > 50 ? 'green' : 'red'} />
                    <ResultBox label="Trades" value={String(result.totalTrades)} />
                    <ResultBox label="Sharpe" value={result.sharpeRatio.toFixed(2)} color={result.sharpeRatio > 1 ? 'green' : 'yellow'} />
                    <ResultBox label="Max Drawdown" value={`${result.maxDrawdown}%`} color={result.maxDrawdown < 10 ? 'green' : 'red'} />
                    <ResultBox label="Best Trade" value={formatZAR(result.bestTrade)} color="green" />
                    <ResultBox label="Worst Trade" value={formatZAR(result.worstTrade)} color="red" />
                    <ResultBox label="Avg Hold" value={`${result.avgHoldHours}h`} />
                  </div>
                </div>

                <div className="bg-white rounded-xl border p-6">
                  <h2 className="font-semibold mb-3">What This Means</h2>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <Zap className="w-4 h-4 inline text-yellow-500" /> With <strong>{formatZAR(config.initialCapital)}</strong> starting capital,
                      the <strong>{config.strategy}</strong> strategy on <strong>{config.symbol}</strong> would have
                      returned <strong className={result.totalPnl > 0 ? 'text-green-600' : 'text-red-600'}>{formatZAR(result.totalPnl)}</strong> ({((result.totalPnl / config.initialCapital) * 100).toFixed(1)}%) over the test period.
                    </p>
                    <p>The RALF loop would have detected any declining win rates and auto-adjusted parameters mid-run.</p>
                    <p>Run multiple strategies to compare, then activate the best performer in live paper trading.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border p-12 text-center">
                <RotateCcw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600">No Simulation Run Yet</h3>
                <p className="text-gray-400 mt-2">Configure a strategy and click Run Simulation to backtest with historical data.</p>
                <p className="text-gray-400 text-sm mt-1">No real money involved — this is a safe sandbox.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultBox({ label, value, color }: { label: string; value: string; color?: string }) {
  const colorClass = color === 'green' ? 'text-green-600' : color === 'red' ? 'text-red-600' : color === 'yellow' ? 'text-yellow-600' : 'text-gray-900';
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <div className={`text-lg font-bold ${colorClass}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
