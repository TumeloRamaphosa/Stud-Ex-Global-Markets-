'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Brain, Clock, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';

interface MemoryEntry {
  id: string;
  timestamp: string;
  type: 'trade' | 'signal' | 'ralf' | 'regime' | 'learning' | 'alert' | 'briefing';
  title: string;
  detail: string;
  metadata?: Record<string, any>;
}

// Simulated daily memory log — in production, fetched from /api/trading/memory
const DEMO_ENTRIES: MemoryEntry[] = [
  { id: '1', timestamp: '2026-04-04T06:00:00', type: 'briefing', title: 'Morning Briefing Generated', detail: 'Regime: BROADENING. JSE pre-market positive. BTC holding R1.2M support. SARB rate decision next week — watch bank stocks.' },
  { id: '2', timestamp: '2026-04-04T06:30:00', type: 'regime', title: 'Regime Detection: BROADENING', detail: 'Breadth score: 72/100. Sector participation: 8/11 sectors positive. Exposure recommendation: 70-80%.' },
  { id: '3', timestamp: '2026-04-04T07:15:00', type: 'signal', title: 'Signal: BUY BTC/ZAR', detail: 'Strategy: crypto_momentum. Confidence: 0.78. RSI(14)=42, MACD bullish crossover, volume 1.8x avg. All 3 timeframes aligned.' },
  { id: '4', timestamp: '2026-04-04T07:16:00', type: 'trade', title: 'Trade Opened: BUY BTC/ZAR', detail: 'Entry: R1,205,000. Size: 0.0042 BTC (R5,061). Stop: R1,178,900 (2 ATR). TP: R1,257,200 (4 ATR). Via LUNO.' },
  { id: '5', timestamp: '2026-04-04T09:00:00', type: 'signal', title: 'Signal: BUY NPN (Naspers)', detail: 'Strategy: jse_value_momentum. VCP breakout detected. P/E=18.2, Div Yield=2.1%. Above 200 MA. Confidence: 0.72.' },
  { id: '6', timestamp: '2026-04-04T09:01:00', type: 'alert', title: 'Risk Check: NPN position approved', detail: 'Portfolio exposure: 45%. JSE allocation: 15%. Cash reserve: 32%. All limits within bounds.' },
  { id: '7', timestamp: '2026-04-04T12:00:00', type: 'learning', title: 'RAG Retrieved: Similar NPN trade', detail: 'Found 2 similar NPN trades in broadening regime. Historical win rate: 67%. Avg hold: 8.2 days. Avg return: +4.3%.' },
  { id: '8', timestamp: '2026-04-04T14:30:00', type: 'trade', title: 'Trade Closed: BTC/ZAR — Take Profit', detail: 'Exit: R1,257,200. PnL: +R218.60 (+4.32%). Hold: 7.25 hours. Outcome: TRUE_POSITIVE. RALF recorded.' },
  { id: '9', timestamp: '2026-04-04T17:00:00', type: 'ralf', title: 'RALF Daily Feedback — crypto_momentum', detail: 'Health: HEALTHY. Win rate: 62% (7d). Profit factor: 1.85. No adjustments needed. Best entry hour: 7AM SAST.' },
  { id: '10', timestamp: '2026-04-04T17:05:00', type: 'ralf', title: 'RALF Daily Feedback — jse_value_momentum', detail: 'Health: WARNING. Win rate dropped to 42% (7d). Suggestion: increase confidence threshold from 0.5 to 0.65.' },
  { id: '11', timestamp: '2026-04-04T22:00:00', type: 'signal', title: 'Crypto Night Scan Complete', detail: 'Scanned 5 pairs. ETH/USDT showing bullish divergence on 4h. SOL/USDT in range. No new entries recommended (regime transitioning).' },
];

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  trade: { icon: <TrendingUp className="w-4 h-4" />, color: 'bg-green-100 text-green-800', label: 'Trade' },
  signal: { icon: <TrendingDown className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800', label: 'Signal' },
  ralf: { icon: <Brain className="w-4 h-4" />, color: 'bg-purple-100 text-purple-800', label: 'RALF' },
  regime: { icon: <BarChart className="w-4 h-4" />, color: 'bg-orange-100 text-orange-800', label: 'Regime' },
  learning: { icon: <BookOpen className="w-4 h-4" />, color: 'bg-indigo-100 text-indigo-800', label: 'RAG' },
  alert: { icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800', label: 'Alert' },
  briefing: { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-teal-100 text-teal-800', label: 'Briefing' },
};

function BarChart(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
}

export default function MemoryPage() {
  const [entries, setEntries] = useState<MemoryEntry[]>(DEMO_ENTRIES);
  const [filter, setFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const filtered = entries.filter(e => filter === 'all' || e.type === filter);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <a href="/trading" className="p-2 hover:bg-gray-200 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bot Memory Log</h1>
              <p className="text-gray-500 text-sm">Daily record of everything the bot thinks, decides, and learns</p>
            </div>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          />
        </div>

        {/* How Memory Works */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5 mb-6">
          <h2 className="font-semibold text-indigo-900 mb-2">How Bot Memory Works</h2>
          <div className="text-sm text-indigo-800 space-y-1">
            <p><strong>Every action is logged:</strong> signals generated, trades executed, risk checks, RALF feedback, regime changes, RAG retrievals.</p>
            <p><strong>Memory persists:</strong> SQLite (local) + LanceDB (semantic search) + Vercel Postgres (cloud). The bot remembers every trade it ever made.</p>
            <p><strong>Memory improves decisions:</strong> RAG retrieves similar past trades before new entries. RALF uses history to adjust strategy parameters.</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'trade', 'signal', 'ralf', 'regime', 'learning', 'alert', 'briefing'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === type
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {type === 'all' ? 'All' : TYPE_CONFIG[type]?.label || type}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />

          <div className="space-y-4">
            {filtered.map((entry) => {
              const config = TYPE_CONFIG[entry.type] || TYPE_CONFIG.alert;
              const time = new Date(entry.timestamp).toLocaleTimeString('en-ZA', {
                hour: '2-digit', minute: '2-digit',
              });

              return (
                <div key={entry.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 border-white ${config.color}`}>
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white rounded-lg border p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                        <h3 className="font-medium text-sm">{entry.title}</h3>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{entry.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{entries.filter(e => e.type === 'trade').length}</div>
            <div className="text-xs text-gray-500">Trades Today</div>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{entries.filter(e => e.type === 'signal').length}</div>
            <div className="text-xs text-gray-500">Signals Generated</div>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{entries.filter(e => e.type === 'ralf').length}</div>
            <div className="text-xs text-gray-500">RALF Feedback</div>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{entries.filter(e => e.type === 'learning').length}</div>
            <div className="text-xs text-gray-500">RAG Retrievals</div>
          </div>
        </div>
      </div>
    </div>
  );
}
