'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useEffect, useState } from 'react';
import {
  Cpu, Shield, Zap, Radio, Atom, Rocket,
  ChevronRight, Terminal, Users, TrendingUp,
  BarChart3, MessageSquare, Clock, Globe,
} from 'lucide-react';

const features = [
  {
    icon: Cpu,
    title: 'AGENT SWARM CONTROL',
    description: 'Deploy and orchestrate 43 AI agents that create, post, and optimise your marketing automatically.',
    color: '#ff1493',
  },
  {
    icon: Globe,
    title: 'NEURAL WAREHOUSE',
    description: 'Distributed storage for all generated content — images, videos, slideshows — synced to Google Drive.',
    color: '#00ffff',
  },
  {
    icon: Radio,
    title: 'REAL-TIME TELEMETRY',
    description: 'Live monitoring of views, likes, shares, conversions, and revenue across all 10+ platforms.',
    color: '#9d00ff',
  },
  {
    icon: Rocket,
    title: 'AUTONOMOUS DEPLOYMENT',
    description: 'Zero-touch content publishing to TikTok, Instagram, YouTube, LinkedIn, Facebook, and more.',
    color: '#ff1493',
  },
  {
    icon: Shield,
    title: 'CYBER SECURITY MESH',
    description: 'Enterprise-grade Firebase auth, encrypted messaging, and secure deal pipeline tracking.',
    color: '#00ffff',
  },
  {
    icon: Atom,
    title: 'QUANTUM SYNC',
    description: 'Instant analytics synchronisation. Daily AI reports by 7AM. Two-axis diagnostic framework.',
    color: '#9d00ff',
  },
];

const stats = [
  { label: 'AGENTS ONLINE', value: '43', suffix: '' },
  { label: 'VIEWS GENERATED', value: '7', suffix: 'M+' },
  { label: 'PLATFORMS', value: '10', suffix: '+' },
  { label: 'FOLLOWERS BUILT', value: '1', suffix: 'M+' },
];

const techSpecs = [
  { label: 'AI AGENTS', value: '43 AUTONOMOUS' },
  { label: 'HOOK FORMULAS', value: '7 PSYCHOLOGICAL' },
  { label: 'RESPONSE TIME', value: '<10ms' },
  { label: 'PROTOCOLS', value: 'NEURAL-LINK v4.2' },
  { label: 'PLATFORMS', value: 'TIKTOK + 9 MORE' },
  { label: 'IMAGE GEN', value: 'GEMINI 3 PRO' },
  { label: 'VIDEO ENGINE', value: 'REMOTION REACT' },
  { label: 'REVENUE TRACK', value: 'REVENUECAT' },
];

function AnimatedCounter({ value, suffix }: { value: string; suffix: string }) {
  const [count, setCount] = useState(0);
  const target = parseInt(value);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>
      {count}{suffix}
    </span>
  );
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white scanlines">
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-30" />

      {/* Gradient Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(255,20,147,0.15)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(0,255,255,0.08)_0%,transparent_70%)]" />
      </div>

      {/* ===== NAVIGATION ===== */}
      <nav className="fixed top-0 left-0 right-0 z-40 glass-cyber">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl md:text-3xl font-orbitron font-black neon-pink neon-flicker tracking-wider">
              $TUD#X
            </div>
            <span className="hidden sm:block text-sm font-mono text-gray-500 mt-1">D#V0P$</span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-orbitron text-sm tracking-widest">
            <a href="#agents" className="text-gray-400 hover:text-[#ff1493] hover:no-underline transition-colors">AGENTS</a>
            <a href="#warehouse" className="text-gray-400 hover:text-[#ff1493] hover:no-underline transition-colors">WAREHOUSE</a>
            <a href="#specs" className="text-gray-400 hover:text-[#ff1493] hover:no-underline transition-colors">SPECS</a>
            <a href="#deploy" className="text-gray-400 hover:text-[#ff1493] hover:no-underline transition-colors">DEPLOY</a>
            <a href="/meat-dashboard" className="text-[#C9A84C] hover:text-[#e8c97a] hover:no-underline transition-colors border border-[#C9A84C]/30 px-3 py-1 rounded">MEAT</a>
          </div>

          <button
            onClick={() => router.push('/signup')}
            className="cyber-btn !py-2 !px-6 !text-sm"
          >
            JACK IN
          </button>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-transparent to-[#1a1a2e] z-10 pointer-events-none" />

        <div className="relative z-20 max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className={`inline-block mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-[#ff1493]/30 bg-[#ff1493]/10 font-mono text-[#ff1493] text-base">
              <span className="w-2 h-2 rounded-full bg-[#ff1493] animate-pulse" />
              NEURAL NETWORK COMMAND CENTER
            </div>
          </div>

          {/* Main Headline */}
          <h1 className={`font-orbitron font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none mb-8 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="block text-white">$TUD#X D#V0P$</span>
            <span className="block mt-4 text-gradient-cyber text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              @GENT COMMAND
            </span>
            <span className="block mt-2 text-3xl sm:text-4xl md:text-5xl text-gray-400 font-rajdhani font-light tracking-wider">
              SERVER WAREHOUSE
            </span>
          </h1>

          {/* Tagline */}
          <p className={`text-2xl sm:text-3xl md:text-4xl font-rajdhani font-semibold tracking-[0.3em] text-[#00ffff] mb-12 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            DEPLOY. MONITOR. DOMINATE.
          </p>

          {/* Description */}
          <p className={`text-xl sm:text-2xl text-gray-300 font-rajdhani max-w-3xl mx-auto mb-12 leading-relaxed transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            43 autonomous AI agents that create viral content, publish to 10+ platforms,
            track performance, and optimise your marketing — all while you sleep.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-6 justify-center transition-all duration-700 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <button
              onClick={() => router.push('/signup')}
              className="cyber-btn text-lg"
            >
              INITIALIZE AGENTS <ChevronRight className="inline ml-2" size={20} />
            </button>
            <button
              onClick={() => router.push('/larry-skill')}
              className="cyber-btn-secondary text-lg"
            >
              VIEW WAREHOUSE
            </button>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="relative z-20 border-y border-[#ff1493]/20 bg-[#1a1a2e]/90 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="group">
                <div className="text-4xl sm:text-5xl md:text-6xl font-orbitron font-black neon-pink mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-base sm:text-lg font-mono text-gray-500 tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES / COMMAND MODULES ===== */}
      <section id="agents" className="relative z-20 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-black text-4xl sm:text-5xl md:text-6xl neon-pink mb-6">
              COMMAND MODULES
            </h2>
            <p className="text-xl sm:text-2xl font-rajdhani text-gray-400 max-w-2xl mx-auto">
              Military-grade infrastructure for next-gen AI marketing operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="cyber-card rounded-xl p-8 group"
                >
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `${feature.color}15`,
                      boxShadow: `0 0 20px ${feature.color}20`,
                    }}
                  >
                    <Icon size={32} style={{ color: feature.color }} />
                  </div>
                  <h3
                    className="text-2xl font-orbitron font-bold mb-4 tracking-wide"
                    style={{ color: feature.color }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-xl font-rajdhani text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== WAREHOUSE SECTION ===== */}
      <section id="warehouse" className="relative z-20 px-6 py-24 border-y border-[#9d00ff]/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-black text-4xl sm:text-5xl md:text-6xl mb-6">
              <span className="neon-cyan">THE WAREHOUSE</span>
            </h2>
            <p className="text-xl sm:text-2xl font-rajdhani text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Where AI agents come to life. Our Larry Engine houses 43 autonomous agents,
              each running the full marketing pipeline from hook generation to revenue tracking.
            </p>
          </div>

          {/* Pipeline Visualization */}
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {[
              { icon: Zap, label: 'HOOK GEN', color: '#ff1493' },
              { icon: BarChart3, label: 'SLIDES', color: '#9d00ff' },
              { icon: Globe, label: 'IMAGES', color: '#00ffff' },
              { icon: MessageSquare, label: 'OVERLAYS', color: '#ff1493' },
              { icon: Rocket, label: 'PUBLISH', color: '#9d00ff' },
              { icon: TrendingUp, label: 'ANALYTICS', color: '#00ffff' },
            ].map((step, i) => (
              <div key={i} className="text-center group">
                <div
                  className="w-20 h-20 mx-auto rounded-xl flex items-center justify-center mb-4 border transition-all duration-300 group-hover:scale-110"
                  style={{
                    borderColor: `${step.color}40`,
                    background: `${step.color}10`,
                    boxShadow: `0 0 20px ${step.color}10`,
                  }}
                >
                  <step.icon size={36} style={{ color: step.color }} />
                </div>
                <div className="font-orbitron text-base font-bold tracking-wider" style={{ color: step.color }}>
                  {step.label}
                </div>
                {i < 5 && (
                  <div className="hidden lg:block absolute right-0 top-1/2 text-gray-600">→</div>
                )}
              </div>
            ))}
          </div>

          {/* Terminal Readout */}
          <div className="rounded-xl border border-[#00ffff]/20 bg-[#1a1a2e]/90 p-8 font-mono">
            <div className="flex items-center gap-3 mb-6">
              <Terminal size={24} className="text-[#00ffff]" />
              <span className="text-[#00ffff] text-lg font-bold tracking-wider">AGENT STATUS — LIVE</span>
              <span className="ml-auto w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="space-y-3 text-base sm:text-lg">
              <div className="flex justify-between text-green-400">
                <span>&gt; larry_marketing_engine</span>
                <span>[ONLINE] — 43 agents active</span>
              </div>
              <div className="flex justify-between text-green-400">
                <span>&gt; nano_banana_image_gen</span>
                <span>[ONLINE] — Gemini 3 Pro ready</span>
              </div>
              <div className="flex justify-between text-green-400">
                <span>&gt; remotion_video_engine</span>
                <span>[ONLINE] — React renderer active</span>
              </div>
              <div className="flex justify-between text-yellow-400">
                <span>&gt; upload_post_distributor</span>
                <span>[STANDBY] — 10 platforms connected</span>
              </div>
              <div className="flex justify-between text-green-400">
                <span>&gt; analytics_loop</span>
                <span>[ONLINE] — Daily reports 7:00 AM</span>
              </div>
              <div className="flex justify-between text-[#ff1493]">
                <span>&gt; competitor_research</span>
                <span>[SCANNING] — TikTok niche analysis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TECH SPECS ===== */}
      <section id="specs" className="relative z-20 px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-black text-4xl sm:text-5xl md:text-6xl neon-purple mb-6">
              SYSTEM ARCHITECTURE
            </h2>
            <p className="text-xl sm:text-2xl font-rajdhani text-gray-400">
              Built for the future. Deployed today.
            </p>
          </div>

          {/* ASCII-style Terminal */}
          <div className="rounded-xl border border-[#9d00ff]/30 bg-[#1a1a2e] p-8 sm:p-10 font-mono">
            <div className="text-[#9d00ff] text-base mb-6 tracking-wider">
              ╔══════════════════════════════════════════════╗<br />
              ║&nbsp;&nbsp;STUDEX SYSTEM SPECS v4.2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;║<br />
              ╚══════════════════════════════════════════════╝
            </div>
            <div className="space-y-4">
              {techSpecs.map((spec, i) => (
                <div key={i} className="flex justify-between items-center text-lg sm:text-xl border-b border-[#9d00ff]/10 pb-3">
                  <span className="text-gray-500 font-bold">{spec.label}:</span>
                  <span className="text-[#00ffff] font-bold tracking-wider">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHAT YOU REPLACE ===== */}
      <section className="relative z-20 px-6 py-24 border-y border-[#ff1493]/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-black text-4xl sm:text-5xl neon-pink mb-6">
              10 TOOLS. ONE PLATFORM.
            </h2>
            <p className="text-xl sm:text-2xl font-rajdhani text-gray-400">
              You&apos;re paying $1,200 - $5,000/month for tools we replace
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { tool: 'Social Scheduler', replace: 'Auto-posting 10+ platforms', save: '$50-100' },
              { tool: 'Graphic Designer', replace: 'AI image generation', save: '$100-500' },
              { tool: 'Video Editor', replace: 'Remotion video engine', save: '$200-1,000' },
              { tool: 'Analytics Tool', replace: 'Built-in telemetry', save: '$100-300' },
              { tool: 'CRM / Deal Tracker', replace: 'Deal pipeline tracker', save: '$50-150' },
              { tool: 'Team Messaging', replace: 'Secure built-in chat', save: '$8-15/user' },
              { tool: 'Time Tracker', replace: 'Built-in time tracking', save: '$10-20/user' },
              { tool: 'Content Strategist', replace: 'AI hook generation', save: '$500-2,000' },
              { tool: 'Competitor Research', replace: 'Automated analysis', save: '$100-400' },
              { tool: 'Revenue Attribution', replace: 'RevenueCat integration', save: '$100-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-[#ff1493]/10 bg-[#ff1493]/5 hover:border-[#ff1493]/30 transition-all">
                <div className="text-[#ff1493] font-mono text-sm font-bold min-w-[70px]">{item.save}</div>
                <div className="flex-1">
                  <div className="text-base text-gray-500 line-through">{item.tool}</div>
                  <div className="text-lg font-rajdhani font-semibold text-white">{item.replace}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center p-6 rounded-xl border border-[#00ffff]/30 bg-[#00ffff]/5">
            <div className="font-orbitron text-5xl sm:text-6xl font-black neon-cyan mb-2">
              37x ROI
            </div>
            <div className="text-xl font-rajdhani text-gray-400">
              Growth plan delivers $5,600+ in value for $149/month
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section id="deploy" className="relative z-20 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-orbitron font-black text-4xl sm:text-5xl md:text-6xl mb-6">
            <span className="neon-pink">READY TO</span>{' '}
            <span className="neon-cyan">TAKE COMMAND?</span>
          </h2>
          <p className="text-2xl sm:text-3xl font-rajdhani text-gray-400 mb-12">
            Initialize your agent army today
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <button
              onClick={() => router.push('/signup')}
              className="cyber-btn text-xl"
            >
              REQUEST ACCESS
            </button>
            <button
              onClick={() => router.push('/login')}
              className="cyber-btn-secondary text-xl"
            >
              SIGN IN
            </button>
          </div>

          <div className="inline-block px-6 py-2 rounded-full border border-[#ffff00]/30 bg-[#ffff00]/10 font-mono text-[#ffff00] text-base tracking-wider">
            CLOSED BETA — LIMITED SLOTS
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-20 border-t border-[#ff1493]/10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="font-orbitron font-black text-2xl neon-pink mb-4">$TUD#X</div>
              <p className="text-lg font-rajdhani text-gray-500 leading-relaxed">
                The future of AI marketing is autonomous. The future is Studex.
              </p>
            </div>
            <div>
              <div className="font-orbitron text-base text-gray-400 mb-4 tracking-wider">NAVIGATION</div>
              <div className="space-y-3 font-rajdhani text-lg">
                <a href="/dashboard" className="block text-gray-500 hover:text-[#ff1493] hover:no-underline">Dashboard</a>
                <a href="/larry-skill" className="block text-gray-500 hover:text-[#ff1493] hover:no-underline">Larry Skill</a>
                <a href="/marketing" className="block text-gray-500 hover:text-[#ff1493] hover:no-underline">Marketing Hub</a>
                <a href="/deals" className="block text-gray-500 hover:text-[#ff1493] hover:no-underline">Deal Tracker</a>
              </div>
            </div>
            <div>
              <div className="font-orbitron text-base text-gray-400 mb-4 tracking-wider">PLATFORM</div>
              <div className="space-y-3 font-rajdhani text-lg">
                <a href="/setup" className="block text-gray-500 hover:text-[#00ffff] hover:no-underline">Setup Wizard</a>
                <a href="/signup" className="block text-gray-500 hover:text-[#00ffff] hover:no-underline">Create Account</a>
                <a href="/login" className="block text-gray-500 hover:text-[#00ffff] hover:no-underline">Sign In</a>
                <a href="/settings" className="block text-gray-500 hover:text-[#00ffff] hover:no-underline">Settings</a>
              </div>
            </div>
          </div>
          <div className="border-t border-[#ff1493]/10 pt-8 text-center font-mono text-base text-gray-600">
            &copy; 2026 Studex Group. All systems operational.
          </div>
        </div>
      </footer>
    </div>
  );
}
