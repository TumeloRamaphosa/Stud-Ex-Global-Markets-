'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Brain, BarChart3, TrendingUp, Clock, Target } from 'lucide-react';

interface TradeStats {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_pnl: number;
  avg_win: number;
  avg_loss: number;
  best_trade: number;
  worst_trade: number;
  avg_hold_hours: number;
  strategies?: string[];
}

interface RALFFeedback {
  strategy: string;
  health: string;
  win_rate: number;
  profit_factor: number;
  trade_count: number;
  adjustments: Array<{ type: string; suggestion: string; reason: string }>;
  regime_performance: Record<string, { trades: number; wins: number; total_pnl: number }>;
  timestamp: string;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [ralfData, setRalfData] = useState<RALFFeedback[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ralfRes] = await Promise.all([
          fetch('/api/trading/trades?stats=true'),
          fetch('/api/trading/ralf'),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (ralfRes.ok) setRalfData(await ralfRes.json());
      } catch { /* no data */ }
    };
    fetchData();
  }, []);

  const formatZAR = (amount: number) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <a href="/trading" className="p-2 hover:bg-gray-200 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trading Analytics</h1>
            <p className="text-gray-500 text-sm">Performance metrics and RALF intelligence</p>
          </div>
        </div>

        {/* Overall Stats */}
        {stats && stats.total_trades > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              <StatBox label="Total Trades" value={String(stats.total_trades)} icon={<BarChart3 className="w-4 h-4" />} />
              <StatBox label="Win Rate" value={`${stats.win_rate.toFixed(1)}%`} icon={<Target className="w-4 h-4" />}
                color={stats.win_rate > 50 ? 'green' : 'red'} />
              <StatBox label="Total P&L" value={formatZAR(stats.total_pnl)} icon={<TrendingUp className="w-4 h-4" />}
                color={stats.total_pnl > 0 ? 'green' : 'red'} />
              <StatBox label="Avg Win" value={formatZAR(stats.avg_win)} icon={<TrendingUp className="w-4 h-4" />} color="green" />
              <StatBox label="Avg Loss" value={formatZAR(stats.avg_loss)} icon={<TrendingUp className="w-4 h-4" />} color="red" />
              <StatBox label="Avg Hold" value={`${stats.avg_hold_hours.toFixed(1)}h`} icon={<Clock className="w-4 h-4" />} />
            </div>

            {/* Win/Loss Ratio Visual */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
              <h2 className="font-semibold mb-4">Win/Loss Distribution</h2>
              <div className="flex h-8 rounded-lg overflow-hidden">
                <div
                  className="bg-green-500 flex items-center justify-center text-white text-xs font-bold"
                  style={{ width: `${stats.win_rate}%` }}
                >
                  {stats.winning_trades}W
                </div>
                <div
                  className="bg-red-500 flex items-center justify-center text-white text-xs font-bold"
                  style={{ width: `${100 - stats.win_rate}%` }}
                >
                  {stats.losing_trades}L
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>Best: {formatZAR(stats.best_trade)}</span>
                <span>Worst: {formatZAR(stats.worst_trade)}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center mb-8">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No Analytics Yet</h3>
            <p className="text-gray-400 mt-2">Trade data will populate these charts once the bot starts trading.</p>
          </div>
        )}

        {/* RALF Intelligence */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            RALF Self-Learning Intelligence
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            The RALF (Reason-Act-Learn-Feedback) loop analyzes every trade to improve strategy performance.
            Feedback runs daily at 5PM SAST. Learnings are extracted weekly.
          </p>

          {ralfData.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>RALF feedback will appear here after the bot records enough trades.</p>
              <p className="text-sm mt-2">Minimum 5 trades per strategy for feedback generation.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {ralfData.map((ralf, i) => (
                <div key={i} className="border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-lg">{ralf.strategy}</h3>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ralf.health === 'HEALTHY' ? 'bg-green-100 text-green-800' :
                        ralf.health === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                        ralf.health === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {ralf.health}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold">{(ralf.win_rate * 100).toFixed(0)}%</div>
                      <div className="text-xs text-gray-500">Win Rate</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold">{ralf.profit_factor.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Profit Factor</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold">{ralf.trade_count}</div>
                      <div className="text-xs text-gray-500">Trades</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold">{ralf.adjustments?.length || 0}</div>
                      <div className="text-xs text-gray-500">Adjustments</div>
                    </div>
                  </div>

                  {/* Regime Breakdown */}
                  {ralf.regime_performance && Object.keys(ralf.regime_performance).length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-500 mb-2">Performance by Regime</div>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(ralf.regime_performance).map(([regime, perf]) => (
                          <div key={regime} className="bg-gray-50 p-2 rounded text-xs">
                            <div className="font-medium capitalize">{regime}</div>
                            <div>WR: {perf.trades > 0 ? ((perf.wins / perf.trades) * 100).toFixed(0) : 0}% ({perf.trades} trades)</div>
                            <div className={perf.total_pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatZAR(perf.total_pnl)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Adjustments */}
                  {ralf.adjustments && ralf.adjustments.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-2">Recommended Adjustments</div>
                      <div className="space-y-2">
                        {ralf.adjustments.map((adj, j) => (
                          <div key={j} className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg">
                            <div className="font-medium text-sm text-yellow-900">{adj.suggestion}</div>
                            <div className="text-xs text-yellow-700 mt-1">{adj.reason}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon, color }: {
  label: string; value: string; icon: React.ReactNode; color?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">{icon}{label}</div>
      <div className={`text-lg font-bold ${
        color === 'green' ? 'text-green-600' : color === 'red' ? 'text-red-600' : 'text-gray-900'
      }`}>{value}</div>
    </div>
  );
}
