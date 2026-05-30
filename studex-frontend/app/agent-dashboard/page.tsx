'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bot, Zap, Mail, BarChart3, Package, FileText, Send, MessageCircle,
  Hash, Loader2, CheckCircle, AlertCircle, ChevronRight, Brain, Users,
  DollarSign, RefreshCw,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'command' | 'email' | 'ask' | 'channels';

interface ChatMessage {
  role: 'user' | 'agent';
  text: string;
}

interface CampaignResult {
  sent: number;
  failed: number;
  total: number;
}

// ─── Templates ────────────────────────────────────────────────────────────────

const EMAIL_TEMPLATES = [
  { id: 'biltong_promo', name: 'Biltong Promo', subject: 'Premium Biltong — 15% Off This Week Only' },
  { id: 'wagyu_box', name: 'Wagyu Box', subject: 'Your Monthly Wagyu Box Is Ready to Ship' },
  { id: 'ankole_intro', name: 'Ankole Intro', subject: 'Introducing Ankole Beef — Heritage Meets Quality' },
] as const;

const QUICK_QUESTIONS = [
  'What should we promote?',
  'Revenue this month?',
  'Which customers are lapsed?',
  'Write me a campaign',
] as const;

const PLACEHOLDER_REPORTS = [
  { date: '2026-05-30', channel: 'Slack', title: 'Daily Ops Report', status: 'Delivered' },
  { date: '2026-05-29', channel: 'Discord', title: 'Revenue Analysis', status: 'Delivered' },
  { date: '2026-05-29', channel: 'Slack', title: 'Inventory Alert — Low Wagyu Patties', status: 'Delivered' },
  { date: '2026-05-28', channel: 'Discord', title: 'Email Campaign Summary — Biltong Promo', status: 'Delivered' },
  { date: '2026-05-27', channel: 'Slack', title: 'Weekly Revenue Report', status: 'Delivered' },
] as const;

// ─── Workflow Definitions ─────────────────────────────────────────────────────

const WORKFLOWS = [
  {
    id: 'daily_report',
    title: 'Daily Report',
    description: 'Generate + send daily ops report to Slack/Discord',
    icon: FileText,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    id: 'generate_content',
    title: 'Generate Content',
    description: 'Create social/email content from store data',
    icon: Brain,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    id: 'run_email_campaign',
    title: 'Email Campaign',
    description: 'Send mass email using AgentMail templates',
    icon: Mail,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    id: 'revenue_analysis',
    title: 'Revenue Analysis',
    description: 'Analyze revenue and suggest optimizations',
    icon: DollarSign,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    id: 'inventory_check',
    title: 'Inventory Check',
    description: 'Check stock levels + alert on issues',
    icon: Package,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    id: 'invoice_pipeline',
    title: 'Invoice Pipeline',
    description: 'Process pending invoices via QuickBooks',
    icon: BarChart3,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function AgentDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('command');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<any>(null);

  // Email tab state
  const [selectedTemplate, setSelectedTemplate] = useState<string>(EMAIL_TEMPLATES[0].id);
  const [recipients, setRecipients] = useState('');
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignResult, setCampaignResult] = useState<CampaignResult | null>(null);

  // Chat tab state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'agent', text: 'I\'m CashClaw, your AI operations agent. Ask me anything about StudEx Meat — revenue, inventory, campaigns, customer insights, or what we should do next.' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Channel test state
  const [slackTesting, setSlackTesting] = useState(false);
  const [discordTesting, setDiscordTesting] = useState(false);
  const [channelResults, setChannelResults] = useState<Record<string, any>>({});

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ─── API Helpers ──────────────────────────────────────────────────────────

  async function callAgent(action: string, extra: Record<string, any> = {}) {
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    });
    return res.json();
  }

  // ─── Command Center Actions ───────────────────────────────────────────────

  async function runWorkflow(actionId: string) {
    setActionLoading(actionId);
    setActionResult(null);
    try {
      const result = await callAgent(actionId);
      setActionResult(result);
    } catch (err: any) {
      setActionResult({ error: err.message || 'Failed to reach agent' });
    } finally {
      setActionLoading(null);
    }
  }

  // ─── Email Campaign ──────────────────────────────────────────────────────

  async function sendCampaign() {
    const recipientList = recipients
      .split('\n')
      .map((e) => e.trim())
      .filter((e) => e.length > 0 && e.includes('@'));

    if (recipientList.length === 0) return;

    setCampaignLoading(true);
    setCampaignResult(null);
    try {
      const result = await callAgent('run_email_campaign', {
        template: selectedTemplate,
        recipients: recipientList,
      });
      setCampaignResult({
        sent: result.campaign?.campaign?.sent || result.campaign?.sent || 0,
        failed: result.campaign?.campaign?.failed || result.campaign?.failed || 0,
        total: recipientList.length,
      });
    } catch {
      setCampaignResult({ sent: 0, failed: recipientList.length, total: recipientList.length });
    } finally {
      setCampaignLoading(false);
    }
  }

  // ─── Chat ─────────────────────────────────────────────────────────────────

  async function sendChat(message?: string) {
    const msg = (message || chatInput).trim();
    if (!msg || chatLoading) return;

    setChatMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const result = await callAgent('ask_agent', { question: msg });
      setChatMessages((prev) => [
        ...prev,
        { role: 'agent', text: result.answer || result.error || 'No response received.' },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'agent', text: 'Connection error. Please try again.' },
      ]);
    } finally {
      setChatLoading(false);
      chatInputRef.current?.focus();
    }
  }

  // ─── Channel Tests ────────────────────────────────────────────────────────

  async function testChannel(channel: 'slack' | 'discord') {
    const setter = channel === 'slack' ? setSlackTesting : setDiscordTesting;
    setter(true);
    try {
      const action = channel === 'slack' ? 'report_slack' : 'report_discord';
      const result = await callAgent(action, {
        message: `CashClaw test message — ${new Date().toLocaleString()}`,
      });
      setChannelResults((prev) => ({ ...prev, [channel]: result }));
    } catch (err: any) {
      setChannelResults((prev) => ({ ...prev, [channel]: { error: err.message } }));
    } finally {
      setter(false);
    }
  }

  // ─── Tabs Config ──────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'command', label: 'Command Center', icon: <Zap size={14} /> },
    { id: 'email', label: 'Email Campaigns', icon: <Mail size={14} /> },
    { id: 'ask', label: 'Ask CashClaw', icon: <MessageCircle size={14} /> },
    { id: 'channels', label: 'Channels', icon: <Hash size={14} /> },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-gray-900">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-[#D4A017]/20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#D4A017]/20 to-[#8B6914]/10">
                <Bot size={22} className="text-[#D4A017]" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wide text-gray-900">CASHCLAW</h1>
                <p className="text-xs text-gray-500 tracking-wider">AI Operations Agent</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-emerald-700">Online</span>
            </div>
          </div>
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-[#D4A017]/40 to-transparent" />
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-100">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.id
                  ? 'bg-[#FFF8F0] text-[#8B6914] shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab 1: Command Center ──────────────────────────────────────── */}
        {activeTab === 'command' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {WORKFLOWS.map((wf) => {
                const Icon = wf.icon;
                const isLoading = actionLoading === wf.id;
                return (
                  <button
                    key={wf.id}
                    onClick={() => runWorkflow(wf.id)}
                    disabled={actionLoading !== null}
                    className="group text-left p-5 rounded-xl bg-white border border-gray-100 hover:border-[#D4A017]/30 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-lg ${wf.bg}`}>
                        {isLoading ? (
                          <Loader2 size={18} className="animate-spin text-gray-400" />
                        ) : (
                          <Icon size={18} className={wf.color} />
                        )}
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-gray-300 group-hover:text-[#D4A017] transition-colors mt-1"
                      />
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 mb-1">{wf.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{wf.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Response Panel */}
            {actionResult && (
              <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span className="text-xs font-medium text-gray-600">Agent Response</span>
                  </div>
                  <button
                    onClick={() => setActionResult(null)}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
                <pre className="p-5 text-xs leading-relaxed font-mono text-gray-700 overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">
                  {JSON.stringify(actionResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* ── Tab 2: Email Campaigns ─────────────────────────────────────── */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            {/* AgentMail Status */}
            <div className="rounded-xl bg-white border border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Mail size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">AgentMail</h3>
                    <p className="text-xs text-gray-500">Email campaign service</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-emerald-700">Connected</span>
                </div>
              </div>
            </div>

            {/* Template Selector */}
            <div className="rounded-xl bg-white border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Select Template</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {EMAIL_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      selectedTemplate === tmpl.id
                        ? 'border-[#D4A017] bg-[#D4A017]/5'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">{tmpl.name}</h4>
                    <p className="text-xs text-gray-500 italic">"{tmpl.subject}"</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipients */}
            <div className="rounded-xl bg-white border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Recipients</h3>
              <textarea
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="Enter email addresses, one per line..."
                rows={5}
                className="w-full rounded-lg border border-gray-200 bg-[#FFF8F0] px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/30 focus:border-[#D4A017]/50 resize-none font-mono"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">
                  {recipients.split('\n').filter((l) => l.trim().includes('@')).length} valid recipient(s)
                </span>
                <button
                  onClick={sendCampaign}
                  disabled={campaignLoading || !recipients.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D4A017] text-white text-sm font-medium hover:bg-[#8B6914] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {campaignLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Send Campaign
                </button>
              </div>
            </div>

            {/* Campaign Results */}
            {campaignResult && (
              <div className="rounded-xl bg-white border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-500" />
                  Campaign Results
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-gray-50">
                    <p className="text-2xl font-bold text-gray-900">{campaignResult.total}</p>
                    <p className="text-xs text-gray-500 mt-1">Total</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-emerald-50">
                    <p className="text-2xl font-bold text-emerald-600">{campaignResult.sent}</p>
                    <p className="text-xs text-emerald-600 mt-1">Sent</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-50">
                    <p className="text-2xl font-bold text-red-600">{campaignResult.failed}</p>
                    <p className="text-xs text-red-600 mt-1">Failed</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab 3: Ask CashClaw ────────────────────────────────────────── */}
        {activeTab === 'ask' && (
          <div className="rounded-xl bg-white border border-gray-100 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 260px)', minHeight: '480px' }}>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                      msg.role === 'agent'
                        ? 'bg-gradient-to-br from-[#D4A017]/20 to-[#8B6914]/10'
                        : 'bg-gray-100'
                    }`}
                  >
                    {msg.role === 'agent' ? (
                      <Bot size={14} className="text-[#D4A017]" />
                    ) : (
                      <Users size={14} className="text-gray-500" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'agent'
                        ? 'bg-[#FFF8F0] text-gray-700 border border-gray-100'
                        : 'bg-[#D4A017] text-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4A017]/20 to-[#8B6914]/10 flex items-center justify-center">
                    <Bot size={14} className="text-[#D4A017]" />
                  </div>
                  <div className="bg-[#FFF8F0] rounded-xl px-4 py-3 border border-gray-100">
                    <Loader2 size={16} className="animate-spin text-[#D4A017]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Questions */}
            <div className="px-5 pb-2 flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendChat(q)}
                  disabled={chatLoading}
                  className="px-3 py-1.5 rounded-full border border-[#D4A017]/20 bg-[#D4A017]/5 text-xs font-medium text-[#8B6914] hover:bg-[#D4A017]/10 transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  ref={chatInputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChat()}
                  placeholder="Ask CashClaw anything..."
                  disabled={chatLoading}
                  className="flex-1 rounded-lg border border-gray-200 bg-[#FFF8F0] px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/30 focus:border-[#D4A017]/50 disabled:opacity-50"
                />
                <button
                  onClick={() => sendChat()}
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-4 py-2.5 rounded-lg bg-[#D4A017] text-white hover:bg-[#8B6914] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {chatLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 4: Channels ────────────────────────────────────────────── */}
        {activeTab === 'channels' && (
          <div className="space-y-6">
            {/* Slack Card */}
            <div className="rounded-xl bg-white border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50">
                    <Hash size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Slack</h3>
                    <p className="text-xs text-gray-500">Incoming webhook</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-emerald-700">Configured</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">Send a test message to verify the connection</p>
                <button
                  onClick={() => testChannel('slack')}
                  disabled={slackTesting}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {slackTesting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Send Test Message
                </button>
              </div>
              {channelResults.slack && (
                <div className="mt-3 p-3 rounded-lg bg-gray-50 text-xs font-mono text-gray-600">
                  {channelResults.slack.sent
                    ? 'Message delivered successfully.'
                    : channelResults.slack.skipped
                    ? `Skipped: ${channelResults.slack.reason}`
                    : `Error: ${channelResults.slack.error || 'Unknown error'}`}
                </div>
              )}
            </div>

            {/* Discord Card */}
            <div className="rounded-xl bg-white border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50">
                    <MessageCircle size={16} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Discord</h3>
                    <p className="text-xs text-gray-500">Webhook integration</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-emerald-700">Configured</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">Send a test message to verify the connection</p>
                <button
                  onClick={() => testChannel('discord')}
                  disabled={discordTesting}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {discordTesting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Send Test Message
                </button>
              </div>
              {channelResults.discord && (
                <div className="mt-3 p-3 rounded-lg bg-gray-50 text-xs font-mono text-gray-600">
                  {channelResults.discord.sent
                    ? 'Message delivered successfully.'
                    : channelResults.discord.skipped
                    ? `Skipped: ${channelResults.discord.reason}`
                    : `Error: ${channelResults.discord.error || 'Unknown error'}`}
                </div>
              )}
            </div>

            {/* Recent Reports Log */}
            <div className="rounded-xl bg-white border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <RefreshCw size={14} className="text-[#D4A017]" />
                Recent CashClaw Reports
              </h3>
              <div className="space-y-2">
                {PLACEHOLDER_REPORTS.map((report, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#FFF8F0] border border-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${report.channel === 'Slack' ? 'bg-purple-50' : 'bg-indigo-50'}`}>
                        {report.channel === 'Slack' ? (
                          <Hash size={12} className="text-purple-500" />
                        ) : (
                          <MessageCircle size={12} className="text-indigo-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{report.title}</p>
                        <p className="text-xs text-gray-400">{report.date} via {report.channel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle size={12} className="text-emerald-500" />
                      <span className="text-xs text-emerald-600">{report.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
