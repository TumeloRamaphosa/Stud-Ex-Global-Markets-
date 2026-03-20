'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Megaphone,
  Calendar,
  BarChart3,
  Zap,
  Send,
  Clock,
  Layers,
  ArrowRight,
  Bot,
  Globe,
  Database,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-brand-700/20 bg-dark-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-gold flex items-center justify-center">
                <Bot size={20} className="text-dark-900" />
              </div>
              <span className="text-xl font-bold">
                Go<span className="text-brand-400">Bot</span> Marketing Hub
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/content-hub" className="text-sm text-dark-400 hover:text-brand-400 transition-colors">Content Hub</Link>
              <Link href="/scheduler" className="text-sm text-dark-400 hover:text-brand-400 transition-colors">Scheduler</Link>
              <Link href="/analytics" className="text-sm text-dark-400 hover:text-brand-400 transition-colors">Analytics</Link>
              <Link href="/automations" className="text-sm text-dark-400 hover:text-brand-400 transition-colors">Automations</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-900/30 border border-brand-700/30 text-brand-400 text-sm mb-6">
          <Zap size={14} />
          Powered by Blotato + n8n + Airtable
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
          Automated Marketing<br />
          <span className="bg-gradient-gold bg-clip-text text-transparent">Content Hub</span>
        </h1>

        <p className="text-dark-400 text-lg max-w-2xl mx-auto mb-10">
          Create viral slideshows, post to 9+ platforms in one click via Blotato,
          track everything in Airtable, and automate the entire pipeline with n8n.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/content-hub"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-gold text-dark-900 font-bold hover:shadow-glow-gold transition-all"
          >
            <Megaphone size={20} />
            Open Content Hub
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/scheduler"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-brand-700/30 text-brand-400 font-medium hover:bg-brand-900/20 transition-all"
          >
            <Calendar size={20} />
            View Schedule
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/content-hub" className="card-glass rounded-xl p-6 transition-all hover:translate-y-[-2px]">
            <div className="w-12 h-12 rounded-lg bg-brand-900/30 flex items-center justify-center mb-4">
              <Megaphone size={24} className="text-brand-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Content Hub</h3>
            <p className="text-dark-400 text-sm">
              Create posts with hook templates, AI slideshows, and multi-platform distribution via Blotato.
            </p>
          </Link>

          <Link href="/scheduler" className="card-glass rounded-xl p-6 transition-all hover:translate-y-[-2px]">
            <div className="w-12 h-12 rounded-lg bg-accent-teal/10 flex items-center justify-center mb-4">
              <Calendar size={24} className="text-accent-teal" />
            </div>
            <h3 className="text-lg font-bold mb-2">Scheduler</h3>
            <p className="text-dark-400 text-sm">
              Plan and schedule content in Airtable. Track every post from draft to published.
            </p>
          </Link>

          <Link href="/analytics" className="card-glass rounded-xl p-6 transition-all hover:translate-y-[-2px]">
            <div className="w-12 h-12 rounded-lg bg-accent-violet/10 flex items-center justify-center mb-4">
              <BarChart3 size={24} className="text-accent-violet" />
            </div>
            <h3 className="text-lg font-bold mb-2">Analytics</h3>
            <p className="text-dark-400 text-sm">
              Two-axis diagnostic framework. Track impressions, conversions, and hook performance.
            </p>
          </Link>

          <Link href="/automations" className="card-glass rounded-xl p-6 transition-all hover:translate-y-[-2px]">
            <div className="w-12 h-12 rounded-lg bg-accent-emerald/10 flex items-center justify-center mb-4">
              <Zap size={24} className="text-accent-emerald" />
            </div>
            <h3 className="text-lg font-bold mb-2">Automations</h3>
            <p className="text-dark-400 text-sm">
              n8n workflows for scheduled posting, analytics collection, and daily diagnostic reports.
            </p>
          </Link>
        </div>
      </section>

      {/* Integration Stack */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="card-glass rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Integration Stack</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-brand-900/30 flex items-center justify-center mx-auto mb-4">
                <Send size={28} className="text-brand-400" />
              </div>
              <h3 className="font-bold mb-2">Blotato</h3>
              <p className="text-dark-400 text-sm">
                Post to TikTok, Instagram, YouTube, LinkedIn, X, Threads, Facebook, Pinterest, Bluesky — 9 platforms in one API call.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent-teal/10 flex items-center justify-center mx-auto mb-4">
                <Database size={28} className="text-accent-teal" />
              </div>
              <h3 className="font-bold mb-2">Airtable</h3>
              <p className="text-dark-400 text-sm">
                Content calendar, scheduled plans, analytics tracking, and automation logs — all in structured tables.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent-emerald/10 flex items-center justify-center mx-auto mb-4">
                <Zap size={28} className="text-accent-emerald" />
              </div>
              <h3 className="font-bold mb-2">n8n</h3>
              <p className="text-dark-400 text-sm">
                Automated workflows: scheduled posting at 7:30/16:30/21:00, daily analytics, diagnostic reports, and content queue processing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-700/10 py-8 text-center text-dark-500 text-sm">
        GoBot Marketing Hub — Studex Global Markets
      </footer>
    </div>
  );
}
