'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  Bot,
  Send,
  Trash2,
  Power,
  PowerOff,
  RefreshCw,
  Terminal,
  Cpu,
  Globe,
  Clock,
  Sparkles,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}

interface SandboxInfo {
  machineId: string;
  state: 'created' | 'started' | 'stopped' | 'destroyed';
  region: string;
}

const SUGGESTED_PROMPTS = [
  { label: 'Deal Analysis', prompt: 'Analyze my current deal pipeline and recommend next steps' },
  { label: 'Market Trends', prompt: 'What are the latest market trends in global consignment trading?' },
  { label: 'KYC Help', prompt: 'Help me understand the KYC verification process' },
  { label: 'Strategy', prompt: 'What strategies do you recommend for closing high-value deals?' },
];

export default function AgentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sandbox, setSandbox] = useState<SandboxInfo | null>(null);
  const [isSandboxLoading, setSandboxLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAgentResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();

    if (lower.includes('deal') || lower.includes('pipeline')) {
      return `I can help you analyze your deal pipeline. Based on market trends, here are my recommendations:\n\n1. **Prioritize high-value consignments** above $50K — they have a 73% close rate on Studex.\n2. **Follow up within 24 hours** on new leads to maintain momentum.\n3. **Use collaborative notes** to keep all stakeholders aligned.\n\nWould you like me to drill into a specific deal or run a valuation analysis?`;
    }

    if (lower.includes('market') || lower.includes('trend') || lower.includes('analysis')) {
      return `Here's a snapshot of current market conditions:\n\n📊 **Global Consignment Market**\n- Luxury goods: +12% YoY demand\n- Industrial equipment: Stable, +2% QoQ\n- Commodities: Volatile, watch precious metals\n\n📈 **Top Performing Sectors This Quarter**\n1. Technology hardware\n2. Automotive parts\n3. Fine art & collectibles\n\nI can provide a deeper analysis on any sector. What interests you?`;
    }

    if (lower.includes('kyc') || lower.includes('verification') || lower.includes('compliance')) {
      return `Here's your KYC/compliance status overview:\n\n✅ **Identity Verification**: Ensure all documents are current\n- Passport/ID: Check expiry dates\n- Proof of address: Must be < 3 months old\n- Business registration: Annual renewal\n\n⚠️ **Tips for faster verification**:\n- Submit high-resolution scans\n- Ensure all corners of documents are visible\n- Business entities need Articles of Incorporation\n\nNeed help with a specific document or verification step?`;
    }

    if (lower.includes('strateg') || lower.includes('recommend') || lower.includes('closing')) {
      return `Here are proven strategies for high-value deal closure:\n\n🎯 **Relationship Building**\n- Schedule face-to-face meetings for deals > $100K\n- Share market intelligence as a value-add\n\n📋 **Due Diligence Acceleration**\n- Pre-prepare all compliance documentation\n- Use Studex's collaborative workspace for document sharing\n\n⏱️ **Timeline Management**\n- Set clear milestones with weekly check-ins\n- Use the Time Tracker to optimize your sales cycle\n\n💡 **Negotiation Tactics**\n- Lead with market data to justify valuations\n- Offer phased payment structures for larger deals\n\nWant me to apply any of these to a specific deal in your pipeline?`;
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return `Hello! I'm your Studex AI Agent running in a secure Fly.io sandbox. I can help you with:\n\n🤝 **Deal Analysis** — Evaluate opportunities and track your pipeline\n📊 **Market Intelligence** — Real-time trends and sector analysis\n📋 **Compliance** — KYC guidance and verification status\n⏱️ **Productivity** — Time tracking insights and scheduling\n💡 **Strategy** — Investment recommendations and risk assessment\n\nWhat would you like to explore?`;
    }

    return `I understand you're asking about: "${userMessage}"\n\nAs your Studex AI Agent, I can analyze this in the context of your trading operations. Could you provide more details about:\n- Which specific deal or market this relates to?\n- What outcome you're looking for?\n- Any time constraints I should consider?\n\nThe more context you share, the better I can assist you.`;
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Simulate agent processing delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const responseContent = simulateAgentResponse(userMsg.content);

    const agentMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'agent',
      content: responseContent,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, agentMsg]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCreateSandbox = async () => {
    setSandboxLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSandbox({
      machineId: `mach_${Date.now().toString(36)}`,
      state: 'started',
      region: 'iad (Virginia)',
    });
    setSandboxLoading(false);
  };

  const handleDestroySandbox = async () => {
    setSandboxLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setSandbox(null);
    setMessages([]);
    setSandboxLoading(false);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-gold-400 font-semibold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
                  <Bot className="text-primary-500" size={32} />
                  AI Agent
                  <Badge variant="primary" size="sm">Fly.io Sandbox</Badge>
                </h1>
                <p className="text-gray-400">Your dedicated AI trading assistant in a secure sandbox</p>
              </div>
              <div className="flex gap-2">
                {!sandbox ? (
                  <Button
                    variant="primary"
                    icon={<Power size={18} />}
                    isLoading={isSandboxLoading}
                    onClick={handleCreateSandbox}
                  >
                    Launch Sandbox
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    icon={<PowerOff size={18} />}
                    isLoading={isSandboxLoading}
                    onClick={handleDestroySandbox}
                  >
                    Destroy Sandbox
                  </Button>
                )}
              </div>
            </div>

            {/* Sandbox Status Bar */}
            {sandbox && (
              <Card className="mb-6">
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Cpu size={16} className="text-primary-400" />
                    <span className="text-gray-400">Machine:</span>
                    <code className="text-primary-300 bg-dark-800 px-2 py-0.5 rounded text-xs">{sandbox.machineId}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-400 font-medium">{sandbox.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-primary-400" />
                    <span className="text-gray-400">{sandbox.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-primary-400" />
                    <span className="text-gray-400">shared-cpu-1x · 256MB</span>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid lg:grid-cols-4 gap-6">
              {/* Chat Area */}
              <div className="lg:col-span-3">
                <Card className="flex flex-col h-[calc(100vh-320px)] min-h-[500px]">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between border-b border-primary-700/20 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-600/30 border border-primary-500/50 flex items-center justify-center">
                        <Bot size={20} className="text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-bold">Studex AI Agent</h3>
                        <p className="text-xs text-gray-400">
                          {sandbox ? 'Running in Fly.io sandbox' : 'Sandbox not started'}
                        </p>
                      </div>
                    </div>
                    {messages.length > 0 && (
                      <Button variant="ghost" size="sm" icon={<Trash2 size={16} />} onClick={handleClearChat}>
                        Clear
                      </Button>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="h-16 w-16 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center mb-4">
                          <Sparkles size={28} className="text-gold-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Start a conversation</h3>
                        <p className="text-gray-400 mb-6 max-w-md">
                          Ask your AI agent about deals, market trends, compliance, or trading strategies.
                          {!sandbox && ' Launch a sandbox first to connect to a dedicated agent instance.'}
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3 w-full max-w-lg">
                          {SUGGESTED_PROMPTS.map((sp) => (
                            <button
                              key={sp.label}
                              onClick={() => {
                                setInputValue(sp.prompt);
                              }}
                              className="text-left px-4 py-3 rounded-lg border border-primary-700/30 bg-dark-800/50 hover:bg-primary-600/10 hover:border-primary-600/50 transition-all text-sm"
                            >
                              <span className="font-medium text-primary-300">{sp.label}</span>
                              <p className="text-gray-500 text-xs mt-1 line-clamp-1">{sp.prompt}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            msg.role === 'user'
                              ? 'bg-primary-600 text-white rounded-br-md'
                              : 'bg-dark-800 border border-primary-700/20 rounded-bl-md'
                          }`}
                        >
                          {msg.role === 'agent' && (
                            <div className="flex items-center gap-2 mb-2">
                              <Bot size={14} className="text-primary-400" />
                              <span className="text-xs font-medium text-primary-400">AI Agent</span>
                            </div>
                          )}
                          <div className="whitespace-pre-line text-sm leading-relaxed">
                            {renderMessageContent(msg.content)}
                          </div>
                          <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-primary-200' : 'text-gray-500'}`}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-dark-800 border border-primary-700/20 rounded-2xl rounded-bl-md px-4 py-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Bot size={14} className="text-primary-400" />
                            <span className="text-xs font-medium text-primary-400">AI Agent</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <RefreshCw size={14} className="animate-spin text-primary-400" />
                            <span className="text-sm text-gray-400">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="border-t border-primary-700/20 p-4">
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <textarea
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={sandbox ? 'Type your message...' : 'Launch a sandbox to start chatting...'}
                          className="w-full bg-dark-800 border border-primary-700/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                          rows={1}
                          disabled={isLoading}
                        />
                      </div>
                      <Button
                        variant="primary"
                        icon={<Send size={18} />}
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isLoading}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Panel */}
              <div className="space-y-6">
                {/* Sandbox Info */}
                <Card>
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Terminal size={18} className="text-primary-400" />
                    Sandbox Details
                  </h3>
                  {sandbox ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status</span>
                        <Badge variant="success" size="sm">Running</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Provider</span>
                        <span className="text-white">Fly.io</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Region</span>
                        <span className="text-white">Virginia (IAD)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">CPU</span>
                        <span className="text-white">1x shared</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Memory</span>
                        <span className="text-white">256 MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Isolation</span>
                        <span className="text-white">Firecracker VM</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No sandbox running. Launch one to connect your AI agent to a dedicated, isolated environment.
                    </p>
                  )}
                </Card>

                {/* Capabilities */}
                <Card>
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-gold-400" />
                    Capabilities
                  </h3>
                  <div className="space-y-2">
                    {[
                      { icon: '🤝', label: 'Deal Analysis' },
                      { icon: '📊', label: 'Market Intelligence' },
                      { icon: '📋', label: 'Compliance Guidance' },
                      { icon: '⏱️', label: 'Productivity Insights' },
                      { icon: '💡', label: 'Strategy Recommendations' },
                      { icon: '🔍', label: 'Risk Assessment' },
                    ].map((cap) => (
                      <div key={cap.label} className="flex items-center gap-2 text-sm text-gray-300">
                        <span>{cap.icon}</span>
                        <span>{cap.label}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Session Stats */}
                <Card>
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-primary-400" />
                    Session
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Messages</span>
                      <span className="text-white">{messages.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Your messages</span>
                      <span className="text-white">{messages.filter(m => m.role === 'user').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Agent responses</span>
                      <span className="text-white">{messages.filter(m => m.role === 'agent').length}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
