'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useEffect, useState, useRef } from 'react';
import {
  ChevronRight, Clock, Globe, Play, Pause, Send,
  Cpu, Zap, BarChart3, Rocket, TrendingUp,
  MessageSquare, Calendar, Shield,
} from 'lucide-react';

const SA_TIMEZONE = 'Africa/Johannesburg';

const timeFmt = new Intl.DateTimeFormat('en-ZA', {
  timeZone: SA_TIMEZONE, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
});
const dateFmt = new Intl.DateTimeFormat('en-ZA', {
  timeZone: SA_TIMEZONE, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
});
const dayFmt = new Intl.DateTimeFormat('en-ZA', {
  timeZone: SA_TIMEZONE, weekday: 'long',
});

function useSATime() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [day, setDay] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(timeFmt.format(now));
      setDate(dateFmt.format(now));
      setDay(dayFmt.format(now));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return { time, date, day };
}

function AnimatedBrain({ size = 120 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame = 0;
    let animId: number;
    const w = canvas.width, h = canvas.height;
    const neurons: { x: number; y: number; r: number; pulse: number }[] = [];
    for (let i = 0; i < 24; i++) {
      neurons.push({
        x: w * 0.15 + Math.random() * w * 0.7,
        y: h * 0.12 + Math.random() * h * 0.7,
        r: 1.5 + Math.random() * 2.5,
        pulse: Math.random() * Math.PI * 2,
      });
    }
    const connections: [number, number][] = [];
    for (let i = 0; i < 35; i++) {
      connections.push([Math.floor(Math.random() * neurons.length), Math.floor(Math.random() * neurons.length)]);
    }
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(59,130,246,0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, w * 0.35, h * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
      connections.forEach(([a, b]) => {
        const na = neurons[a], nb = neurons[b];
        const alpha = 0.08 + 0.12 * Math.sin(frame * 0.03 + na.pulse);
        ctx.strokeStyle = `rgba(59,130,246,${alpha})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
      });
      neurons.forEach((n) => {
        const glow = 0.5 + 0.5 * Math.sin(frame * 0.05 + n.pulse);
        ctx.fillStyle = `rgba(37,99,235,${0.4 + glow * 0.6})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * (0.8 + glow * 0.4), 0, Math.PI * 2);
        ctx.fill();
      });
      const px = w * 0.15 + ((frame * 0.6) % (w * 0.7));
      ctx.fillStyle = 'rgba(59,130,246,0.5)';
      ctx.beginPath();
      ctx.arc(px, h / 2, 3, 0, Math.PI * 2);
      ctx.fill();
      frame++;
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, [size]);
  return <canvas ref={canvasRef} width={size} height={size} className="inline-block" />;
}

function CowMascot() {
  return (
    <div className="flex flex-col items-center">
      <div className="text-7xl sm:text-8xl md:text-9xl leading-none select-none" aria-label="Cow mascot">
        🐄
      </div>
      {/* TODO: replace emoji with actual mascot image from public/ */}
    </div>
  );
}

function AgentCard({ agent, onToggle, onRename, onChat }: {
  agent: { name: string; role: string; status: 'online' | 'paused' | 'busy'; tasks: string; activity: string };
  onToggle: () => void;
  onRename: (name: string) => void;
  onChat: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(agent.name);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const statusColors = { online: '#22c55e', paused: '#eab308', busy: '#f97316' };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: statusColors[agent.status] }} />
          {editing ? (
            <input
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={() => { onRename(nameVal); setEditing(false); }}
              onKeyDown={e => { if (e.key === 'Enter') { onRename(nameVal); setEditing(false); } }}
              className="font-mono text-lg font-bold text-gray-800 bg-blue-50 border border-blue-200 rounded px-2 py-0.5 w-32 focus:outline-none"
              autoFocus
            />
          ) : (
            <span
              className="font-mono text-lg font-bold text-gray-800 cursor-pointer hover:text-blue-600"
              onClick={() => setEditing(true)}
              title="Click to rename"
            >
              {agent.name}
            </span>
          )}
        </div>
        <button onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title={agent.status === 'online' ? 'Pause agent' : 'Resume agent'}>
          {agent.status === 'online' ? <Pause size={16} className="text-amber-500" /> : <Play size={16} className="text-green-500" />}
        </button>
      </div>
      <p className="text-base text-gray-500 font-mono uppercase tracking-wider mb-1">{agent.role}</p>
      <p className="text-base text-blue-600 font-mono mb-1">{agent.tasks}</p>
      <p className="text-sm text-green-600 font-mono italic">{agent.activity}</p>

      {/* Chat toggle */}
      <button onClick={() => setChatOpen(!chatOpen)}
        className="mt-2 text-sm text-blue-500 hover:text-blue-700 font-mono flex items-center gap-1">
        <MessageSquare size={14} /> {chatOpen ? 'Close chat' : 'Assign task'}
      </button>
      {chatOpen && (
        <div className="mt-2 flex gap-2">
          <input
            value={chatMsg}
            onChange={e => setChatMsg(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && chatMsg.trim()) { onChat(chatMsg); setChatMsg(''); } }}
            placeholder={`Tell ${agent.name} what to do...`}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-base font-mono text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:outline-none"
          />
          <button onClick={() => { if (chatMsg.trim()) { onChat(chatMsg); setChatMsg(''); } }}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-mono hover:bg-blue-600 transition-colors">
            <Send size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function SATimeCalendar({ time, date, day }: { time: string; date: string; day: string }) {
  const schedule = [
    { time: '07:00', label: 'Morning Analytics Report', status: 'done' },
    { time: '07:30', label: 'First Post Wave', status: 'done' },
    { time: '10:00', label: 'Engagement Check', status: 'active' },
    { time: '12:00', label: 'Midday Content Push', status: 'upcoming' },
    { time: '16:30', label: 'Peak Engagement Post', status: 'upcoming' },
    { time: '19:00', label: 'Evening Reels + Stories', status: 'upcoming' },
    { time: '21:00', label: 'Night Owl TikTok Drop', status: 'upcoming' },
    { time: '23:00', label: 'Daily Performance Summary', status: 'upcoming' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Clock size={24} className="text-blue-500" />
          <div>
            <p className="font-mono text-3xl font-bold text-gray-800">{time || '--:--:--'}</p>
            <p className="font-mono text-base text-gray-500">SAST - Johannesburg</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-semibold text-gray-700">{day}</p>
          <p className="font-mono text-base text-gray-500">{date}</p>
        </div>
      </div>
      <div className="border-t border-gray-100 pt-4">
        <h4 className="font-mono text-base font-bold text-gray-600 tracking-wider mb-3 flex items-center gap-2">
          <Calendar size={16} /> POSTING SCHEDULE (SAST)
        </h4>
        <div className="space-y-2">
          {schedule.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 p-2 rounded-lg text-base font-mono ${
              s.status === 'done' ? 'bg-green-50 text-green-700' :
              s.status === 'active' ? 'bg-blue-50 text-blue-700 font-bold' :
              'bg-gray-50 text-gray-500'
            }`}>
              <span className="w-14 text-right font-bold">{s.time}</span>
              <div className={`w-2.5 h-2.5 rounded-full ${
                s.status === 'done' ? 'bg-green-400' :
                s.status === 'active' ? 'bg-blue-500 animate-pulse' :
                'bg-gray-300'
              }`} />
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const { time, date, day } = useSATime();

  type AgentStatus = 'online' | 'paused' | 'busy';
  const [agents, setAgents] = useState<{ name: string; role: string; status: AgentStatus; tasks: string; activity: string }[]>([
    { name: 'LARRY', role: 'Chief Strategy Agent', status: 'online', tasks: 'Hook optimization + Content strategy', activity: 'Generating carousel hooks...' },
    { name: 'NANO', role: 'Image Generation Agent', status: 'online', tasks: 'Slide creation + Visual assets', activity: 'Rendering 4 product slides...' },
    { name: 'REMOTION', role: 'Video Production Agent', status: 'busy', tasks: 'TikTok videos + Instagram Reels', activity: 'Encoding 15s reel @ 1080p...' },
    { name: 'UPLOAD', role: 'Distribution Agent', status: 'online', tasks: 'Multi-platform posting + Scheduling', activity: 'Queued: 3 posts for 16:30 SAST' },
    { name: 'ANALYTICS', role: 'Intelligence Agent', status: 'online', tasks: 'Performance tracking + Diagnostics', activity: 'Processing 24h engagement data...' },
    { name: 'CLAUDE', role: 'Strategy Advisor', status: 'online', tasks: 'Hook writing + Caption generation', activity: 'A/B testing caption variants...' },
  ]);

  useEffect(() => { setMounted(true); }, []);

  if (user) {
    router.push('/dashboard');
    return null;
  }

  const toggleAgent = (idx: number) => {
    setAgents(prev => prev.map((a, i) => i === idx ? { ...a, status: a.status === 'online' ? 'paused' as const : 'online' as const } : a));
  };

  const renameAgent = (idx: number, name: string) => {
    setAgents(prev => prev.map((a, i) => i === idx ? { ...a, name } : a));
  };

  const chatAgent = (idx: number, msg: string) => {
    const preview = msg.length > 40 ? msg.slice(0, 40) + '...' : msg;
    setAgents(prev => prev.map((a, i) => i === idx ? { ...a, activity: `Task assigned: "${preview}"` } : a));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50 text-gray-800">

      {/* ===== NAVIGATION ===== */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐄</span>
            <div className="text-xl sm:text-2xl font-mono font-black text-gray-800 tracking-wide">
              STUDEX
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 font-mono text-base tracking-wide">
            <a href="#about" className="text-gray-500 hover:text-blue-600 hover:no-underline transition-colors">ABOUT</a>
            <a href="#agents" className="text-gray-500 hover:text-blue-600 hover:no-underline transition-colors">AGENTS</a>
            <a href="#schedule" className="text-gray-500 hover:text-blue-600 hover:no-underline transition-colors">SCHEDULE</a>
            <a href="/marketing" className="text-blue-600 hover:text-blue-800 hover:no-underline transition-colors border border-blue-200 px-3 py-1 rounded-lg">DASHBOARD</a>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/login')}
              className="font-mono text-base text-gray-600 hover:text-blue-600 px-3 py-2">
              SIGN IN
            </button>
            <button onClick={() => router.push('/signup')}
              className="font-mono text-base bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              GET STARTED
            </button>
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative px-4 sm:px-6 pt-12 pb-16 overflow-hidden">
        <div className={`max-w-6xl mx-auto text-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Cow Mascot */}
          <CowMascot />

          {/* Headline */}
          <h1 className="font-mono font-black text-4xl sm:text-5xl md:text-6xl text-gray-800 mt-6 mb-4 leading-tight">
            Studex Marketing Autopilot
          </h1>

          <p className="text-2xl sm:text-3xl text-gray-600 font-mono max-w-4xl mx-auto mb-8 leading-relaxed">
            43 AI agents that create viral content, publish to 10+ platforms,
            track performance, and grow your brand — all on autopilot.
          </p>

          {/* SA Time Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 font-mono text-base text-blue-700 mb-8">
            <Clock size={16} />
            <span className="font-bold">{time || '--:--:--'} SAST</span>
            <span className="text-blue-400">|</span>
            <span>{date}</span>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => router.push('/signup')}
              className="font-mono text-xl bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg">
              LAUNCH YOUR AGENTS <ChevronRight size={22} />
            </button>
            <button onClick={() => router.push('/larry-skill')}
              className="font-mono text-xl border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors">
              VIEW WAREHOUSE
            </button>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="border-y border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'AGENTS ONLINE', value: '43' },
              { label: 'VIEWS GENERATED', value: '7M+' },
              { label: 'PLATFORMS', value: '10+' },
              { label: 'FOLLOWERS BUILT', value: '1M+' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-4xl sm:text-5xl font-mono font-black text-blue-600 mb-1">{s.value}</div>
                <div className="text-base font-mono text-gray-500 tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT LARRY BRAIN ===== */}
      <section id="about" className="px-4 sm:px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="flex-shrink-0">
              <AnimatedBrain size={160} />
            </div>
            <div>
              <h2 className="font-mono font-black text-3xl sm:text-4xl text-gray-800 mb-4">
                Meet Larry Brain
              </h2>
              <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed mb-4">
                Larry Brain is the AI engine that powers Studex. It orchestrates 43 autonomous agents
                that handle your entire marketing pipeline — from generating scroll-stopping hooks to
                publishing across TikTok, Instagram, YouTube, LinkedIn, Facebook, and 5 more platforms.
              </p>
              <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed mb-4">
                Every morning at 7:00 AM SAST, Larry analyses your performance data, identifies
                what content is working, generates new hooks using 7 psychological formulas, creates
                slideshows and videos, then publishes at peak engagement times automatically.
              </p>
              <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed">
                You get a daily AI report with two-axis diagnostics: what performed vs what to try next.
                No manual posting. No guessing. Just data-driven content that grows your audience
                while you focus on your business.
              </p>
            </div>
          </div>

          {/* Pipeline Steps */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Zap, label: 'HOOK GEN', desc: 'AI writes scroll-stopping hooks' },
              { icon: BarChart3, label: 'SLIDES', desc: 'Auto-generated carousels' },
              { icon: Globe, label: 'IMAGES', desc: 'Gemini 3 Pro visuals' },
              { icon: MessageSquare, label: 'OVERLAYS', desc: 'Text + branding layers' },
              { icon: Rocket, label: 'PUBLISH', desc: '10+ platforms at once' },
              { icon: TrendingUp, label: 'ANALYTICS', desc: 'Daily AI reports' },
            ].map((step, i) => (
              <div key={i} className="text-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="w-14 h-14 mx-auto rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                  <step.icon size={28} className="text-blue-500" />
                </div>
                <div className="font-mono text-base font-bold text-gray-700 mb-1">{step.label}</div>
                <div className="text-base text-gray-500">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LIVE AGENT WORKSPACE ===== */}
      <section id="agents" className="px-4 sm:px-6 py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-mono font-black text-3xl sm:text-4xl text-gray-800 mb-3">
              Live Agent Workspace
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
              Watch your agents work in real time. Click a name to rename it.
              Use the chat to assign new tasks to any agent.
            </p>
          </div>

          {/* Agent Status Bar */}
          {(() => {
            const counts = agents.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {} as Record<string, number>);
            return (
              <div className="flex flex-wrap items-center justify-center gap-4 mb-6 font-mono text-base">
                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {counts.online || 0} Online
                </span>
                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  {counts.paused || 0} Paused
                </span>
                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  {counts.busy || 0} Busy
                </span>
              </div>
            );
          })()}

          {/* Agent Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent, idx) => (
              <AgentCard
                key={idx}
                agent={agent}
                onToggle={() => toggleAgent(idx)}
                onRename={(name) => renameAgent(idx, name)}
                onChat={(msg) => chatAgent(idx, msg)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== SA TIME CALENDAR + POSTING SCHEDULE ===== */}
      <section id="schedule" className="px-4 sm:px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-mono font-black text-3xl sm:text-4xl text-gray-800 mb-3">
              South African Time Schedule
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
              All posting times are in SAST (South African Standard Time).
              Larry optimises posting windows for maximum local and global reach.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Calendar / Clock */}
            <SATimeCalendar time={time} date={date} day={day} />

            {/* What You Replace */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-mono text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-blue-500" /> 10 TOOLS REPLACED
              </h3>
              <div className="space-y-2">
                {[
                  { tool: 'Social Scheduler', replace: 'Auto-posting 10+ platforms' },
                  { tool: 'Graphic Designer', replace: 'AI image generation' },
                  { tool: 'Video Editor', replace: 'Remotion video engine' },
                  { tool: 'Analytics Tool', replace: 'Built-in telemetry' },
                  { tool: 'CRM / Deal Tracker', replace: 'Deal pipeline tracker' },
                  { tool: 'Content Strategist', replace: 'AI hook generation' },
                  { tool: 'Competitor Research', replace: 'Automated analysis' },
                  { tool: 'Revenue Attribution', replace: 'RevenueCat integration' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 text-base font-mono">
                    <span className="text-gray-400 line-through flex-1">{item.tool}</span>
                    <span className="text-blue-600 flex-1 font-semibold">{item.replace}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
                <div className="font-mono text-4xl font-black text-blue-600 mb-1">37x ROI</div>
                <div className="text-lg text-gray-600">$5,600+ value for $149/month</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SYSTEM SPECS (COCKPIT AESTHETIC) ===== */}
      <section className="px-4 sm:px-6 py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-mono font-black text-3xl sm:text-4xl text-gray-800 mb-8 text-center">
            System Architecture
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm font-mono">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <Cpu size={22} className="text-blue-500" />
              <span className="text-lg font-bold text-gray-700 tracking-wider">STUDEX SYSTEM SPECS v4.2</span>
              <span className="ml-auto w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="space-y-3">
              {[
                { label: 'AI AGENTS', value: '43 AUTONOMOUS' },
                { label: 'HOOK FORMULAS', value: '7 PSYCHOLOGICAL' },
                { label: 'RESPONSE TIME', value: '<10ms' },
                { label: 'PLATFORMS', value: 'TIKTOK + 9 MORE' },
                { label: 'IMAGE GEN', value: 'GEMINI 3 PRO' },
                { label: 'VIDEO ENGINE', value: 'REMOTION REACT' },
                { label: 'REVENUE TRACK', value: 'REVENUECAT' },
                { label: 'TIMEZONE', value: 'SAST (UTC+2)' },
              ].map((spec, i) => (
                <div key={i} className="flex justify-between items-center text-lg border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-bold">{spec.label}</span>
                  <span className="text-blue-600 font-bold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-mono font-black text-3xl sm:text-4xl text-gray-800 mb-4">
            Ready to Automate Your Marketing?
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8">
            Initialize your agent army today. Let Larry Brain handle the rest.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button onClick={() => router.push('/signup')}
              className="font-mono text-xl bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
              REQUEST ACCESS
            </button>
            <button onClick={() => router.push('/login')}
              className="font-mono text-xl border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors">
              SIGN IN
            </button>
          </div>

          <div className="inline-block px-5 py-2 rounded-full border border-amber-300 bg-amber-50 font-mono text-base text-amber-700">
            CLOSED BETA — LIMITED SLOTS
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-200 bg-white px-4 sm:px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🐄</span>
                <span className="font-mono font-black text-xl text-gray-800">STUDEX</span>
              </div>
              <p className="text-lg text-gray-500 leading-relaxed">
                AI-powered marketing automation for the next generation. Built in South Africa, for the world.
              </p>
            </div>
            <div>
              <div className="font-mono text-base text-gray-400 mb-3 tracking-wider">NAVIGATION</div>
              <div className="space-y-2 text-lg">
                <a href="/dashboard" className="block text-gray-500 hover:text-blue-600 hover:no-underline">Dashboard</a>
                <a href="/larry-skill" className="block text-gray-500 hover:text-blue-600 hover:no-underline">Larry Skill</a>
                <a href="/marketing" className="block text-gray-500 hover:text-blue-600 hover:no-underline">Marketing Hub</a>
                <a href="/deals" className="block text-gray-500 hover:text-blue-600 hover:no-underline">Deal Tracker</a>
              </div>
            </div>
            <div>
              <div className="font-mono text-base text-gray-400 mb-3 tracking-wider">PLATFORM</div>
              <div className="space-y-2 text-lg">
                <a href="/setup" className="block text-gray-500 hover:text-blue-600 hover:no-underline">Setup Wizard</a>
                <a href="/signup" className="block text-gray-500 hover:text-blue-600 hover:no-underline">Create Account</a>
                <a href="/login" className="block text-gray-500 hover:text-blue-600 hover:no-underline">Sign In</a>
                <a href="/settings" className="block text-gray-500 hover:text-blue-600 hover:no-underline">Settings</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 text-center font-mono text-base text-gray-400">
            &copy; 2026 Studex Group. All systems operational.
          </div>
        </div>
      </footer>
    </div>
  );
}
