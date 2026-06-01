'use client';

import { useState, useEffect, useCallback } from 'react';

interface ServiceStatus {
  name: string;
  port: number;
  status: 'online' | 'offline' | 'checking';
}

interface Order {
  id: string;
  name: string;
  email: string;
  total_price: string;
  created_at: string;
  financial_status: string;
}

export default function Dashboard() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'CashClaw', port: 3000, status: 'checking' },
    { name: 'MCP Meta Ads', port: 3002, status: 'checking' },
    { name: 'n8n Runner', port: 3003, status: 'checking' },
    { name: 'Hermes', port: 3004, status: 'checking' },
  ]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [llmConfig, setLlmConfig] = useState({ provider: '', model: '' });
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'invoices' | 'campaigns' | 'chat' | 'hermes'>('overview');

  const checkServices = useCallback(async () => {
    const checks = [
      fetch('/api/agent').then(r => r.json()).then(() => 'online' as const).catch(() => 'offline' as const),
      fetch('/api/meta-ads?resource=campaigns').then(() => 'online' as const).catch(() => 'offline' as const),
      fetch('/api/n8n').then(() => 'online' as const).catch(() => 'offline' as const),
      fetch('/api/hermes').then(r => r.json()).then(() => 'online' as const).catch(() => 'offline' as const),
    ];
    const results = await Promise.all(checks);
    setServices(prev => prev.map((s, i) => ({ ...s, status: results[i] })));
  }, []);

  useEffect(() => {
    checkServices();
    fetch('/api/agent').then(r => r.json()).then(d => {
      if (d.config) setLlmConfig(d.config);
    }).catch(() => {});

    fetch('/api/shopify?resource=orders&limit=10').then(r => r.json()).then(d => {
      if (d.orders) setOrders(d.orders);
    }).catch(() => {});

    const interval = setInterval(checkServices, 30000);
    return () => clearInterval(interval);
  }, [checkServices]);

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const newMessages = [...chatMessages, { role: 'user', content: chatInput }];
    setChatMessages(newMessages);
    setChatInput('');

    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'chat', messages: newMessages }),
    });
    const data = await res.json();
    setChatMessages([...newMessages, { role: 'assistant', content: data.response }]);
  };

  const switchLLM = async (provider: string, model?: string, ollamaUrl?: string) => {
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'llm_config', provider, model, ollamaUrl }),
    });
    const data = await res.json();
    if (data.config) setLlmConfig(data.config);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-bold text-lg">SM</div>
            <div>
              <h1 className="text-xl font-bold">Studex Meat</h1>
              <p className="text-xs text-gray-400">CashClaw Agent Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs px-3 py-1 rounded-full bg-gray-800 text-gray-300">
              LLM: <span className="text-green-400">{llmConfig.provider || '...'}</span> / {llmConfig.model || '...'}
            </div>
            {services.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <div className={`w-2 h-2 rounded-full ${s.status === 'online' ? 'bg-green-500' : s.status === 'offline' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`} />
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="border-b border-gray-800 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-6 flex gap-1">
          {(['overview', 'orders', 'invoices', 'campaigns', 'chat', 'hermes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-400 hover:text-gray-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-4 gap-4">
              <StatCard label="Orders Today" value={orders.length.toString()} color="red" />
              <StatCard label="Revenue" value={`R${orders.reduce((s, o) => s + parseFloat(o.total_price || '0'), 0).toLocaleString()}`} color="green" />
              <StatCard label="Active Campaigns" value="--" color="blue" />
              <StatCard label="Services Online" value={`${services.filter(s => s.status === 'online').length}/4`} color="yellow" />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Services</h2>
              <div className="grid grid-cols-4 gap-4">
                {services.map(s => (
                  <div key={s.name} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{s.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'online' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {s.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Port :{s.port}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">LLM Provider</h2>
              <div className="flex gap-2">
                <button onClick={() => switchLLM('anthropic', 'claude-sonnet-4-20250514')} className="px-4 py-2 bg-purple-900/50 border border-purple-700 rounded-lg text-sm hover:bg-purple-900">Claude</button>
                <button onClick={() => switchLLM('openrouter', 'anthropic/claude-sonnet-4-20250514')} className="px-4 py-2 bg-blue-900/50 border border-blue-700 rounded-lg text-sm hover:bg-blue-900">OpenRouter</button>
                <button onClick={() => switchLLM('google', 'gemini-2.0-flash')} className="px-4 py-2 bg-green-900/50 border border-green-700 rounded-lg text-sm hover:bg-green-900">Gemini</button>
                <button onClick={() => switchLLM('ollama', 'qwen3:30b', 'http://35.196.24.245:11434')} className="px-4 py-2 bg-orange-900/50 border border-orange-700 rounded-lg text-sm hover:bg-orange-900">Ollama (Manus)</button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
              <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800/50 text-gray-400">
                    <tr>
                      <th className="text-left px-4 py-2">Order</th>
                      <th className="text-left px-4 py-2">Customer</th>
                      <th className="text-left px-4 py-2">Total</th>
                      <th className="text-left px-4 py-2">Status</th>
                      <th className="text-left px-4 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 10).map(order => (
                      <tr key={order.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                        <td className="px-4 py-2 font-mono text-red-400">{order.name}</td>
                        <td className="px-4 py-2">{order.email}</td>
                        <td className="px-4 py-2">R{parseFloat(order.total_price).toLocaleString()}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${order.financial_status === 'paid' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                            {order.financial_status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Connect Shopify to see orders</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">CashClaw Agent Chat</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-lg h-[500px] flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-red-900/50 text-red-100' : 'bg-gray-800 text-gray-200'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-800 p-4 flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Ask CashClaw anything..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-500"
                />
                <button onClick={sendChat} className="px-4 py-2 bg-red-600 rounded-lg text-sm font-medium hover:bg-red-700">Send</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Invoice Pipeline</h2>
            <p className="text-gray-400 text-sm">Google Sheets &rarr; QuickBooks (15% VAT) &rarr; Email &rarr; PDF &rarr; Drive</p>
            <InvoiceForm />
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">All Orders (Shopify)</h2>
            <p className="text-gray-400 text-sm">Synced from Shopify Admin API</p>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Campaigns</h2>
            <p className="text-gray-400 text-sm">Email, WhatsApp, and SMS campaigns</p>
          </div>
        )}

        {activeTab === 'hermes' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Hermes Content Agent</h2>
            <p className="text-gray-400 text-sm">Social posts, email copy, video scripts, image prompts, content calendars</p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {['Social Post', 'Email Copy', 'Video Script', 'Image Prompt', 'Content Calendar', 'A/B Test'].map(type => (
                <button key={type} className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-left hover:border-purple-600 transition-colors">
                  <h3 className="font-medium">{type}</h3>
                  <p className="text-xs text-gray-500 mt-1">Generate with Hermes</p>
                </button>
              ))}
            </div>
          </div>
        )}
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
  };
  return (
    <div className={`border rounded-lg p-4 ${colors[color]}`}>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function InvoiceForm() {
  const [form, setForm] = useState({ customerName: '', email: '', cut: '', weight: '', marbleScore: '' });
  const [result, setResult] = useState('');

  const createInvoice = async () => {
    setResult('Creating invoice...');
    const res = await fetch('/api/quickbooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'invoice_create',
        customerId: '1',
        customerName: form.customerName,
        email: form.email,
        items: [{ cut: form.cut, marbleScore: form.marbleScore, weight: parseFloat(form.weight), description: `${form.cut} (Marble: ${form.marbleScore})` }],
      }),
    });
    const data = await res.json();
    setResult(data.ok ? `Invoice created: ${data.invoice?.Id}` : `Error: ${JSON.stringify(data)}`);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-xl">
      <div className="space-y-3">
        <input placeholder="Customer Name (e.g. The Blockman Parkhurst)" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        <div className="grid grid-cols-3 gap-3">
          <input placeholder="Cut (e.g. Rib-eye)" value={form.cut} onChange={e => setForm({ ...form, cut: e.target.value })} className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
          <input placeholder="Weight (kg)" type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
          <input placeholder="Marble Score" value={form.marbleScore} onChange={e => setForm({ ...form, marbleScore: e.target.value })} className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        </div>
        <button onClick={createInvoice} className="w-full bg-red-600 hover:bg-red-700 rounded py-2 text-sm font-medium">Create Invoice (15% VAT)</button>
        {result && <p className="text-xs text-gray-400 mt-2">{result}</p>}
      </div>
    </div>
  );
}
