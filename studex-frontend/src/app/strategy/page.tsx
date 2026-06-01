'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface StrategyCard {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low' | 'done';
  column: 'backlog' | 'in-progress' | 'review' | 'done';
}

const quickActions = [
  { label: 'Revenue Analysis', prompt: 'Analyze our revenue trends for the last 30 days. Break down by product category and identify top performers.' },
  { label: 'Customer Segments', prompt: 'Identify our key customer segments based on order history. Who are our highest-value customers?' },
  { label: 'Competitor Scan', prompt: 'Scan our market position. Who are our main competitors in the Gauteng premium meat space and how do we compare?' },
  { label: 'Sales Forecast', prompt: 'Generate a sales forecast for the next quarter based on current trends and seasonality.' },
  { label: 'Marketing Ideas', prompt: 'Suggest 5 marketing campaign ideas for our premium Wagyu products targeting high-end restaurants in Johannesburg.' },
  { label: 'Cost Optimization', prompt: 'Analyze our cost structure and suggest ways to improve margins without reducing quality.' },
];

const keyMetrics = [
  { label: 'Monthly Revenue', value: 'R142,800', change: '+12.4%', positive: true },
  { label: 'Avg Order Value', value: 'R3,820', change: '+5.2%', positive: true },
  { label: 'Customer Retention', value: '68%', change: '-2.1%', positive: false },
  { label: 'Gross Margin', value: '42%', change: '+1.8%', positive: true },
];

const initialCards: StrategyCard[] = [
  { id: '1', title: 'Expand Wagyu product line', priority: 'high', column: 'in-progress' },
  { id: '2', title: 'Restaurant partnership outreach', priority: 'medium', column: 'in-progress' },
  { id: '3', title: 'Holiday season campaign prep', priority: 'low', column: 'backlog' },
  { id: '4', title: 'Shopify store launch', priority: 'done', column: 'done' },
  { id: '5', title: 'Implement loyalty program', priority: 'medium', column: 'backlog' },
  { id: '6', title: 'Cold chain audit', priority: 'high', column: 'review' },
  { id: '7', title: 'Wholesale pricing tier revamp', priority: 'medium', column: 'review' },
  { id: '8', title: 'Instagram content calendar', priority: 'low', column: 'in-progress' },
];

const columns = [
  { key: 'backlog', label: 'Backlog', color: 'border-gray-700' },
  { key: 'in-progress', label: 'In Progress', color: 'border-yellow-700' },
  { key: 'review', label: 'Review', color: 'border-blue-700' },
  { key: 'done', label: 'Done', color: 'border-green-700' },
];

const priorityStyles: Record<string, string> = {
  high: 'bg-red-900/40 text-red-400 border-red-800/40',
  medium: 'bg-yellow-900/40 text-yellow-400 border-yellow-800/40',
  low: 'bg-blue-900/40 text-blue-400 border-blue-800/40',
  done: 'bg-green-900/40 text-green-400 border-green-800/40',
};

export default function StrategyPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [cards, setCards] = useState<StrategyCard[]>(initialCards);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const sendMessage = async (text?: string) => {
    const content = text || input;
    if (!content.trim() || loading) return;

    const userMsg: Message = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setStreamingText('');

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', messages: newMessages }),
      });
      const data = await res.json();
      const fullText = data.response || 'No response received.';

      // Simulate streaming effect
      let i = 0;
      const interval = setInterval(() => {
        i += Math.floor(Math.random() * 3) + 1;
        if (i >= fullText.length) {
          clearInterval(interval);
          setStreamingText('');
          setMessages([...newMessages, { role: 'assistant', content: fullText }]);
          setLoading(false);
        } else {
          setStreamingText(fullText.slice(0, i));
        }
      }, 15);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Failed to connect to the agent. Please check that the API is running.' }]);
      setStreamingText('');
      setLoading(false);
    }
  };

  const moveCard = (cardId: string, toColumn: string) => {
    setCards(prev => prev.map(c =>
      c.id === cardId
        ? { ...c, column: toColumn as StrategyCard['column'], priority: toColumn === 'done' ? 'done' : c.priority }
        : c
    ));
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

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Chat Interface */}
          <div className="col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col h-[600px]">
              <div className="px-5 py-4 border-b border-gray-800">
                <h2 className="font-semibold text-sm">AI Strategy Advisor</h2>
                <p className="text-xs text-gray-500">Powered by CashClaw Agent</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.length === 0 && !streamingText && (
                  <div className="text-center py-16">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-900/30 border border-red-800/30 flex items-center justify-center">
                      <span className="text-red-400 text-lg font-bold">S</span>
                    </div>
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
                {streamingText && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-300 leading-relaxed">
                      <pre className="whitespace-pre-wrap font-sans">{streamingText}</pre>
                      <span className="inline-block w-2 h-4 bg-red-400 animate-pulse ml-0.5" />
                    </div>
                  </div>
                )}
                {loading && !streamingText && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                      <span className="flex gap-1">
                        <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
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

          {/* Quick Actions */}
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
          </div>
        </div>

        {/* Strategy Board */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Strategy Board</h2>
          <div className="grid grid-cols-4 gap-4">
            {columns.map(col => (
              <div
                key={col.key}
                className={`bg-gray-900 border ${col.color} rounded-xl p-4 min-h-[300px]`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedCard) {
                    moveCard(draggedCard, col.key);
                    setDraggedCard(null);
                  }
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-300">{col.label}</h3>
                  <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
                    {cards.filter(c => c.column === col.key).length}
                  </span>
                </div>
                <div className="space-y-2">
                  {cards.filter(c => c.column === col.key).map(card => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => setDraggedCard(card.id)}
                      onDragEnd={() => setDraggedCard(null)}
                      className={`bg-gray-800/70 border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:bg-gray-800 transition-colors ${
                        draggedCard === card.id ? 'opacity-50' : ''
                      } border-gray-700`}
                    >
                      <p className="text-sm font-medium mb-2">{card.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityStyles[card.priority]}`}>
                        {card.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
