'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Brain, Bot, Zap, Send, MessageCircle, BarChart3, DollarSign, Users,
  TrendingUp, Target, Upload, Link2, Mail, Loader2, RefreshCw,
  ChevronRight, AlertTriangle, CheckCircle,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────── */

type Tab = 'insights' | 'strategy' | 'financial' | 'campaigns';
type ChatMsg = { role: 'user' | 'ai'; text: string };
type Provider = 'Claude' | 'Ollama' | 'OpenRouter';

/* ─── Strategy Room Page ─────────────────────────────────────────────── */

export default function StrategyRoom() {
  /* ── Left column state ──────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState<Tab>('insights');
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsData, setInsightsData] = useState<any>(null);

  // Strategy tab
  const [strategyText, setStrategyText] = useState('');
  const [strategyUrl, setStrategyUrl] = useState('');
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [strategyResult, setStrategyResult] = useState<string | null>(null);

  // Financial tab
  const [financialLoading, setFinancialLoading] = useState(false);
  const [financialResult, setFinancialResult] = useState<string | null>(null);

  /* ── Right column — chat state ──────────────────────────────────── */
  const [provider, setProvider] = useState<Provider>('Claude');
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      role: 'ai',
      text: "I'm CashClaw, your AI strategy advisor. I have access to your Shopify, QuickBooks, and marketing data. Ask me anything about growing StudEx Meat.",
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  /* ── API helpers ────────────────────────────────────────────────── */

  async function refreshInsights() {
    setInsightsLoading(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'daily_report' }),
      });
      const json = await res.json();
      setInsightsData(json);
    } catch {
      /* silent */
    } finally {
      setInsightsLoading(false);
    }
  }

  async function analyzeStrategy() {
    if (!strategyText.trim()) return;
    setStrategyLoading(true);
    setStrategyResult(null);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ask_agent', question: strategyText }),
      });
      const json = await res.json();
      setStrategyResult(json.answer || json.error || 'No response received.');
    } catch {
      setStrategyResult('Connection error. Please try again.');
    } finally {
      setStrategyLoading(false);
    }
  }

  async function runFinancialAnalysis() {
    setFinancialLoading(true);
    setFinancialResult(null);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revenue_analysis' }),
      });
      const json = await res.json();
      setFinancialResult(json.analysis || json.error || 'No analysis returned.');
    } catch {
      setFinancialResult('Connection error. Please try again.');
    } finally {
      setFinancialLoading(false);
    }
  }

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ask_agent',
          question: msg,
          provider: provider.toLowerCase(),
        }),
      });
      const json = await res.json();
      setChatMessages(prev => [
        ...prev,
        { role: 'ai', text: json.answer || json.error || 'No response' },
      ]);
    } catch {
      setChatMessages(prev => [
        ...prev,
        { role: 'ai', text: 'Connection error. Please try again.' },
      ]);
    } finally {
      setChatLoading(false);
      chatInputRef.current?.focus();
    }
  }

  /* ── Revenue bar chart data (placeholder) ───────────────────────── */

  const revenueMonths = [
    { label: 'Dec', value: 142000 },
    { label: 'Jan', value: 158000 },
    { label: 'Feb', value: 136000 },
    { label: 'Mar', value: 174000 },
    { label: 'Apr', value: 165000 },
    { label: 'May', value: 189000 },
  ];
  const maxRevenue = Math.max(...revenueMonths.map(m => m.value));

  /* ── Tab config ─────────────────────────────────────────────────── */

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'insights', label: 'Agent Insights', icon: <Brain size={14} /> },
    { id: 'strategy', label: 'Test Strategy', icon: <Target size={14} /> },
    { id: 'financial', label: 'Financial Overview', icon: <BarChart3 size={14} /> },
    { id: 'campaigns', label: 'Campaigns', icon: <Mail size={14} /> },
  ];

  /* ── Quick question pills ───────────────────────────────────────── */

  const quickQuestions = [
    'What should we promote this week?',
    'Analyze our margins',
    'Which customers are lapsed?',
    'Create a Facebook ad strategy',
    'Revenue forecast for next month',
  ];

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-gray-900 flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#D4A017]/30 to-transparent">
            <Brain size={20} className="text-[#D4A017]" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide">STRATEGY ROOM</h1>
            <p className="text-xs text-gray-500">AI-Powered Business Intelligence</p>
          </div>
        </div>
      </header>

      {/* ── Main layout: two columns ──────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ═══════════════════════════════════════════════════════════
            LEFT COLUMN — Strategy Panels
           ═══════════════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Tab navigation */}
          <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === t.id
                    ? 'bg-[#FFF8F0] text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* ── Tab 1: Agent Insights ──────────────────────────────── */}
          {activeTab === 'insights' && (
            <div className="space-y-4">
              {/* CashClaw Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-l-4 border-[#D4A017] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot size={18} className="text-[#D4A017]" />
                    <span className="font-bold text-sm">CashClaw</span>
                    <span className="text-xs text-gray-500">Store Operations</span>
                  </div>
                  {insightsData?.report?.aiAnalysis ? (
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                      {insightsData.report.aiAnalysis}
                    </pre>
                  ) : (
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>3 invoices pending, R86,250 unfulfilled order value.</p>
                      <p>
                        Biltong margin:{' '}
                        <span className="font-semibold text-[#D4A017]">35%</span>.
                        Recommend: push biltong campaign this week.
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                        <AlertTriangle size={12} />
                        <span>Wagyu Burger Patties stock low (-248 units)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Hermes Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-l-4 border-[#D4A017] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={18} className="text-[#D4A017]" />
                    <span className="font-bold text-sm">Hermes</span>
                    <span className="text-xs text-gray-500">Content Strategy</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      Instagram engagement down{' '}
                      <span className="font-semibold text-red-500">12%</span> this week.
                    </p>
                    <p>
                      Recommend: 3 reels this week focusing on biltong preparation
                      process. Behind-the-scenes content drives 2.4x more saves.
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                      <TrendingUp size={12} />
                      <span>Email open rate up 8% after last campaign</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Refresh button */}
              <button
                onClick={refreshInsights}
                disabled={insightsLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#D4A017]/30 text-[#D4A017] font-medium text-sm hover:bg-[#D4A017]/5 transition-colors disabled:opacity-50"
              >
                {insightsLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                {insightsLoading ? 'Refreshing...' : 'Refresh Insights'}
              </button>
            </div>
          )}

          {/* ── Tab 2: Test Strategy ──────────────────────────────── */}
          {activeTab === 'strategy' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                  <Target size={16} className="text-[#D4A017]" />
                  Describe Your Strategy
                </h3>

                {/* Strategy textarea */}
                <textarea
                  value={strategyText}
                  onChange={e => setStrategyText(e.target.value)}
                  placeholder='Describe your strategy... (e.g., "Run 15% discount on biltong for 2 weeks")'
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 bg-[#FFF8F0] px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#D4A017]/40 focus:outline-none resize-none mb-4"
                />

                {/* File upload area */}
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-[#D4A017]/30 transition-colors cursor-pointer mb-4">
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Drop a file or paste a link</p>
                  <p className="text-xs text-gray-400 mt-1">
                    CSV, PDF, or image files supported
                  </p>
                </div>

                {/* URL input */}
                <div className="flex items-center gap-2 mb-4">
                  <Link2 size={16} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="url"
                    value={strategyUrl}
                    onChange={e => setStrategyUrl(e.target.value)}
                    placeholder="Paste a competitor link or data source"
                    className="flex-1 rounded-lg border border-gray-200 bg-[#FFF8F0] px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#D4A017]/40 focus:outline-none"
                  />
                </div>

                {/* Analyze button */}
                <button
                  onClick={analyzeStrategy}
                  disabled={strategyLoading || !strategyText.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#D4A017] to-[#B8860B] text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {strategyLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Brain size={16} />
                  )}
                  {strategyLoading ? 'Analyzing...' : 'Analyze Strategy'}
                </button>
              </div>

              {/* Strategy result */}
              {strategyResult && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="font-bold text-sm">Analysis Result</span>
                  </div>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {strategyResult}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* ── Tab 3: Financial Overview ─────────────────────────── */}
          {activeTab === 'financial' && (
            <div className="space-y-4">
              {/* Metric cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={14} className="text-[#D4A017]" />
                    <span className="text-xs text-gray-500">Monthly Revenue</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">R189,000</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp size={10} /> +14.5% vs last month
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 size={14} className="text-[#D4A017]" />
                    <span className="text-xs text-gray-500">Avg Order Value</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">R4,850</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp size={10} /> +6% vs last month
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={14} className="text-[#D4A017]" />
                    <span className="text-xs text-gray-500">Active Customers</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">47</p>
                  <p className="text-xs text-gray-400 mt-1">12 new this month</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span className="text-xs text-gray-500">Margin Alert</span>
                  </div>
                  <p className="text-lg font-bold text-amber-600">3 products</p>
                  <p className="text-xs text-amber-500 mt-1">below cost threshold</p>
                </div>
              </div>

              {/* Bar chart — div-based */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                  <BarChart3 size={16} className="text-[#D4A017]" />
                  6-Month Revenue
                </h3>
                <div className="flex items-end gap-3 h-40">
                  {revenueMonths.map(m => {
                    const heightPct = (m.value / maxRevenue) * 100;
                    return (
                      <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-gray-500 font-medium">
                          R{(m.value / 1000).toFixed(0)}k
                        </span>
                        <div className="w-full relative" style={{ height: '120px' }}>
                          <div
                            className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-[#D4A017] to-[#D4A017]/60 transition-all duration-500"
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Run analysis button */}
              <button
                onClick={runFinancialAnalysis}
                disabled={financialLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#D4A017] to-[#B8860B] text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {financialLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <DollarSign size={16} />
                )}
                {financialLoading ? 'Analyzing...' : 'Run Full Analysis'}
              </button>

              {/* Financial analysis result */}
              {financialResult && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="font-bold text-sm">Revenue Analysis</span>
                  </div>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {financialResult}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* ── Tab 4: Campaigns ──────────────────────────────────── */}
          {activeTab === 'campaigns' && (
            <div className="space-y-4">
              {/* Active campaigns */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Mail size={16} className="text-[#D4A017]" />
                    Active Campaigns
                  </h3>
                </div>

                {/* Campaign: Biltong Promo */}
                <div className="p-4 border-b border-gray-100 hover:bg-[#FFF8F0]/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Biltong Promo</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      Draft
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users size={12} /> 150 recipients
                    </span>
                    <span className="flex items-center gap-1">
                      <Target size={12} /> Biltong buyers segment
                    </span>
                  </div>
                </div>

                {/* Campaign: Winter Wagyu Box */}
                <div className="p-4 hover:bg-[#FFF8F0]/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Winter Wagyu Box</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                      Scheduled
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users size={12} /> 200 recipients
                    </span>
                    <span className="flex items-center gap-1">
                      <Target size={12} /> All customers
                    </span>
                  </div>
                </div>
              </div>

              {/* Campaign performance */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                  <BarChart3 size={16} className="text-[#D4A017]" />
                  Last Campaign Performance
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-[#FFF8F0]">
                    <p className="text-xl font-bold text-gray-900">312</p>
                    <p className="text-xs text-gray-500">Sent</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#FFF8F0]">
                    <p className="text-xl font-bold text-[#D4A017]">68%</p>
                    <p className="text-xs text-gray-500">Opened</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#FFF8F0]">
                    <p className="text-xl font-bold text-green-600">24%</p>
                    <p className="text-xs text-gray-500">Clicked</p>
                  </div>
                </div>
              </div>

              {/* Create campaign button */}
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#D4A017] to-[#B8860B] text-white font-medium text-sm hover:opacity-90 transition-opacity">
                <Mail size={16} />
                Create Campaign
              </button>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            RIGHT COLUMN — AI Chat
           ═══════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-[420px] border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col bg-white flex-shrink-0">
          {/* Chat header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-[#D4A017]" />
              <span className="font-bold text-sm">Chat with CashClaw</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
            </div>
            {/* Provider selector */}
            <select
              value={provider}
              onChange={e => setProvider(e.target.value as Provider)}
              className="text-xs rounded-lg border border-gray-200 bg-[#FFF8F0] px-2 py-1.5 text-gray-700 focus:border-[#D4A017]/40 focus:outline-none cursor-pointer"
            >
              <option value="Claude">Claude</option>
              <option value="Ollama">Ollama</option>
              <option value="OpenRouter">OpenRouter</option>
            </select>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[600px] lg:max-h-none">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#D4A017]/15 text-gray-900 rounded-br-md'
                      : 'bg-[#FFF8F0] text-gray-700 rounded-bl-md border border-gray-100'
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-[#FFF8F0] p-3 rounded-2xl rounded-bl-md border border-gray-100">
                  <Loader2 size={16} className="animate-spin text-[#D4A017]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick question pills */}
          <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto flex-shrink-0">
            {quickQuestions.map(q => (
              <button
                key={q}
                onClick={() => setChatInput(q)}
                className="text-[10px] px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:text-[#D4A017] hover:border-[#D4A017]/30 whitespace-nowrap transition-colors flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat input */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex gap-2">
              <input
                ref={chatInputRef}
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Ask CashClaw anything..."
                className="flex-1 rounded-xl border border-gray-200 bg-[#FFF8F0] px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#D4A017]/40 focus:outline-none"
              />
              <button
                onClick={sendChat}
                disabled={chatLoading || !chatInput.trim()}
                className="p-2.5 rounded-xl bg-[#D4A017]/20 text-[#D4A017] hover:bg-[#D4A017]/30 disabled:opacity-50 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
