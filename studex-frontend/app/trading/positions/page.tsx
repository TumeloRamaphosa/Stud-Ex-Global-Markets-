'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';

interface Position {
  symbol: string;
  side: string;
  quantity: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  pnl_pct: number;
  exchange: string;
  strategy: string;
  asset_class: string;
  stop_loss: number | null;
  take_profit: number | null;
  opened_at: string;
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    // In production, fetch from /api/trading/positions
    // For now, this polls the desktop bot's API directly
    const fetchPositions = async () => {
      try {
        const portfolio = await fetch('/api/trading/portfolio?latest=true');
        if (portfolio.ok) {
          const data = await portfolio.json();
          // Positions will be pushed as part of portfolio snapshots
        }
      } catch { /* bot not connected */ }
    };

    fetchPositions();
    const interval = setInterval(fetchPositions, 5000);
    return () => clearInterval(interval);
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
            <h1 className="text-2xl font-bold text-gray-900">Open Positions</h1>
            <p className="text-gray-500 text-sm">{positions.length} active positions</p>
          </div>
        </div>

        {positions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No Open Positions</h3>
            <p className="text-gray-400 mt-2">
              Positions will appear here once the trading bot opens trades.
              Make sure the bot is running on your desktop.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 text-sm text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Symbol</th>
                  <th className="px-6 py-3 text-left">Side</th>
                  <th className="px-6 py-3 text-right">Qty</th>
                  <th className="px-6 py-3 text-right">Entry</th>
                  <th className="px-6 py-3 text-right">Current</th>
                  <th className="px-6 py-3 text-right">P&L</th>
                  <th className="px-6 py-3 text-right">P&L %</th>
                  <th className="px-6 py-3 text-left">Strategy</th>
                  <th className="px-6 py-3 text-left">Exchange</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {positions.map((pos, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{pos.symbol}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        pos.side === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {pos.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm">{pos.quantity.toFixed(6)}</td>
                    <td className="px-6 py-4 text-right font-mono text-sm">{formatZAR(pos.entry_price)}</td>
                    <td className="px-6 py-4 text-right font-mono text-sm">{formatZAR(pos.current_price)}</td>
                    <td className={`px-6 py-4 text-right font-mono text-sm font-bold ${
                      pos.unrealized_pnl >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatZAR(pos.unrealized_pnl)}
                    </td>
                    <td className={`px-6 py-4 text-right font-mono text-sm ${
                      pos.pnl_pct >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {pos.pnl_pct >= 0 ? '+' : ''}{pos.pnl_pct.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{pos.strategy}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{pos.exchange}</td>
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
