'use client';

import { useState, useEffect, useCallback } from 'react';

interface ServiceStatus {
  name: string;
  port: number;
  status: 'online' | 'offline' | 'checking';
  description: string;
}

interface ActionLog {
  id: number;
  timestamp: string;
  action: string;
  status: 'success' | 'error' | 'pending';
  details: string;
}

export default function AgentDashboardPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'CashClaw Agent', port: 3000, status: 'checking', description: 'Core AI agent and orchestrator' },
    { name: 'MCP Meta Ads', port: 3002, status: 'checking', description: 'Facebook & Instagram ad management' },
    { name: 'n8n Runner', port: 3003, status: 'checking', description: 'Workflow automation engine' },
    { name: 'Hermes', port: 3004, status: 'checking', description: 'Content generation agent' },
  ]);
  const [llmConfig, setLlmConfig] = useState({ provider: '', model: '' });
  const [logs, setLogs] = useState<ActionLog[]>([
    { id: 1, timestamp: new Date().toISOString(), action: 'System boot', status: 'success', details: 'All services initialized' },
  ]);
  const [waMessage, setWaMessage] = useState({ phone: '', message: '' });
  const [waStatus, setWaStatus] = useState('');

  const checkServices = useCallback(async () => {
    const checks = [
      fetch('/api/agent').then((r) => r.json()).then(() => 'online' as const).catch(() => 'offline' as const),
      fetch('/api/meta-ads?resource=campaigns').then(() => 'online' as const).catch(() => 'offline' as const),
      fetch('/api/n8n').then(() => 'online' as const).catch(() => 'offline' as const),
      fetch('/api/hermes').then((r) => r.json()).then(() => 'online' as const).catch(() => 'offline' as const),
    ];
    const results = await Promise.all(checks);
    setServices((prev) => prev.map((s, i) => ({ ...s, status: results[i] })));
  }, []);

  useEffect(() => {
    checkServices();
    fetch('/api/agent').then((r) => r.json()).then((d) => {
      if (d.config) setLlmConfig(d.config);
    }).catch(() => {});
    const interval = setInterval(checkServices, 30000);
    return () => clearInterval(interval);
  }, [checkServices]);

  const switchLLM = async (provider: string, model?: string, ollamaUrl?: string) => {
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'llm_config', provider, model, ollamaUrl }),
    });
    const data = await res.json();
    if (data.config) setLlmConfig(data.config);
    addLog(`Switch LLM to ${provider}/${model}`, 'success', `Provider updated`);
  };

  const addLog = (action: string, status: ActionLog['status'], details: string) => {
    setLogs((prev) => [{ id: Date.now(), timestamp: new Date().toISOString(), action, status, details }, ...prev].slice(0, 50));
  };

  const runQuickAction = async (action: string) => {
    addLog(action, 'pending', 'Running...');
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', messages: [{ role: 'user', content: action }] }),
      });
      const data = await res.json();
      addLog(action, 'success', data.response?.slice(0, 100) || 'Complete');
    } catch {
      addLog(action, 'error', 'Agent unreachable');
    }
  };

  const sendWhatsApp = async () => {
    if (!waMessage.phone || !waMessage.message) return;
    setWaStatus('Sending...');
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'whatsapp', phone: waMessage.phone, message: waMessage.message }),
      });
      const data = await res.json();
      setWaStatus(data.ok ? 'Sent' : `Error: ${data.error || 'Failed'}`);
      addLog('WhatsApp message', data.ok ? 'success' : 'error', `To: ${waMessage.phone}`);
    } catch {
      setWaStatus('Failed to send');
    }
  };

  const llmProviders = [
    { provider: 'anthropic', model: 'claude-sonnet-4-20250514', label: 'Claude', color: 'purple' },
    { provider: 'openrouter', model: 'anthropic/claude-sonnet-4-20250514', label: 'OpenRouter', color: 'blue' },
    { provider: 'google', model: 'gemini-2.0-flash', label: 'Gemini', color: 'green' },
    { provider: 'ollama', model: 'qwen3:30b', label: 'Ollama', color: 'orange', ollamaUrl: 'http://35.196.24.245:11434' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">CashClaw Control Panel</h1>
            <p className="text-sm text-gray-500">Agent orchestration and service management</p>
          </div>
          <div className="text-xs px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-gray-300">
            LLM: <span className="text-green-400">{llmConfig.provider || '...'}</span> / {llmConfig.model || '...'}
          </div>
        </div>

        {/* Service Status Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {services.map((s) => (
            <div key={s.name} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm">{s.name}</span>
                <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${
                  s.status === 'online' ? 'bg-green-900/50 text-green-400' :
                  s.status === 'offline' ? 'bg-red-900/50 text-red-400' :
                  'bg-yellow-900/50 text-yellow-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    s.status === 'online' ? 'bg-green-400' :
                    s.status === 'offline' ? 'bg-red-400' :
                    'bg-yellow-400 animate-pulse'
                  }`} />
                  {s.status}
                </div>
              </div>
              <p className="text-xs text-gray-500">{s.description}</p>
              <p className="text-xs text-gray-600 mt-2">Port :{s.port}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* LLM Provider Switcher */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">LLM Provider</h2>
            <div className="space-y-2">
              {llmProviders.map((lp) => {
                const isActive = llmConfig.provider === lp.provider;
                const colorMap: Record<string, string> = {
                  purple: 'border-purple-700 bg-purple-900/30',
                  blue: 'border-blue-700 bg-blue-900/30',
                  green: 'border-green-700 bg-green-900/30',
                  orange: 'border-orange-700 bg-orange-900/30',
                };
                return (
                  <button
                    key={lp.provider}
                    onClick={() => switchLLM(lp.provider, lp.model, lp.ollamaUrl)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm border transition-colors ${
                      isActive ? colorMap[lp.color] : 'border-gray-800 bg-gray-800/30 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{lp.label}</span>
                      {isActive && <span className="text-xs text-green-400">Active</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{lp.model}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Daily Report', prompt: 'Generate a daily business report with orders, revenue, and highlights.' },
                { label: 'Weekly Summary', prompt: 'Create a weekly summary with trends, top products, and recommendations.' },
                { label: 'Inventory Alert', prompt: 'Check current inventory levels and flag any items running low.' },
                { label: 'Customer Follow-up', prompt: 'List customers who ordered in the last week but have not reordered.' },
              ].map((qa) => (
                <button
                  key={qa.label}
                  onClick={() => runQuickAction(qa.prompt)}
                  className="w-full text-left px-4 py-3 bg-gray-800/50 border border-gray-800 rounded-lg text-sm hover:border-red-800/50 hover:bg-red-950/20 transition-colors"
                >
                  {qa.label}
                </button>
              ))}
            </div>

            {/* WhatsApp Sender */}
            <div className="mt-6 pt-5 border-t border-gray-800">
              <h3 className="text-sm font-semibold mb-3">WhatsApp Message</h3>
              <div className="space-y-2">
                <input
                  value={waMessage.phone}
                  onChange={(e) => setWaMessage({ ...waMessage, phone: e.target.value })}
                  placeholder="Phone (e.g. 27601234567)"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                />
                <textarea
                  value={waMessage.message}
                  onChange={(e) => setWaMessage({ ...waMessage, message: e.target.value })}
                  placeholder="Message..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-none"
                />
                <button
                  onClick={sendWhatsApp}
                  className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Send WhatsApp
                </button>
                {waStatus && <p className="text-xs text-gray-400">{waStatus}</p>}
              </div>
            </div>
          </div>

          {/* Recent Actions Log */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">Recent Actions</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="bg-gray-800/50 border border-gray-800 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{log.action}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      log.status === 'success' ? 'bg-green-900/50 text-green-400' :
                      log.status === 'error' ? 'bg-red-900/50 text-red-400' :
                      'bg-yellow-900/50 text-yellow-400'
                    }`}>{log.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{log.details}</p>
                  <p className="text-xs text-gray-600 mt-1">{new Date(log.timestamp).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
