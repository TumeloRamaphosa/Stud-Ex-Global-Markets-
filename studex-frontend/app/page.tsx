'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Brain, Zap, BarChart3, Send, Users, Shield, Eye, Sparkles, ChevronDown,
  Instagram, Facebook, Mail, MessageCircle, ShoppingBag, Lock, User,
  Cpu, Globe, Mic, Image as ImageIcon, Calendar, Target,
} from 'lucide-react';

const VALID_USER = 'Agentlord';
const VALID_PASS = '12345$';

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ${className}`}>{children}</section>;
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:border-gold-500/30 hover:bg-white/10 transition-all duration-300 group">
      <div className="p-3 rounded-xl bg-gradient-to-br from-gold-500/20 to-transparent w-fit mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{desc}</p>
    </div>
  );
}

function PlatformPill({ icon, name, active }: { icon: React.ReactNode; name: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm ${active ? 'border-green-500/40 bg-green-500/10 text-green-300' : 'border-gray-700 bg-gray-800/50 text-gray-500'}`}>
      {icon}
      <span>{name}</span>
      {active && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (username === VALID_USER && password === VALID_PASS) {
        localStorage.setItem('studex_auth', 'true');
        router.push('/os');
      } else {
        setError('Invalid credentials');
      }
      setLoading(false);
    }, 800);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* ===== HERO ===== */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0a0a0f]" />
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-sm mb-8">
            <Zap size={14} /> AI Operating System v1.0
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-gold-300 to-gold-500 bg-clip-text text-transparent">
              STUD-EX
            </span>
            <br />
            <span className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-widest text-gray-300">
              GLOBAL MARKETS
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            The AI Business Operating System. One dashboard to see everything,
            create with any AI, and publish everywhere — with agents that think, speak, and act.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setShowLogin(true)}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-black font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-gold-500/20">
              Enter The Hive Mind
            </button>
            <a href="#features"
              className="px-8 py-4 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
              Explore <ChevronDown size={18} />
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={28} className="text-gray-500" />
        </div>
      </div>

      {/* ===== LOGIN MODAL ===== */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md" onClick={() => setShowLogin(false)}>
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-8">
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-gold-500/20 to-transparent mb-4">
                <Shield size={32} className="text-gold-500" />
              </div>
              <h2 className="text-2xl font-bold">Access The Hive Mind</h2>
              <p className="text-gray-400 text-sm mt-1">Enter your credentials to proceed</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1.5">Username</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="Enter username" autoFocus
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30" />
                </div>
              </div>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-black font-bold hover:scale-[1.02] transition-transform disabled:opacity-50">
                {loading ? 'Authenticating...' : 'Enter'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== CONNECTED PLATFORMS ===== */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Connected Infrastructure</h2>
          <p className="text-gray-400">Live status of all platform connections</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <PlatformPill icon={<Instagram size={16} />} name="Instagram" active={true} />
          <PlatformPill icon={<Facebook size={16} />} name="Facebook" active={true} />
          <PlatformPill icon={<Mail size={16} />} name="Gmail" active={true} />
          <PlatformPill icon={<MessageCircle size={16} />} name="Discord" active={true} />
          <PlatformPill icon={<Mic size={16} />} name="ElevenLabs" active={true} />
          <PlatformPill icon={<ShoppingBag size={16} />} name="Shopify" active={false} />
          <PlatformPill icon={<MessageCircle size={16} />} name="Slack" active={false} />
          <PlatformPill icon={<MessageCircle size={16} />} name="WhatsApp" active={false} />
        </div>
      </Section>

      {/* ===== FEATURES ===== */}
      <div id="features">
        <Section>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">The Operating System</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Nine modules that form the central nervous system of your business</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<Brain size={24} className="text-purple-400" />} title="War Room" desc="Chat with 5 AI agents at a roundtable. /standup for morning reports, /discuss for collective intelligence. Voice-enabled with Kokoro TTS." />
            <FeatureCard icon={<Globe size={24} className="text-cyan-400" />} title="Second Brain" desc="3D interactive knowledge graph. Your Obsidian vault visualized in Three.js. Business Brain + Social Brain, searchable and alive." />
            <FeatureCard icon={<Sparkles size={24} className="text-gold-500" />} title="Content Engine" desc="AI generates captions, images, and voice-overs. Pick any LLM. Approval queue ensures nothing posts without your say-so." />
            <FeatureCard icon={<Target size={24} className="text-red-400" />} title="Mission Control" desc="Kanban board with AI auto-assignment. Tasks route to the right agent automatically. Kill switches for safety." />
            <FeatureCard icon={<Eye size={24} className="text-blue-400" />} title="Feed Aggregator" desc="Instagram, Facebook, Gmail, Discord, Shopify — all data in one unified timeline. Filter by platform, search across everything." />
            <FeatureCard icon={<BarChart3 size={24} className="text-emerald-400" />} title="Analytics Hub" desc="Cross-platform engagement trends, revenue attribution, audience demographics. AI-powered strategy recommendations." />
            <FeatureCard icon={<Cpu size={24} className="text-amber-400" />} title="LLM Playground" desc="Test Claude, Gemma 4, Perplexity, Ollama, LM Studio side by side. Compare outputs, track tokens, save prompts." />
            <FeatureCard icon={<Send size={24} className="text-pink-400" />} title="Smart Publishing" desc="Post to Instagram, Facebook, and any platform. Schedule or publish now. Track performance after posting." />
            <FeatureCard icon={<Calendar size={24} className="text-violet-400" />} title="Content Calendar" desc="Visual calendar of all scheduled posts. Drag to reschedule. Gap analysis highlights days with no content." />
          </div>
        </Section>
      </div>

      {/* ===== AI BRAINS ===== */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">10 AI Brains. One Interface.</h2>
          <p className="text-gray-400">The brain is replaceable. The wrapper stays.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { name: 'Claude', sub: 'Anthropic', color: 'from-orange-500/20 to-transparent border-orange-500/20' },
            { name: 'Gemma 4', sub: 'Google', color: 'from-blue-500/20 to-transparent border-blue-500/20' },
            { name: 'Gemini 2.5', sub: 'Google', color: 'from-cyan-500/20 to-transparent border-cyan-500/20' },
            { name: 'Perplexity', sub: 'Search AI', color: 'from-teal-500/20 to-transparent border-teal-500/20' },
            { name: 'OpenRouter', sub: '100+ Models', color: 'from-purple-500/20 to-transparent border-purple-500/20' },
            { name: 'ElevenLabs', sub: 'Voice AI', color: 'from-pink-500/20 to-transparent border-pink-500/20' },
            { name: 'Ollama', sub: 'Local LLM', color: 'from-green-500/20 to-transparent border-green-500/20' },
            { name: 'LM Studio', sub: 'Local Network', color: 'from-yellow-500/20 to-transparent border-yellow-500/20' },
            { name: 'Stable Diffusion', sub: 'Image Gen', color: 'from-violet-500/20 to-transparent border-violet-500/20' },
            { name: 'ComfyUI', sub: 'Workflows', color: 'from-rose-500/20 to-transparent border-rose-500/20' },
          ].map((ai) => (
            <div key={ai.name} className={`p-4 rounded-xl border bg-gradient-to-br ${ai.color} text-center hover:scale-105 transition-transform`}>
              <Cpu size={20} className="mx-auto mb-2 text-gray-300" />
              <p className="font-bold text-sm">{ai.name}</p>
              <p className="text-xs text-gray-500">{ai.sub}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ===== AGENTS ===== */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">The Agent Team</h2>
          <p className="text-gray-400">Five specialized agents, each with their own brain and voice</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { name: 'Main', role: 'Orchestrator', emoji: '👑', color: 'border-gold-500/30' },
            { name: 'Comms', role: 'Communications', emoji: '📡', color: 'border-blue-500/30' },
            { name: 'Content', role: 'Creator', emoji: '🎨', color: 'border-pink-500/30' },
            { name: 'Ops', role: 'Operations', emoji: '⚙️', color: 'border-green-500/30' },
            { name: 'Research', role: 'Analyst', emoji: '🔬', color: 'border-purple-500/30' },
          ].map((agent) => (
            <div key={agent.name} className={`p-6 rounded-2xl border ${agent.color} bg-white/5 text-center hover:bg-white/10 transition-colors`}>
              <div className="text-4xl mb-3">{agent.emoji}</div>
              <h3 className="font-bold">{agent.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{agent.role}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ===== LIVE STATS ===== */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Live From @ramaphosatumelo</h2>
          <p className="text-gray-400">Real data, real-time, powered by Composio</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Followers', value: '86.3K', icon: <Users size={22} className="text-pink-400" /> },
            { label: 'Total Posts', value: '1,831', icon: <ImageIcon size={22} className="text-blue-400" /> },
            { label: 'AI Providers', value: '10', icon: <Cpu size={22} className="text-amber-400" /> },
            { label: 'Platforms', value: '8', icon: <Globe size={22} className="text-emerald-400" /> },
          ].map((stat) => (
            <div key={stat.label} className="p-6 rounded-2xl border border-white/10 bg-white/5 text-center">
              <div className="mx-auto w-fit mb-3">{stat.icon}</div>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ===== CTA ===== */}
      <Section className="text-center">
        <h2 className="text-3xl sm:text-5xl font-bold mb-6">Ready to Enter?</h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">The Hive Mind is waiting. Your agents are ready. Your data is connected.</p>
        <button onClick={() => setShowLogin(true)}
          className="px-10 py-5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-black font-bold text-xl hover:scale-105 transition-transform shadow-lg shadow-gold-500/20">
          Enter The Hive Mind
        </button>
      </Section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-8 text-center">
        <p className="text-xs text-gray-600">Stud-Ex Global Markets AI Operating System v1.0 — Powered by Stud-Ex DevOps</p>
        <p className="text-xs text-gray-700 mt-1">The brain is replaceable. The wrapper stays.</p>
      </footer>
    </div>
  );
}
