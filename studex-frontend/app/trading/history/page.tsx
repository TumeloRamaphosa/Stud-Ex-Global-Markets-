'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Filter } from 'lucide-react';

interface Trade {
  id: string;
  symbol: string;
  strategy: string;
  direction: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  pnl: number;
  pnl_pct: number;
  outcome: string;
  hold_duration_hours: number;
  entry_time: string;
  exit_time: string;
  exchange: string;
}

export default function TradeHistoryPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filter, setFilter] = useState('all');
  const [strategyFilter, setStrategyFilter] = useState('all');

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await fetch('/api/trading/trades?limit=200');
        if (res.ok) setTrades(await res.json());
      } catch { /* no data yet */ }
    };
    fetchTrades();
  }, []);

  const filteredTrades = trades.filter(t => {
    if (filter === 'wins' && (t.pnl || 0) <= 0) return false;
    if (filter === 'losses' && (t.pnl || 0) > 0) return false;
    if (strategyFilter !== 'all' && t.strategy !== strategyFilter) return false;
    return true;
  });

  const strategies = [...new Set(trades.map(t => t.strategy))];

  const formatZAR = (amount: number) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <a href="/trading" className="p-2 hover:bg-gray-200 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trade History</h1>
              <p className="text-gray-500 text-sm">{filteredTrades.length} trades</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="all">All Trades</option>
              <option value="wins">Wins Only</option>
              <option value="losses">Losses Only</option>
            </select>

            <select
              value={strategyFilter}
              onChange={(e) => setStrategyFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="all">All Strategies</option>
              {strategies.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {filteredTrades.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No Trades Yet</h3>
            <p className="text-gray-400 mt-2">
              Completed trades will appear here with full RALF analysis.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Symbol</th>
                  <th className="px-4 py-3 text-left">Strategy</th>
                  <th className="px-4 py-3 text-center">Direction</th>
                  <th className="px-4 py-3 text-right">Entry</th>
                  <th className="px-4 py-3 text-right">Exit</th>
                  <th className="px-4 py-3 text-right">P&L</th>
                  <th className="px-4 py-3 text-right">P&L %</th>
                  <th className="px-4 py-3 text-center">Outcome</th>
                  <th className="px-4 py-3 text-right">Hold</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTrades.map((trade, i) => (
                  <tr key={trade.id || i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {trade.entry_time ? new Date(trade.entry_time).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium">{trade.symbol}</td>
                    <td className="px-4 py-3 text-gray-500">{trade.strategy}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        trade.direction === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.direction?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{formatZAR(trade.entry_price)}</td>
                    <td className="px-4 py-3 text-right font-mono">{trade.exit_price ? formatZAR(trade.exit_price) : '—'}</td>
                    <td className={`px-4 py-3 text-right font-mono font-bold ${
                      (trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trade.pnl != null ? formatZAR(trade.pnl) : '—'}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono ${
                      (trade.pnl_pct || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trade.pnl_pct != null ? `${trade.pnl_pct >= 0 ? '+' : ''}${trade.pnl_pct.toFixed(2)}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        trade.outcome === 'true_positive' ? 'bg-green-100 text-green-800' :
                        trade.outcome === 'false_positive' ? 'bg-red-100 text-red-800' :
                        trade.outcome === 'stopped_out' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {trade.outcome?.replace('_', ' ') || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {trade.hold_duration_hours ? `${trade.hold_duration_hours.toFixed(1)}h` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
