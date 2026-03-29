'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import {
  TrendingUp, Eye, Users, Send, Plus, BarChart3, Megaphone, Settings,
  Zap, Clock, CheckCircle, AlertTriangle, Image as ImageIcon, Brain,
  Power, Pause, Play, Bot, Cpu, Shield, Radio, Globe, Activity,
  MessageSquare, Target, Hexagon, ChevronRight, Gauge, Radar,
} from 'lucide-react';
import { marketingApi } from '@/lib/marketing-api';
import type { MarketingProfile, MarketingPost } from '@/lib/marketing-types';
import { PLATFORM_LABELS } from '@/lib/marketing-types';

// ==================== SA TIME + WEATHER ====================
function useSATime() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const sa = new Intl.DateTimeFormat('en-ZA', {
        timeZone: 'Africa/Johannesburg', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      }).format(now);
      const saDate = new Intl.DateTimeFormat('en-ZA', {
        timeZone: 'Africa/Johannesburg', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      }).format(now);
      setTime(sa);
      setDate(saDate);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return { time, date };
}

// ==================== ANIMATED BRAIN ====================
function AnimatedBrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame = 0;
    const neurons: { x: number; y: number; r: number; pulse: number }[] = [];
    for (let i = 0; i < 20; i++) {
      neurons.push({ x: 20 + Math.random() * 60, y: 15 + Math.random() * 50, r: 1 + Math.random() * 2, pulse: Math.random() * Math.PI * 2 });
    }
    const connections: [number, number][] = [];
    for (let i = 0; i < 30; i++) {
      connections.push([Math.floor(Math.random() * 20), Math.floor(Math.random() * 20)]);
    }
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, 100, 80);
      // Brain outline
      ctx.strokeStyle = 'rgba(255,20,147,0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(50, 38, 30, 25, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Connections
      connections.forEach(([a, b]) => {
        const na = neurons[a], nb = neurons[b];
        const alpha = 0.1 + 0.15 * Math.sin(frame * 0.03 + na.pulse);
        ctx.strokeStyle = `rgba(0,255,255,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
      });
      // Neurons
      neurons.forEach((n) => {
        const glow = 0.5 + 0.5 * Math.sin(frame * 0.05 + n.pulse);
        ctx.fillStyle = `rgba(255,20,147,${0.4 + glow * 0.6})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * (0.8 + glow * 0.4), 0, Math.PI * 2);
        ctx.fill();
        // Glow
        ctx.fillStyle = `rgba(255,20,147,${glow * 0.2})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
        ctx.fill();
      });
      // Pulse wave
      const px = 20 + ((frame * 0.5) % 60);
      ctx.fillStyle = 'rgba(0,255,255,0.6)';
      ctx.beginPath();
      ctx.arc(px, 38, 2, 0, Math.PI * 2);
      ctx.fill();
      frame++;
      requestAnimationFrame(draw);
    }
    draw();
  }, []);
  return <canvas ref={canvasRef} width={100} height={80} className="inline-block" />;
}

// ==================== HEX METRIC CARD ====================
function HexMetric({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity"
        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', background: color }} />
      <div className="relative p-4 text-center" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
        <div className="pt-4 pb-2">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">{label}</p>
          <p className="text-2xl font-bold font-mono mt-1" style={{ color }}>{value}</p>
          <p className="text-[9px] text-gray-500 mt-1">{sub}</p>
        </div>
      </div>
      <div className="absolute inset-0 border-2 opacity-30 group-hover:opacity-60 transition-opacity"
        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', borderColor: color }} />
    </div>
  );
}

// ==================== AGENT CARD ====================
function AgentCard({ name, role, status, tasks, onToggle }: {
  name: string; role: string; status: 'online' | 'paused' | 'busy';
  tasks: string; onToggle: () => void;
}) {
  const colors = { online: '#4cff91', paused: '#ffd54f', busy: '#ff6b80' };
  return (
    <div className="bg-[#0d1117]/80 border border-[#1e3a5f]/50 rounded-lg p-3 hover:border-[#ff1493]/30 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: colors[status] }} />
          <span className="font-mono text-sm font-bold text-gray-200">{name}</span>
        </div>
        <button onClick={onToggle}
          className="p-1 rounded hover:bg-white/5 transition-colors"
          title={status === 'online' ? 'Pause agent' : 'Resume agent'}>
          {status === 'online' ? <Pause size={12} className="text-amber-400" /> : <Play size={12} className="text-green-400" />}
        </button>
      </div>
      <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{role}</p>
      <p className="text-[10px] text-cyan-400/70 mt-1 font-mono">{tasks}</p>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function MarketingDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<MarketingProfile | null>(null);
  const [posts, setPosts] = useState<MarketingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemActive, setSystemActive] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([
    { role: 'system', text: 'Larry Brain online. Ready for marketing directives.' },
  ]);
  const { time, date } = useSATime();

  // Agent states
  const [agents, setAgents] = useState([
    { name: 'LARRY', role: 'Chief Strategy Agent', status: 'online' as const, tasks: 'Hook optimization • Content strategy' },
    { name: 'NANO', role: 'Image Generation Agent', status: 'online' as const, tasks: 'Slide creation • Visual assets' },
    { name: 'REMOTION', role: 'Video Production Agent', status: 'paused' as const, tasks: 'TikTok videos • Instagram Reels' },
    { name: 'UPLOAD', role: 'Distribution Agent', status: 'online' as const, tasks: 'Multi-platform posting • Scheduling' },
    { name: 'ANALYTICS', role: 'Intelligence Agent', status: 'online' as const, tasks: 'Performance tracking • Diagnostics' },
    { name: 'CLAUDE', role: 'Strategy Advisor', status: 'online' as const, tasks: 'Hook writing • Caption generation' },
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const profileData = await marketingApi.profile.getProfile();
        setProfile(profileData);
        if (profileData?.id) {
          const postsData = await marketingApi.posts.getPosts(profileData.id);
          setPosts(postsData);
        }
      } catch (err) {
        console.error('Failed to load marketing data:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadData();
  }, [user]);

  const toggleAgent = (idx: number) => {
    setAgents(prev => prev.map((a, i) => i === idx ? { ...a, status: a.status === 'online' ? 'paused' as const : 'online' as const } : a));
  };

  const handleSystemToggle = () => {
    setSystemActive(!systemActive);
    toast.success(systemActive ? 'System paused' : 'System activated — all agents online');
  };

  const handleChatSend = () => {
    if (!chatMessage.trim()) return;
    setChatHistory(prev => [...prev, { role: 'user', text: chatMessage }]);
    // Simulate AI response
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        role: 'system',
        text: `Analyzing "${chatMessage.slice(0, 30)}..." — I recommend focusing on person-conflict hooks for maximum engagement. Your top-performing category has 3x higher conversion.`,
      }]);
    }, 800);
    setChatMessage('');
  };

  const totalPosts = posts.length;
  const postedCount = posts.filter(p => p.status === 'posted').length;
  const draftCount = posts.filter(p => p.status === 'draft').length;
  const failedCount = posts.filter(p => p.status === 'failed').length;
  const totalReach = posts.reduce((acc, p) => acc + p.platforms.length, 0);
  const successRate = totalPosts > 0 ? Math.round((postedCount / totalPosts) * 100) : 0;

  // Onboarding
  if (!loading && !profile) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 overflow-auto">
            <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto text-center py-20">
              <AnimatedBrain />
              <h1 className="text-4xl font-bold mt-4 mb-4 font-mono">LARRY&apos;S BRAIN</h1>
              <p className="text-xl text-gray-400 mb-2">Marketing Automation Command Centre</p>
              <p className="text-gray-500 mb-8 max-w-xl mx-auto">
                AI-powered automated marketing for TikTok, Instagram, and 10+ platforms.
                Generate → Post → Track → Iterate.
              </p>
              <Button size="lg" icon={<Power size={20} />} onClick={() => router.push('/marketing/settings')}>
                INITIALIZE SYSTEM
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-auto">
          <div className="p-3 sm:p-4 lg:p-6 max-w-[1600px] mx-auto w-full">

            {/* ===== TOP BAR: SA Time + Date + Weather + System Status ===== */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-3 py-2 rounded-lg bg-[#0d1117]/80 border border-[#1e3a5f]/30">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-cyan-400" />
                  <span className="font-mono text-sm text-cyan-300">{time}</span>
                  <span className="text-gray-600">SAST</span>
                </div>
                <span className="text-gray-700">|</span>
                <span className="font-mono text-xs text-gray-400">{date}</span>
                <span className="text-gray-700">|</span>
                <span className="font-mono text-xs text-gray-500">Johannesburg, SA</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono ${systemActive ? 'bg-green-900/30 text-green-400 border border-green-700/30' : 'bg-red-900/20 text-red-400 border border-red-700/30'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${systemActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  {systemActive ? 'SYSTEM ACTIVE' : 'SYSTEM STANDBY'}
                </div>
                <span className="font-mono text-[10px] text-gray-600">{agents.filter(a => a.status === 'online').length}/{agents.length} AGENTS</span>
              </div>
            </div>

            {/* ===== HEADER: Larry's Brain + Launch Button ===== */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <AnimatedBrain />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight flex items-center gap-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-purple-500">
                      LARRY&apos;S BRAIN
                    </span>
                  </h1>
                  <p className="text-xs font-mono text-gray-500 tracking-widest">MARKETING AUTOMATION COMMAND CENTRE</p>
                </div>
              </div>

              {/* Fighter Jet Launch Button */}
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm" icon={<Plus size={16} />} onClick={() => router.push('/marketing/create')}>
                  NEW MISSION
                </Button>
                <button
                  onClick={handleSystemToggle}
                  className={`relative group px-6 py-3 rounded-lg font-mono font-bold text-sm tracking-wider transition-all duration-300 ${
                    systemActive
                      ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-[0_0_20px_rgba(255,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,0,0,0.5)]'
                      : 'bg-gradient-to-r from-green-600 to-emerald-800 text-white shadow-[0_0_20px_rgba(0,255,100,0.3)] hover:shadow-[0_0_30px_rgba(0,255,100,0.5)]'
                  }`}
                >
                  <div className="absolute inset-0 rounded-lg border-2 border-dashed opacity-50"
                    style={{ borderColor: systemActive ? '#ff0000' : '#00ff64', animation: 'spin 10s linear infinite' }} />
                  <div className="flex items-center gap-2">
                    <Power size={18} className={systemActive ? 'animate-pulse' : ''} />
                    {systemActive ? 'DISENGAGE' : 'LAUNCH'}
                  </div>
                </button>
              </div>
            </div>

            {/* ===== HEX METRICS — Fighter Jet HUD Style ===== */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
              <HexMetric label="Posts" value={String(totalPosts)} sub="Total missions" color="#ff1493" />
              <HexMetric label="Reach" value={String(totalReach)} sub="Platform hits" color="#00ffff" />
              <HexMetric label="Success" value={`${successRate}%`} sub="Mission rate" color="#4cff91" />
              <HexMetric label="Drafts" value={String(draftCount)} sub="Queued" color="#ffd54f" />
              <HexMetric label="Failed" value={String(failedCount)} sub="Needs fix" color="#ff6b80" />
              <HexMetric label="Agents" value={String(agents.filter(a => a.status === 'online').length)} sub="Online" color="#9d00ff" />
            </div>

            {/* ===== MAIN COCKPIT GRID ===== */}
            <div className="grid lg:grid-cols-12 gap-4 mb-4">

              {/* LEFT: Agent Control Panel */}
              <div className="lg:col-span-3 space-y-3">
                <div className="bg-[#0d1117]/80 border border-[#1e3a5f]/30 rounded-lg p-3">
                  <h3 className="font-mono text-xs text-gray-400 tracking-widest mb-3 flex items-center gap-2">
                    <Bot size={14} className="text-cyan-400" /> AGENT CONTROL
                  </h3>
                  <div className="space-y-2">
                    {agents.map((agent, idx) => (
                      <AgentCard key={agent.name} {...agent} onToggle={() => toggleAgent(idx)} />
                    ))}
                  </div>
                </div>
              </div>

              {/* CENTER: Instagram/Platform Metrics + Recent Posts */}
              <div className="lg:col-span-6 space-y-4">
                {/* Platform Metrics */}
                <div className="bg-[#0d1117]/80 border border-[#1e3a5f]/30 rounded-lg p-4">
                  <h3 className="font-mono text-xs text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                    <Radar size={14} className="text-pink-400" /> PLATFORM TELEMETRY
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(profile?.uploadPost.platforms || ['tiktok', 'instagram']).map((platform) => (
                      <div key={platform} className="bg-[#111827]/60 border border-[#1e3a5f]/20 rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-gray-300">{PLATFORM_LABELS[platform as keyof typeof PLATFORM_LABELS]}</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        </div>
                        <p className="text-lg font-bold font-mono text-white">
                          {posts.filter(p => p.platforms.includes(platform as any) && p.status === 'posted').length}
                        </p>
                        <p className="text-[9px] font-mono text-gray-600">POSTS ACTIVE</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Posts / Missions */}
                <div className="bg-[#0d1117]/80 border border-[#1e3a5f]/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-mono text-xs text-gray-400 tracking-widest flex items-center gap-2">
                      <Activity size={14} className="text-green-400" /> RECENT MISSIONS
                    </h3>
                    <button onClick={() => router.push('/marketing/campaigns')} className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300">
                      VIEW ALL &gt;
                    </button>
                  </div>
                  {posts.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <Target size={32} className="mx-auto mb-2 opacity-40" />
                      <p className="text-xs font-mono">No missions deployed. Create your first slideshow.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {posts.slice(0, 6).map(post => (
                        <div key={post.id} className="flex items-center gap-3 p-2 rounded bg-[#111827]/40 hover:bg-[#111827]/60 transition-colors">
                          <div className={`w-1.5 h-8 rounded-full ${
                            post.status === 'posted' ? 'bg-green-500' : post.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{post.hookText || 'Untitled'}</p>
                            <p className="text-[10px] text-gray-500 font-mono">
                              {post.platforms.map(p => PLATFORM_LABELS[p]).join(' • ')}
                            </p>
                          </div>
                          <Badge variant={post.status === 'posted' ? 'success' : post.status === 'failed' ? 'error' : 'warning'} size="sm">
                            {post.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Strategy Advisor + Quick Nav */}
              <div className="lg:col-span-3 space-y-4">
                {/* AI Strategy Advisor */}
                <div className="bg-[#0d1117]/80 border border-[#1e3a5f]/30 rounded-lg p-3">
                  <h3 className="font-mono text-xs text-gray-400 tracking-widest mb-3 flex items-center gap-2">
                    <Brain size={14} className="text-purple-400" /> STRATEGY ADVISOR
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded bg-purple-900/10 border border-purple-700/20">
                      <p className="text-purple-300 font-mono font-bold text-[10px] mb-1">TOP HOOK TYPE</p>
                      <p className="text-gray-300">Person-Conflict hooks averaging 3x more views</p>
                    </div>
                    <div className="p-2 rounded bg-cyan-900/10 border border-cyan-700/20">
                      <p className="text-cyan-300 font-mono font-bold text-[10px] mb-1">BEST POST TIME</p>
                      <p className="text-gray-300">16:30 SAST — highest engagement window</p>
                    </div>
                    <div className="p-2 rounded bg-green-900/10 border border-green-700/20">
                      <p className="text-green-300 font-mono font-bold text-[10px] mb-1">NEXT ACTION</p>
                      <p className="text-gray-300">Create 3 variations of your top hook</p>
                    </div>
                  </div>
                </div>

                {/* Quick Nav */}
                <div className="bg-[#0d1117]/80 border border-[#1e3a5f]/30 rounded-lg p-3">
                  <h3 className="font-mono text-xs text-gray-400 tracking-widest mb-3 flex items-center gap-2">
                    <Gauge size={14} className="text-amber-400" /> COMMAND PANEL
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Create Slideshow', icon: <Plus size={14} />, href: '/marketing/create', color: 'text-pink-400' },
                      { label: 'Analytics', icon: <BarChart3 size={14} />, href: '/marketing/analytics', color: 'text-cyan-400' },
                      { label: 'Campaigns', icon: <Megaphone size={14} />, href: '/marketing/campaigns', color: 'text-purple-400' },
                      { label: 'Settings', icon: <Settings size={14} />, href: '/marketing/settings', color: 'text-amber-400' },
                      { label: 'Meat Dashboard', icon: <Globe size={14} />, href: '/meat-dashboard', color: 'text-green-400' },
                    ].map(item => (
                      <button key={item.label} onClick={() => router.push(item.href)}
                        className="w-full flex items-center gap-2 p-2 rounded bg-[#111827]/40 hover:bg-[#111827]/80 transition-colors text-left">
                        <span className={item.color}>{item.icon}</span>
                        <span className="text-xs font-mono text-gray-300">{item.label}</span>
                        <ChevronRight size={12} className="ml-auto text-gray-600" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ===== BOTTOM: Claude Chat + Connected Platforms ===== */}
            <div className="grid lg:grid-cols-12 gap-4">
              {/* Claude Chat */}
              <div className="lg:col-span-8 bg-[#0d1117]/80 border border-[#1e3a5f]/30 rounded-lg">
                <div className="p-3 border-b border-[#1e3a5f]/20 flex items-center gap-2">
                  <MessageSquare size={14} className="text-cyan-400" />
                  <span className="font-mono text-xs text-gray-400 tracking-widest">LARRY AI CHAT — STRATEGY CONSOLE</span>
                </div>
                <div className="p-3 h-40 overflow-y-auto space-y-2">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`text-xs font-mono ${msg.role === 'user' ? 'text-cyan-300' : 'text-gray-400'}`}>
                      <span className={`${msg.role === 'user' ? 'text-cyan-500' : 'text-pink-500'} mr-2`}>
                        {msg.role === 'user' ? '>' : 'LARRY:'}
                      </span>
                      {msg.text}
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-[#1e3a5f]/20 flex gap-2">
                  <input
                    value={chatMessage}
                    onChange={e => setChatMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleChatSend()}
                    placeholder="Ask Larry for strategy advice..."
                    className="flex-1 bg-[#111827]/60 border border-[#1e3a5f]/30 rounded px-3 py-2 text-xs font-mono text-white placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none"
                  />
                  <button onClick={handleChatSend}
                    className="px-3 py-2 bg-cyan-900/30 border border-cyan-700/30 rounded text-cyan-400 text-xs font-mono hover:bg-cyan-900/50 transition-colors">
                    SEND
                  </button>
                </div>
              </div>

              {/* Schedule + Platforms */}
              <div className="lg:col-span-4 bg-[#0d1117]/80 border border-[#1e3a5f]/30 rounded-lg p-3">
                <h3 className="font-mono text-xs text-gray-400 tracking-widest mb-3 flex items-center gap-2">
                  <Shield size={14} className="text-green-400" /> CONNECTED SYSTEMS
                </h3>
                <div className="space-y-1.5">
                  {(profile?.uploadPost.platforms || []).map(platform => (
                    <div key={platform} className="flex items-center justify-between p-1.5 rounded bg-[#111827]/40">
                      <span className="text-[11px] font-mono text-gray-300">{PLATFORM_LABELS[platform as keyof typeof PLATFORM_LABELS]}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span className="text-[9px] font-mono text-green-500">LINKED</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-[#1e3a5f]/20">
                  <h4 className="font-mono text-[10px] text-gray-500 mb-2">POSTING SCHEDULE</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(profile?.posting.schedule || ['07:30', '16:30', '21:00']).map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-[#111827]/60 border border-[#1e3a5f]/20 text-[10px] font-mono text-amber-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
