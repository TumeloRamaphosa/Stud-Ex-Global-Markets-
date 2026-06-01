'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const quickActions = [
  { label: 'Revenue Analysis', prompt: 'Analyze our revenue trends for the last 30 days. Break down by product category and identify top performers.' },
  { label: 'Customer Segments', prompt: 'Identify our key customer segments based on order history. Who are our highest-value customers?' },
  { label: 'Competitor Scan', prompt: 'Scan our market position. Who are our main competitors in the Gauteng premium meat space and how do we compare?' },
  { label: 'Sales Forecast', prompt: 'Generate a sales forecast for the next quarter based on current trends and seasonality.' },
];

const keyMetrics = [
  { label: 'Monthly Revenue', value: 'R142,800', change: '+12.4%', positive: true },
  { label: 'Avg Order Value', value: 'R3,820', change: '+5.2%', positive: true },
  { label: 'Customer Retention', value: '68%', change: '-2.1%', positive: false },
  { label: 'Gross Margin', value: '42%', change: '+1.8%', positive: true },
];

export default function StrategyPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text?: string) => {
    const content = text || input;
    if (!content.trim()) return;

    const userMsg: Message = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', messages: newMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.response || 'No response received.' }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Failed to connect to the agent. Please check that the API is running.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Strategy Room</h1>
          <p className="text-sm text-gray-500">AI-powered business intelligence and strategic planning</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {keyMetrics.map((m) => (
            <div key={m.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-500 mb-1">{m.label}</p>
              <p className="text-2xl font-bold">{m.value}</p>
              <p className={`text-xs mt-1 ${m.positive ? 'text-green-400' : 'text-red-400'}`}>{m.change} vs last month</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col h-[600px]">
              <div className="px-5 py-4 border-b border-gray-800">
                <h2 className="font-semibold text-sm">AI Strategy Advisor</h2>
                <p className="text-xs text-gray-500">Powered by CashClaw Agent</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-4xl mb-4 opacity-20">◈</div>
                    <p className="text-gray-500 text-sm">Ask anything about your business strategy.</p>
                    <p className="text-gray-600 text-xs mt-1">Use the quick actions on the right to get started.</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-red-900/30 border border-red-800/30 text-gray-200'
                        : 'bg-gray-800 border border-gray-700 text-gray-300'
                    }`}>
                      <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-400">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-gray-800 p-4 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask about revenue, customers, strategy..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions & Strategy Board */}
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => sendMessage(action.prompt)}
                    disabled={loading}
                    className="w-full text-left px-4 py-3 bg-gray-800/50 border border-gray-800 rounded-lg text-sm hover:border-red-800/50 hover:bg-red-950/20 transition-colors disabled:opacity-50"
                  >
                    <span className="font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-4">Strategy Board</h3>
              <div className="space-y-3">
                <div className="bg-gray-800/50 border border-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Priority</p>
                  <p className="text-sm font-medium">Expand Wagyu product line</p>
                  <p className="text-xs text-red-400 mt-1">High</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">In Progress</p>
                  <p className="text-sm font-medium">Restaurant partnership outreach</p>
                  <p className="text-xs text-yellow-400 mt-1">Medium</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Upcoming</p>
                  <p className="text-sm font-medium">Holiday season campaign prep</p>
                  <p className="text-xs text-blue-400 mt-1">Planned</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Done</p>
                  <p className="text-sm font-medium">Shopify store launch</p>
                  <p className="text-xs text-green-400 mt-1">Complete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
