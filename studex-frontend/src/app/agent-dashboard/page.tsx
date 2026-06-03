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
  const [waSending, setWaSending] = useState(false);

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
    addLog(`Switch LLM to ${provider}`, 'pending', 'Switching...');
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'llm_config', provider, model, ollamaUrl }),
      });
      const data = await res.json();
      if (data.config) setLlmConfig(data.config);
      addLog(`Switch LLM to ${provider}/${model}`, 'success', 'Provider updated');
    } catch {
      addLog(`Switch LLM to ${provider}`, 'error', 'Failed to switch');
    }
  };

  const addLog = (action: string, status: ActionLog['status'], details: string) => {
    setLogs((prev) => [{ id: Date.now(), timestamp: new Date().toISOString(), action, status, details }, ...prev].slice(0, 50));
  };

  const runQuickAction = async (label: string, actionPrompt: string) => {
    addLog(label, 'pending', 'Running...');
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', messages: [{ role: 'user', content: actionPrompt }] }),
      });
      const data = await res.json();
      addLog(label, 'success', data.response?.slice(0, 120) || 'Complete');
    } catch {
      addLog(label, 'error', 'Agent unreachable');
    }
  };

  const sendWhatsApp = async () => {
    if (!waMessage.phone || !waMessage.message) return;
    setWaSending(true);
    setWaStatus('Sending...');
    addLog('WhatsApp message', 'pending', `To: ${waMessage.phone}`);
    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: waMessage.phone, message: waMessage.message }),
      });
      const data = await res.json();
      if (data.ok) {
        setWaStatus('Message sent successfully');
        addLog('WhatsApp message', 'success', `To: ${waMessage.phone}`);
        setWaMessage({ phone: '', message: '' });
      } else {
        setWaStatus(`Error: ${data.error || 'Failed to send'}`);
        addLog('WhatsApp message', 'error', data.error || 'Send failed');
      }
    } catch {
      setWaStatus('Failed to connect to WhatsApp API');
      addLog('WhatsApp message', 'error', 'API unreachable');
    } finally {
      setWaSending(false);
    }
  };

  const quickActions = [
    { label: 'Daily Report', prompt: 'Generate a daily business report with orders, revenue, and highlights for Studex Meat.' },
    { label: 'Weekly Summary', prompt: 'Create a weekly summary with trends, top products, and recommendations for Studex Meat.' },
    { label: 'Inventory Alert', prompt: 'Check current inventory levels and flag any items running low for Studex Meat.' },
    { label: 'Customer Follow-up', prompt: 'List customers who ordered in the last week but have not reordered from Studex Meat.' },
    { label: 'Ad Performance', prompt: 'Pull the latest Meta Ads campaign performance metrics for Studex Meat.' },
    { label: 'Content Ideas', prompt: 'Generate 5 social media content ideas for Studex Meat premium Wagyu products.' },
  ];

  const llmProviders: { provider: string; model: string; label: string; color: string; ollamaUrl?: string; colorClasses: { active: string; inactive: string } }[] = [
    { provider: 'anthropic', model: 'claude-sonnet-4-20250514', label: 'Claude', color: 'purple', colorClasses: { active: 'border-purple-600 bg-purple-900/40 ring-1 ring-purple-500/30', inactive: 'border-gray-800 bg-gray-800/30 hover:bg-gray-800' } },
    { provider: 'openrouter', model: 'anthropic/claude-sonnet-4-20250514', label: 'OpenRouter', color: 'blue', colorClasses: { active: 'border-blue-600 bg-blue-900/40 ring-1 ring-blue-500/30', inactive: 'border-gray-800 bg-gray-800/30 hover:bg-gray-800' } },
    { provider: 'google', model: 'gemini-2.0-flash', label: 'Gemini', color: 'green', colorClasses: { active: 'border-green-600 bg-green-900/40 ring-1 ring-green-500/30', inactive: 'border-gray-800 bg-gray-800/30 hover:bg-gray-800' } },
    { provider: 'ollama', model: 'qwen3:30b', label: 'Ollama (Manus)', color: 'orange', ollamaUrl: 'http://35.196.24.245:11434', colorClasses: { active: 'border-orange-600 bg-orange-900/40 ring-1 ring-orange-500/30', inactive: 'border-gray-800 bg-gray-800/30 hover:bg-gray-800' } },
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
            LLM: <span className="text-green-400 font-medium">{llmConfig.provider || '...'}</span> / {llmConfig.model || '...'}
          </div>
        </div>

        {/* Service Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LLM Provider Switcher */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">LLM Provider</h2>
            <div className="space-y-2">
              {llmProviders.map((lp) => {
                const isActive = llmConfig.provider === lp.provider;
                return (
                  <button
                    key={lp.provider}
                    onClick={() => switchLLM(lp.provider, lp.model, lp.ollamaUrl)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm border transition-all ${
                      isActive ? lp.colorClasses.active : lp.colorClasses.inactive
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{lp.label}</span>
                      {isActive && (
                        <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">{lp.model}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions + WhatsApp */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {quickActions.map((qa) => (
                <button
                  key={qa.label}
                  onClick={() => runQuickAction(qa.label, qa.prompt)}
                  className="w-full text-left px-4 py-3 bg-gray-800/50 border border-gray-800 rounded-lg text-sm hover:border-red-800/50 hover:bg-red-950/20 transition-colors"
                >
                  {qa.label}
                </button>
              ))}
            </div>

            {/* WhatsApp Sender */}
            <div className="mt-6 pt-5 border-t border-gray-800">
              <h3 className="text-sm font-semibold mb-3">Send WhatsApp</h3>
              <div className="space-y-2">
                <input
                  value={waMessage.phone}
                  onChange={(e) => setWaMessage({ ...waMessage, phone: e.target.value })}
                  placeholder="Phone (e.g. 27601234567)"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                />
                <textarea
                  value={waMessage.message}
                  onChange={(e) => setWaMessage({ ...waMessage, message: e.target.value })}
                  placeholder="Message..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 resize-none"
                />
                <button
                  onClick={sendWhatsApp}
                  disabled={waSending || !waMessage.phone || !waMessage.message}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                >
                  {waSending ? 'Sending...' : 'Send via WhatsApp API'}
                </button>
                {waStatus && (
                  <p className={`text-xs ${waStatus.startsWith('Error') || waStatus.startsWith('Failed') ? 'text-red-400' : 'text-green-400'}`}>
                    {waStatus}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Recent Activity</h2>
              <span className="text-xs text-gray-600">{logs.length} events</span>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="bg-gray-800/50 border border-gray-800 rounded-lg px-3 py-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium truncate mr-2">{log.action}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
                      log.status === 'success' ? 'bg-green-900/50 text-green-400' :
                      log.status === 'error' ? 'bg-red-900/50 text-red-400' :
                      'bg-yellow-900/50 text-yellow-400'
                    }`}>{log.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{log.details}</p>
                  <p className="text-xs text-gray-600 mt-1">{new Date(log.timestamp).toLocaleTimeString()}</p>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-xs text-gray-600 text-center py-4">No activity yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
