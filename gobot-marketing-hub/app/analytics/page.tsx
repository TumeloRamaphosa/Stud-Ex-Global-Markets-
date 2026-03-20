'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  Bot,
  Activity,
  Eye,
  Users,
  FileText,
  ArrowUpRight,
} from 'lucide-react';
import { PLATFORM_CONFIG, type DiagnosticType } from '@/lib/types';

const NAV_LINKS = [
  { href: '/content-hub', label: 'Content Hub' },
  { href: '/scheduler', label: 'Scheduler' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/automations', label: 'Automations' },
];

const DIAGNOSTICS: Record<DiagnosticType, { label: string; color: string; bg: string; action: string }> = {
  scale: {
    label: 'SCALE',
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/20 border-emerald-700/30',
    action: 'Create 3 variations immediately. Test different posting times. Expand to additional platforms. Never change the CTA.',
  },
  'fix-cta': {
    label: 'FIX CTA',
    color: 'text-amber-400',
    bg: 'bg-amber-900/20 border-amber-700/30',
    action: 'Hook is excellent. Test different CTAs on final slide. Verify app landing page matches slideshow promises.',
  },
  'fix-hooks': {
    label: 'FIX HOOKS',
    color: 'text-blue-400',
    bg: 'bg-blue-900/20 border-blue-700/30',
    action: 'Content converts well. Test radically different hook types. Try new posting times and different slide 1 images.',
  },
  'full-reset': {
    label: 'FULL RESET',
    color: 'text-rose-400',
    bg: 'bg-rose-900/20 border-rose-700/30',
    action: 'Neither hook nor conversion working. Try completely different format or audience angle. Research current niche trends.',
  },
};

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'diagnostics' | 'hooks'>('overview');

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-brand-700/20 bg-dark-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-gold flex items-center justify-center">
                <Bot size={20} className="text-dark-900" />
              </div>
              <span className="text-xl font-bold">Go<span className="text-brand-400">Bot</span></span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors ${
                    link.href === '/analytics' ? 'text-brand-400 font-medium' : 'text-dark-400 hover:text-brand-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 size={28} className="text-accent-violet" />
            Analytics & Intelligence
          </h1>
          <p className="text-dark-400 mt-1">Data-driven content optimization powered by the two-axis diagnostic framework</p>
        </div>

        {/* Metric Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Impressions', value: '—', icon: <Eye size={20} />, color: 'text-brand-400' },
            { label: 'Total Reach', value: '—', icon: <Users size={20} />, color: 'text-accent-teal' },
            { label: 'Posts Published', value: '—', icon: <TrendingUp size={20} />, color: 'text-emerald-400' },
            { label: 'Conversion Rate', value: '—', icon: <Target size={20} />, color: 'text-accent-violet' },
          ].map((metric, i) => (
            <div key={i} className="card-glass rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-dark-400 text-sm mb-1">{metric.label}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                </div>
                <span className={metric.color}>{metric.icon}</span>
              </div>
              <p className="text-dark-500 text-xs mt-3">Connect Airtable to see live data</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'overview' as const, label: 'Overview', icon: <BarChart3 size={16} /> },
            { id: 'diagnostics' as const, label: 'Diagnostic Framework', icon: <Activity size={16} /> },
            { id: 'hooks' as const, label: 'Hook Performance', icon: <Target size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-900/30 text-brand-400 border border-brand-700/50'
                  : 'text-dark-400 bg-dark-800/50 border border-dark-700/30'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="card-glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Performance Funnel</h2>
              <div className="space-y-3">
                {['Views → Profile Visits', 'Profile Visits → Link Clicks', 'Link Clicks → Downloads', 'Downloads → Trial', 'Trial → Paid'].map((stage, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-dark-800/50">
                    <span className="text-sm font-medium flex-1">{stage}</span>
                    <span className="text-dark-500 text-sm">—</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Conversion Benchmarks</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                  <span className="text-sm">Views-to-Download Baseline</span>
                  <span className="font-bold text-dark-300">1%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                  <span className="text-sm">Solid Performance</span>
                  <span className="font-bold text-emerald-400">1.5-3%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                  <span className="text-sm">Exceptional Results</span>
                  <span className="font-bold text-brand-400">3%+</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diagnostics' && (
          <div className="space-y-6">
            <div className="card-glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-2">Two-Axis Diagnostic Framework</h2>
              <p className="text-dark-400 text-sm mb-6">
                Classify post performance by Views (impressions) vs Conversions to determine the correct optimization action.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {(Object.entries(DIAGNOSTICS) as [DiagnosticType, typeof DIAGNOSTICS[DiagnosticType]][]).map(
                  ([type, config]) => (
                    <div key={type} className={`p-5 rounded-xl border ${config.bg}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.color} bg-dark-900/50`}>
                          {config.label}
                        </span>
                        <Zap size={16} className={config.color} />
                      </div>
                      <p className="text-sm text-dark-300 leading-relaxed">{config.action}</p>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="card-glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Decision Rules</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-emerald-900/10 border border-emerald-700/20">
                  <h3 className="font-bold text-emerald-400 mb-1">Growing (5K+/day)</h3>
                  <p className="text-sm text-dark-300">DOUBLE DOWN — Create 3 variations immediately</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-900/10 border border-blue-700/20">
                  <h3 className="font-bold text-blue-400 mb-1">Steady (1K-5K/day)</h3>
                  <p className="text-sm text-dark-300">Keep in rotation with minor adjustments</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-900/10 border border-amber-700/20">
                  <h3 className="font-bold text-amber-400 mb-1">Declining (&lt;1K/day)</h3>
                  <p className="text-sm text-dark-300">Try 1 more variation, then consider dropping</p>
                </div>
                <div className="p-4 rounded-lg bg-rose-900/10 border border-rose-700/20">
                  <h3 className="font-bold text-rose-400 mb-1">Consistently Low</h3>
                  <p className="text-sm text-dark-300">DROP — Try a radically different approach</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hooks' && (
          <div className="card-glass rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Hook Performance Tracker</h2>
            <div className="text-center py-12">
              <Target size={48} className="mx-auto text-dark-500 mb-4" />
              <p className="text-dark-400 mb-2">No hook data yet</p>
              <p className="text-dark-500 text-sm">Post content and track results to see hook analytics here. Data is stored in Airtable.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
