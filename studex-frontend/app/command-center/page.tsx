'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StatusIndicator from '@/components/ui/StatusIndicator';
import Modal from '@/components/ui/Modal';
import {
  Terminal,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  MessageSquare,
  Link,
  Settings,
  Activity,
  Send,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Loader2,
  X,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AgentConnection {
  name: string;
  connected: boolean;
}

interface AgentConfig {
  id: string;
  name: string;
  description: string;
  port: string;
  chatEndpoint: string;
  chatPayloadKey: string;
  connections: AgentConnection[];
}

interface ChatMessage {
  role: 'user' | 'agent';
  text: string;
  ts: number;
}

interface VMConfig {
  id: string;
  title: string;
  status: 'active' | 'inactive' | 'pending';
  metrics: { label: string; value: string; icon: React.ReactNode }[];
  agents: AgentConfig[];
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const VMS: VMConfig[] = [
  {
    id: 'flyio',
    title: 'Fly.io VM — JNB',
    status: 'active',
    metrics: [
      { label: 'CPU', value: '24%', icon: <Cpu size={14} /> },
      { label: 'RAM', value: '1.2 / 2 GB', icon: <Activity size={14} /> },
    ],
    agents: [
      {
        id: 'cashclaw',
        name: 'CashClaw',
        description: 'Ops agent',
        port: '3000',
        chatEndpoint: '/api/agent',
        chatPayloadKey: 'message',
        connections: [
          { name: 'Shopify', connected: true },
          { name: 'Meta', connected: true },
          { name: 'QuickBooks', connected: false },
          { name: 'Slack', connected: true },
          { name: 'Discord', connected: false },
          { name: 'AgentMail', connected: true },
        ],
      },
      {
        id: 'metaads',
        name: 'Meta Ads MCP',
        description: 'Ads proxy',
        port: '3002',
        chatEndpoint: '/api/meta-ads',
        chatPayloadKey: 'message',
        connections: [{ name: 'Meta API', connected: true }],
      },
      {
        id: 'n8n',
        name: 'n8n Runner',
        description: 'Invoice automation',
        port: '3003',
        chatEndpoint: '/api/n8n',
        chatPayloadKey: 'message',
        connections: [
          { name: 'n8n Cloud', connected: true },
          { name: 'Google Sheets', connected: false },
        ],
      },
    ],
  },
  {
    id: 'manus',
    title: 'Manus VM — GPU',
    status: 'active',
    metrics: [
      { label: 'CPU', value: '38%', icon: <Cpu size={14} /> },
      { label: 'RAM', value: '6.4 / 16 GB', icon: <Activity size={14} /> },
      { label: 'GPU', value: '52%', icon: <HardDrive size={14} /> },
    ],
    agents: [
      {
        id: 'hermes',
        name: 'Hermes',
        description: 'Content agent',
        port: '3004',
        chatEndpoint: '/api/hermes',
        chatPayloadKey: 'task',
        connections: [
          { name: 'Ollama', connected: true },
          { name: 'ComfyUI', connected: true },
          { name: 'Anthropic', connected: true },
          { name: 'OpenRouter', connected: false },
        ],
      },
      {
        id: 'ollama',
        name: 'Ollama',
        description: 'Local LLM',
        port: '11434',
        chatEndpoint: '/api/ollama',
        chatPayloadKey: 'message',
        connections: [],
      },
      {
        id: 'comfyui',
        name: 'ComfyUI',
        description: 'Image / video generation',
        port: '8188',
        chatEndpoint: '/api/comfyui',
        chatPayloadKey: 'message',
        connections: [],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Theme constants                                                    */
/* ------------------------------------------------------------------ */

const CREAM = '#FFF8F0';
const GOLD = '#D4A017';
const TEXT = '#1A1A1A';
const GOLD_LIGHT = '#F5E6C8';
const GOLD_BORDER = '#E8D5A3';

/* ------------------------------------------------------------------ */
/*  Agent Card                                                         */
/* ------------------------------------------------------------------ */

function AgentCard({ agent }: { agent: AgentConfig }) {
  const [expanded, setExpanded] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [pasteInput, setPasteInput] = useState('');
  const [showPaste, setShowPaste] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [keyValue, setKeyValue] = useState('');
  const [showKeyValue, setShowKeyValue] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || sending) return;
    const userMsg: ChatMessage = { role: 'user', text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setSending(true);
    try {
      const res = await fetch(agent.chatEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [agent.chatPayloadKey]: text }),
      });
      const data = await res.json();
      const reply =
        data.reply || data.response || data.message || data.result || JSON.stringify(data);
      setMessages((prev) => [
        ...prev,
        { role: 'agent', text: typeof reply === 'string' ? reply : JSON.stringify(reply), ts: Date.now() },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'agent', text: `Error: ${err.message}`, ts: Date.now() },
      ]);
    } finally {
      setSending(false);
    }
  }, [chatInput, sending, agent]);

  const statusVariant: 'success' | 'error' | 'warning' = 'success';

  return (
    <div
      className="rounded-xl border p-4 transition-all duration-200"
      style={{
        borderColor: GOLD_BORDER,
        backgroundColor: 'rgba(255,248,240,0.6)',
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Terminal size={16} style={{ color: GOLD }} />
          <span className="font-bold text-base" style={{ color: TEXT }}>
            {agent.name}
          </span>
          <Badge variant={statusVariant} size="sm">
            running
          </Badge>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded hover:bg-black/5 transition-colors"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp size={16} color={TEXT} /> : <ChevronDown size={16} color={TEXT} />}
        </button>
      </div>
      <p className="text-sm mb-3" style={{ color: '#666' }}>
        {agent.description} &middot; port {agent.port}
      </p>

      {expanded && (
        <div className="space-y-4 animate-fade-in">
          {/* ---- Chat Box ---- */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{ color: GOLD }}>
              <MessageSquare size={12} className="inline mr-1" />
              Chat
            </label>
            <div
              className="rounded-lg border p-3 max-h-48 overflow-y-auto mb-2"
              style={{ borderColor: GOLD_BORDER, backgroundColor: '#FFFDF8' }}
            >
              {messages.length === 0 && (
                <p className="text-xs italic" style={{ color: '#999' }}>
                  Send a message to start chatting with {agent.name}...
                </p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`mb-2 text-sm ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <span
                    className="inline-block rounded-lg px-3 py-1.5 max-w-[85%]"
                    style={{
                      backgroundColor: m.role === 'user' ? GOLD : '#F0EAD6',
                      color: m.role === 'user' ? '#fff' : TEXT,
                    }}
                  >
                    {m.text}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Message ${agent.name}...`}
                className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: GOLD_BORDER,
                  backgroundColor: '#fff',
                  color: TEXT,
                  // @ts-ignore
                  '--tw-ring-color': GOLD,
                }}
              />
              <button
                onClick={sendMessage}
                disabled={sending || !chatInput.trim()}
                className="rounded-lg px-3 py-2 text-white font-medium text-sm disabled:opacity-40 transition-colors flex items-center gap-1"
                style={{ backgroundColor: GOLD }}
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Send
              </button>
            </div>
          </div>

          {/* ---- Paste Link / Doc ---- */}
          <div>
            <button
              onClick={() => setShowPaste(!showPaste)}
              className="text-xs font-semibold flex items-center gap-1 hover:underline"
              style={{ color: GOLD }}
            >
              <Link size={12} />
              Paste Link / Doc
            </button>
            {showPaste && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={pasteInput}
                  onChange={(e) => setPasteInput(e.target.value)}
                  placeholder="Paste a URL or text..."
                  className="flex-1 rounded-lg border px-3 py-1.5 text-sm focus:outline-none"
                  style={{ borderColor: GOLD_BORDER, color: TEXT }}
                />
                <button
                  onClick={() => {
                    if (pasteInput.trim()) {
                      setMessages((prev) => [
                        ...prev,
                        { role: 'user', text: `[Link/Doc] ${pasteInput}`, ts: Date.now() },
                      ]);
                      setPasteInput('');
                      setShowPaste(false);
                    }
                  }}
                  className="rounded-lg px-3 py-1.5 text-white text-sm font-medium"
                  style={{ backgroundColor: GOLD }}
                >
                  Attach
                </button>
              </div>
            )}
          </div>

          {/* ---- Connections ---- */}
          {agent.connections.length > 0 && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: GOLD }}>
                <Wifi size={12} className="inline mr-1" />
                Connections
              </label>
              <div className="space-y-1.5">
                {agent.connections.map((conn) => (
                  <div
                    key={conn.name}
                    className="flex items-center justify-between rounded-lg px-3 py-1.5"
                    style={{ backgroundColor: 'rgba(212,160,23,0.06)' }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: conn.connected ? '#22c55e' : '#ef4444' }}
                      />
                      <span className="text-sm" style={{ color: TEXT }}>
                        {conn.name}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setEditingKey(editingKey === conn.name ? null : conn.name);
                        setKeyValue('');
                        setShowKeyValue(false);
                      }}
                      className="text-xs font-medium flex items-center gap-1 hover:underline"
                      style={{ color: GOLD }}
                    >
                      <Settings size={11} />
                      Edit API Key
                    </button>
                  </div>
                ))}
                {editingKey && (
                  <div
                    className="rounded-lg border p-3 mt-2"
                    style={{ borderColor: GOLD_BORDER, backgroundColor: '#FFFDF8' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold" style={{ color: TEXT }}>
                        API Key for {editingKey}
                      </span>
                      <button onClick={() => setEditingKey(null)} className="text-gray-400 hover:text-gray-600">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showKeyValue ? 'text' : 'password'}
                          value={keyValue}
                          onChange={(e) => setKeyValue(e.target.value)}
                          placeholder="sk-..."
                          className="w-full rounded-lg border px-3 py-1.5 text-sm pr-8 focus:outline-none"
                          style={{ borderColor: GOLD_BORDER, color: TEXT }}
                        />
                        <button
                          onClick={() => setShowKeyValue(!showKeyValue)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showKeyValue ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setEditingKey(null);
                          setKeyValue('');
                        }}
                        className="rounded-lg px-3 py-1.5 text-white text-sm font-medium"
                        style={{ backgroundColor: GOLD }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---- Logs ---- */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{ color: GOLD }}>
              <Terminal size={12} className="inline mr-1" />
              Logs
            </label>
            <pre
              className="rounded-lg p-3 text-xs font-mono leading-relaxed overflow-x-auto max-h-32 overflow-y-auto"
              style={{ backgroundColor: '#1A1A1A', color: '#A8A29E' }}
            >
              {`[${new Date().toISOString().slice(0, 19)}] Waiting for logs...`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  VM Screen                                                          */
/* ------------------------------------------------------------------ */

function VMScreen({ vm }: { vm: VMConfig }) {
  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-4"
      style={{
        borderColor: GOLD_BORDER,
        backgroundColor: CREAM,
        boxShadow: '0 1px 12px rgba(212,160,23,0.08)',
      }}
    >
      {/* VM Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server size={20} style={{ color: GOLD }} />
          <h2 className="text-lg font-bold" style={{ color: TEXT }}>
            {vm.title}
          </h2>
          <StatusIndicator status={vm.status} label={vm.status === 'active' ? 'Online' : 'Offline'} size="sm" />
        </div>
      </div>

      {/* Metrics bar */}
      <div className="flex flex-wrap gap-3">
        {vm.metrics.map((m) => (
          <div
            key={m.label}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium"
            style={{ backgroundColor: GOLD_LIGHT, color: TEXT }}
          >
            {m.icon}
            <span className="font-semibold">{m.label}:</span> {m.value}
          </div>
        ))}
      </div>

      {/* Agent cards */}
      <div className="space-y-3">
        {vm.agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CommandCenter() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM }}>
      <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="p-2.5 rounded-xl"
              style={{ backgroundColor: GOLD }}
            >
              <Activity size={22} color="#fff" />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: TEXT }}>
              Mission Control
            </h1>
          </div>
          <p className="text-sm ml-[52px]" style={{ color: '#888' }}>
            Monitor and interact with all agents across your VM environments
          </p>
        </div>

        {/* Two VM screens side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {VMS.map((vm) => (
            <VMScreen key={vm.id} vm={vm} />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-xs" style={{ color: '#bbb' }}>
            Stud-Ex Mission Control &mdash; Real-time agent orchestration
          </p>
        </div>
      </main>
    </div>
  );
}
