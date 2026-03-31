'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign, TrendingUp, BarChart3, Brain, Zap, AlertTriangle } from 'lucide-react';

interface PortfolioData {
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

interface Signal {
  strategy: string;
  symbol: string;
  signal_type: string;
  confidence: number;
  timestamp: string;
}

interface RALFFeedback {
  strategy: string;
  health: string;
  win_rate: number;
  profit_factor: number;
  trade_count: number;
  adjustments: Array<{ type: string; suggestion: string; reason: string }>;
}

const REGIME_COLORS: Record<string, string> = {
  broadening: 'bg-green-100 text-green-800',
  concentration: 'bg-yellow-100 text-yellow-800',
  transitional: 'bg-orange-100 text-orange-800',
  inflationary: 'bg-red-100 text-red-800',
  contraction: 'bg-red-200 text-red-900',
};

const HEALTH_COLORS: Record<string, string> = {
  HEALTHY: 'text-green-600',
  WARNING: 'text-yellow-600',
  CRITICAL: 'text-red-600',
  EVALUATING: 'text-blue-600',
};

export default function TradingDashboard() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [ralfData, setRalfData] = useState<RALFFeedback[]>([]);
  const [tradeStats, setTradeStats] = useState<any>(null);
  const [botStatus, setBotStatus] = useState<'connected' | 'disconnected'>('disconnected');

  // Poll the API routes for data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portfolioRes, signalsRes, ralfRes, statsRes] = await Promise.all([
          fetch('/api/trading/portfolio?latest=true'),
          fetch('/api/trading/signals?limit=10'),
          fetch('/api/trading/ralf'),
          fetch('/api/trading/trades?stats=true'),
        ]);

        if (portfolioRes.ok) {
          const data = await portfolioRes.json();
          if (data) { setPortfolio(data); setBotStatus('connected'); }
        }
        if (signalsRes.ok) setSignals(await signalsRes.json());
        if (ralfRes.ok) setRalfData(await ralfRes.json());
        if (statsRes.ok) setTradeStats(await statsRes.json());
      } catch {
        setBotStatus('disconnected');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const formatZAR = (amount: number) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

  const formatPct = (pct: number) => `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trading Bot Dashboard</h1>
            <p className="text-gray-500 mt-1">Studex Global Markets — Automated Trading</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              botStatus === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                botStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
              {botStatus === 'connected' ? 'Bot Running' : 'Waiting for Data'}
            </div>
            {portfolio?.regime && (
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                REGIME_COLORS[portfolio.regime] || 'bg-gray-100 text-gray-800'
              }`}>
                {portfolio.regime.toUpperCase()} Regime
              </span>
            )}
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Equity"
            value={portfolio ? formatZAR(portfolio.total_equity) : '—'}
            icon={<DollarSign className="w-5 h-5" />}
            color="blue"
          />
          <MetricCard
            title="Daily P&L"
            value={portfolio ? formatZAR(portfolio.daily_pnl) : '—'}
            subtitle={portfolio && portfolio.total_equity > 0
              ? formatPct((portfolio.daily_pnl / portfolio.total_equity) * 100)
              : undefined}
            icon={portfolio && portfolio.daily_pnl >= 0
              ? <ArrowUpRight className="w-5 h-5" />
              : <ArrowDownRight className="w-5 h-5" />}
            color={portfolio && portfolio.daily_pnl >= 0 ? 'green' : 'red'}
          />
          <MetricCard
            title="Open Positions"
            value={portfolio ? String(portfolio.position_count) : '0'}
            subtitle={portfolio ? `${formatZAR(portfolio.unrealized_pnl)} unrealized` : undefined}
            icon={<Activity className="w-5 h-5" />}
            color="purple"
          />
          <MetricCard
            title="Max Drawdown"
            value={portfolio ? formatPct(-portfolio.max_drawdown) : '—'}
            subtitle="15% limit"
            icon={<AlertTriangle className="w-5 h-5" />}
            color={portfolio && portfolio.max_drawdown > 10 ? 'red' : 'yellow'}
          />
        </div>

        {/* Win Rate + Stats */}
        {tradeStats && tradeStats.total_trades > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <MetricCard
              title="Win Rate"
              value={`${tradeStats.win_rate?.toFixed(1)}%`}
              subtitle={`${tradeStats.total_trades} trades`}
              icon={<TrendingUp className="w-5 h-5" />}
              color={tradeStats.win_rate > 50 ? 'green' : 'yellow'}
            />
            <MetricCard
              title="Total P&L"
              value={formatZAR(tradeStats.total_pnl || 0)}
              subtitle={`Avg win: ${formatZAR(tradeStats.avg_win || 0)}`}
              icon={<BarChart3 className="w-5 h-5" />}
              color={tradeStats.total_pnl > 0 ? 'green' : 'red'}
            />
            <MetricCard
              title="Avg Hold Time"
              value={`${(tradeStats.avg_hold_hours || 0).toFixed(1)}h`}
              subtitle={`Best: ${formatZAR(tradeStats.best_trade || 0)}`}
              icon={<Zap className="w-5 h-5" />}
              color="blue"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Signals */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Recent Signals
            </h2>
            {signals.length === 0 ? (
              <p className="text-gray-400 text-sm">No signals yet. Waiting for bot to start trading...</p>
            ) : (
              <div className="space-y-3">
                {signals.map((sig, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        sig.signal_type === 'buy' ? 'bg-green-100 text-green-800' :
                        sig.signal_type === 'sell' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {sig.signal_type.toUpperCase()}
                      </span>
                      <span className="font-medium text-sm">{sig.symbol}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{sig.strategy}</div>
                      <div className="text-xs text-gray-400">
                        {(sig.confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RALF Feedback */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              RALF Self-Learning Status
            </h2>
            {ralfData.length === 0 ? (
              <p className="text-gray-400 text-sm">
                RALF feedback will appear here after enough trades are recorded.
                The bot learns from every trade.
              </p>
            ) : (
              <div className="space-y-4">
                {ralfData.slice(-3).reverse().map((ralf, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{ralf.strategy}</span>
                      <span className={`text-sm font-bold ${HEALTH_COLORS[ralf.health] || 'text-gray-600'}`}>
                        {ralf.health}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                      <div>WR: {(ralf.win_rate * 100).toFixed(0)}%</div>
                      <div>PF: {ralf.profit_factor.toFixed(2)}</div>
                      <div>{ralf.trade_count} trades</div>
                    </div>
                    {ralf.adjustments && ralf.adjustments.length > 0 && (
                      <div className="space-y-1">
                        {ralf.adjustments.slice(0, 2).map((adj, j) => (
                          <div key={j} className="text-xs bg-yellow-50 text-yellow-800 p-2 rounded">
                            <span className="font-medium">Suggestion:</span> {adj.suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <NavCard href="/trading/positions" title="Open Positions" description="View and manage live positions" />
          <NavCard href="/trading/history" title="Trade History" description="Past trades and outcomes" />
          <NavCard href="/trading/strategies" title="Strategies" description="Enable/disable and configure" />
          <NavCard href="/trading/analytics" title="Analytics" description="Performance charts and RALF insights" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, color }: {
  title: string; value: string; subtitle?: string;
  icon: React.ReactNode; color: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{title}</span>
        <div className={`p-2 rounded-lg ${colors[color] || colors.blue}`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {subtitle && <div className="text-sm text-gray-400 mt-1">{subtitle}</div>}
    </div>
  );
}

function NavCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <a href={href} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </a>
  );
}
