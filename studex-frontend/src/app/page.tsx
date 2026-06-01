'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface ServiceStatus {
  name: string;
  port: number;
  status: 'online' | 'offline' | 'checking';
  endpoint: string;
}

interface FeedEvent {
  id: string;
  type: 'order' | 'invoice' | 'campaign' | 'whatsapp';
  title: string;
  detail: string;
  time: string;
}

export default function Dashboard() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'CashClaw', port: 3000, status: 'checking', endpoint: '/api/agent' },
    { name: 'MCP Meta Ads', port: 3002, status: 'checking', endpoint: '/api/meta-ads?resource=campaigns' },
    { name: 'n8n Runner', port: 3003, status: 'checking', endpoint: '/api/n8n' },
    { name: 'Hermes', port: 3004, status: 'checking', endpoint: '/api/hermes' },
  ]);
  const [llmConfig, setLlmConfig] = useState({ provider: '', model: '' });
  const [feed, setFeed] = useState<FeedEvent[]>([
    { id: '1', type: 'order', title: 'New Order #1042', detail: 'The Blockman Parkhurst - 5kg Wagyu Ribeye', time: '2 min ago' },
    { id: '2', type: 'invoice', title: 'Invoice INV-005 Paid', detail: 'Cape Cuts Butchery - R22,000', time: '8 min ago' },
    { id: '3', type: 'campaign', title: 'Weekend Braai Campaign Live', detail: 'Meta Ads - 12,400 impressions', time: '15 min ago' },
    { id: '4', type: 'whatsapp', title: 'WhatsApp Order Received', detail: 'Smoke & Bones BBQ - 3kg Brisket', time: '22 min ago' },
    { id: '5', type: 'order', title: 'New Order #1041', detail: 'Urban Grill Co - 2kg Fillet Mignon', time: '35 min ago' },
    { id: '6', type: 'invoice', title: 'Invoice INV-004 Created', detail: 'Smoke & Bones BBQ - R6,800', time: '41 min ago' },
    { id: '7', type: 'campaign', title: 'Wagyu Wednesday Scheduled', detail: 'Email campaign - 2,400 recipients', time: '1 hr ago' },
    { id: '8', type: 'whatsapp', title: 'Delivery Confirmation Sent', detail: 'Flames Restaurant - delivered', time: '1 hr ago' },
  ]);
  const [ordersToday] = useState(14);
  const [revenue] = useState(48200);

  const checkServices = useCallback(async () => {
    const checks = services.map(s =>
      fetch(s.endpoint).then(() => 'online' as const).catch(() => 'offline' as const)
    );
    const results = await Promise.all(checks);
    setServices(prev => prev.map((s, i) => ({ ...s, status: results[i] })));
  }, []);

  useEffect(() => {
    checkServices();
    fetch('/api/agent').then(r => r.json()).then(d => {
      if (d.config) setLlmConfig(d.config);
    }).catch(() => {});

    const interval = setInterval(checkServices, 30000);
    return () => clearInterval(interval);
  }, [checkServices]);

  const typeIcons: Record<string, { label: string; bg: string; text: string }> = {
    order: { label: 'ORD', bg: 'bg-red-900/40', text: 'text-red-400' },
    invoice: { label: 'INV', bg: 'bg-blue-900/40', text: 'text-blue-400' },
    campaign: { label: 'ADS', bg: 'bg-purple-900/40', text: 'text-purple-400' },
    whatsapp: { label: 'WA', bg: 'bg-green-900/40', text: 'text-green-400' },
  };

  const quickActions = [
    { title: 'Create Invoice', desc: 'QuickBooks invoice with 15% VAT', href: '/meat-dashboard', color: 'border-blue-800/50 hover:border-blue-600' },
    { title: 'Send WhatsApp', desc: 'Message customers directly', href: '/agent-dashboard', color: 'border-green-800/50 hover:border-green-600' },
    { title: 'Generate Content', desc: 'Social posts, email copy, scripts', href: '/strategy', color: 'border-purple-800/50 hover:border-purple-600' },
    { title: 'Check Ads', desc: 'Meta campaign performance', href: '/agent-dashboard', color: 'border-orange-800/50 hover:border-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-bold text-lg">SM</div>
            <div>
              <h1 className="text-xl font-bold">Studex Meat</h1>
              <p className="text-xs text-gray-400">Executive Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs px-3 py-1 rounded-full bg-gray-800 text-gray-300">
              LLM: <span className="text-green-400">{llmConfig.provider || '...'}</span> / {llmConfig.model || '...'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Top Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Orders Today" value={ordersToday.toString()} color="red" />
          <StatCard label="Revenue Today" value={`R${revenue.toLocaleString()}`} color="green" />
          <StatCard label="Active Campaigns" value="3" color="purple" />
          <StatCard label="Services Online" value={`${services.filter(s => s.status === 'online').length}/4`} color="yellow" />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map(a => (
              <Link
                key={a.title}
                href={a.href}
                className={`bg-gray-900 border border-gray-800 ${a.color} rounded-xl p-5 transition-colors group`}
              >
                <h3 className="font-semibold text-sm group-hover:text-white">{a.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{a.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Real-time Feed */}
          <div className="col-span-2">
            <h2 className="text-lg font-semibold mb-4">Live Activity Feed</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="divide-y divide-gray-800">
                {feed.map(event => {
                  const icon = typeIcons[event.type];
                  return (
                    <div key={event.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-800/30 transition-colors">
                      <div className={`w-10 h-10 rounded-lg ${icon.bg} flex items-center justify-center shrink-0`}>
                        <span className={`text-xs font-bold ${icon.text}`}>{icon.label}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-gray-500 truncate">{event.detail}</p>
                      </div>
                      <span className="text-xs text-gray-600 shrink-0">{event.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* System Health */}
          <div>
            <h2 className="text-lg font-semibold mb-4">System Health</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
              {services.map(s => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      s.status === 'online' ? 'bg-green-400' :
                      s.status === 'offline' ? 'bg-red-400' :
                      'bg-yellow-400 animate-pulse'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-gray-600">Port :{s.port}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    s.status === 'online' ? 'bg-green-900/50 text-green-400' :
                    s.status === 'offline' ? 'bg-red-900/50 text-red-400' :
                    'bg-yellow-900/50 text-yellow-400'
                  }`}>
                    {s.status}
                  </span>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Last checked</span>
                  <span className="text-gray-400">just now</span>
                </div>
                <button
                  onClick={checkServices}
                  className="mt-3 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Refresh Status
                </button>
              </div>
            </div>

            {/* LLM Provider */}
            <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-3">Active LLM</h3>
              <div className="bg-gray-800/50 rounded-lg px-4 py-3">
                <p className="text-sm font-medium text-green-400">{llmConfig.provider || 'Not connected'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{llmConfig.model || 'No model selected'}</p>
              </div>
              <Link href="/agent-dashboard" className="mt-3 block text-center py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium transition-colors">
                Manage LLM Provider
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    red: 'border-red-800 bg-red-950/30',
    green: 'border-green-800 bg-green-950/30',
    blue: 'border-blue-800 bg-blue-950/30',
    yellow: 'border-yellow-800 bg-yellow-950/30',
    purple: 'border-purple-800 bg-purple-950/30',
  };
  return (
    <div className={`border rounded-xl p-5 ${colors[color]}`}>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
