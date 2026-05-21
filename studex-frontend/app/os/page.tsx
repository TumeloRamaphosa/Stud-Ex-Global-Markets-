'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  Instagram, Facebook, Mail, MessageCircle, Heart, Users, TrendingUp, BarChart3,
  Image as ImageIcon, Video, Eye, Sparkles, Send, RefreshCw, Loader2,
  ExternalLink, Cpu, Globe, Target, Brain, Zap, ChevronRight, Plus,
  MessageSquare, ArrowUpRight, Bot, Link2,
} from 'lucide-react';

function fmt(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function OSDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feeds' | 'content' | 'connect'>('feeds');
  const [chatMessages, setChatMessages] = useState<{ role: string; text: string }[]>([
    { role: 'ai', text: 'I\'m your AI Strategy Advisor. Ask me anything about your content strategy, post ideas, or analytics. I have access to your real Instagram, Gmail, and Discord data.' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [contentCaption, setContentCaption] = useState('');
  const [contentPlatform, setContentPlatform] = useState('instagram');
  const [contentMediaUrl, setContentMediaUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch('/api/platform-data');
      const json = await res.json();
      setData(json);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const auth = typeof window !== 'undefined' && localStorage.getItem('studex_auth');
    if (!auth) { router.push('/'); return; }
    loadData();
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, platformData: data }),
      });
      const json = await res.json();
      setChatMessages(prev => [...prev, { role: 'ai', text: json.reply || json.error || 'No response' }]);
    } catch { setChatMessages(prev => [...prev, { role: 'ai', text: 'Connection error. Please try again.' }]); }
    finally { setChatLoading(false); chatInputRef.current?.focus(); }
  }

  async function generateCaption() {
    setGenerating(true);
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Based on my top performing content, generate 1 Instagram caption for my next post. The caption should match my brand voice as seen in my recent posts. Include 20-25 relevant hashtags. Make it engaging with a strong hook. Format: just the caption ready to copy-paste.`,
          platformData: data,
        }),
      });
      const json = await res.json();
      setContentCaption(json.reply || '');
    } catch { setContentCaption('Error generating caption'); }
    finally { setGenerating(false); }
  }

  async function publishPost() {
    if (!contentCaption.trim()) return;
    setPosting(true);
    setPostResult(null);
    try {
      const res = await fetch('/api/composio/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: contentMediaUrl ? 'post_instagram_image' : 'post_instagram_image',
          platform: contentPlatform,
          caption: contentCaption,
          imageUrl: contentMediaUrl,
        }),
      });
      setPostResult(await res.json());
    } catch (err: any) { setPostResult({ error: err.message }); }
    finally { setPosting(false); }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-gold-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading platform data...</p>
        </div>
      </div>
    );
  }

  const ig = data?.instagram;
  const gm = data?.gmail;
  const dc = data?.discord;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-white/5 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-gold-500/30 to-transparent">
            <Zap size={18} className="text-gold-500" />
          </div>
          <span className="font-bold text-sm">STUD-EX OS</span>
          <span className="text-xs text-gray-600">v1.0</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{ig?.profile?.username ? `@${ig.profile.username}` : ''}</span>
          <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={loadData}>Refresh</Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Left: Data + Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-1"><Users size={14} className="text-pink-400" /><span className="text-xs text-gray-500">Followers</span></div>
              <p className="text-2xl font-bold">{fmt(ig?.stats?.followers || 0)}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-1"><TrendingUp size={14} className="text-emerald-400" /><span className="text-xs text-gray-500">Engagement</span></div>
              <p className="text-2xl font-bold">{ig?.stats?.engRate || 0}%</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-1"><Eye size={14} className="text-blue-400" /><span className="text-xs text-gray-500">Reach (today)</span></div>
              <p className="text-2xl font-bold">{fmt(ig?.insights?.reach || 0)}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-1"><Heart size={14} className="text-red-400" /><span className="text-xs text-gray-500">Total Likes</span></div>
              <p className="text-2xl font-bold">{fmt(ig?.stats?.totalLikes || 0)}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
            {[
              { id: 'feeds' as const, label: 'Platform Data', icon: <BarChart3 size={14} /> },
              { id: 'content' as const, label: 'Create Content', icon: <Sparkles size={14} /> },
              { id: 'connect' as const, label: 'Connect API', icon: <Link2 size={14} /> },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === t.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* === FEEDS TAB === */}
          {activeTab === 'feeds' && (
            <div className="space-y-6">

              {/* Instagram Section */}
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Instagram size={20} className="text-pink-400" /> Instagram
                  <Badge variant="success" size="sm">Live</Badge>
                </h2>

                {/* Content Mix */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <Video size={16} className="mx-auto text-purple-400 mb-1" />
                    <p className="text-lg font-bold">{ig?.stats?.reelCount || 0}</p>
                    <p className="text-xs text-gray-500">Reels ({fmt(ig?.stats?.reelAvg || 0)} avg)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <ImageIcon size={16} className="mx-auto text-blue-400 mb-1" />
                    <p className="text-lg font-bold">{ig?.stats?.imageCount || 0}</p>
                    <p className="text-xs text-gray-500">Images ({fmt(ig?.stats?.imageAvg || 0)} avg)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <MessageCircle size={16} className="mx-auto text-amber-400 mb-1" />
                    <p className="text-lg font-bold">{fmt(ig?.stats?.totalComments || 0)}</p>
                    <p className="text-xs text-gray-500">Comments</p>
                  </div>
                </div>

                {/* Top Posts */}
                <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-1"><Target size={14} /> Top Performing</h3>
                <div className="space-y-2 mb-4">
                  {(ig?.topPosts || []).slice(0, 3).map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-pink-500/20 transition-colors">
                      <span className="text-xs font-bold text-gray-600 w-4">#{i + 1}</span>
                      <Badge variant={p.type === 'VIDEO' ? 'primary' : 'success'} size="sm">{p.type === 'VIDEO' ? 'REEL' : 'IMG'}</Badge>
                      <p className="text-sm flex-1 truncate text-gray-300">{p.caption || 'No caption'}</p>
                      <span className="text-xs text-red-400 flex items-center gap-1"><Heart size={12} /> {fmt(p.likes)}</span>
                      <span className="text-xs text-blue-400 flex items-center gap-1"><MessageCircle size={12} /> {fmt(p.comments)}</span>
                      <a href={p.permalink} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-400"><ExternalLink size={12} /></a>
                    </div>
                  ))}
                </div>

                {/* Recent Posts Grid */}
                <h3 className="text-sm font-bold text-gray-400 mb-2">Recent Posts</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                  {(ig?.posts || []).slice(0, 8).map((p: any) => (
                    <div key={p.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-pink-500/20 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant={p.type === 'VIDEO' ? 'primary' : 'success'} size="sm">{p.type === 'VIDEO' ? 'REEL' : 'IMG'}</Badge>
                        <span className="text-[10px] text-gray-600">{timeAgo(p.timestamp)}</span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-2 min-h-[2rem]">{p.caption || '...'}</p>
                      <div className="flex gap-2 text-xs">
                        <span className="text-red-400"><Heart size={10} className="inline" /> {fmt(p.likes)}</span>
                        <span className="text-blue-400"><MessageCircle size={10} className="inline" /> {p.comments}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gmail Section */}
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Mail size={20} className="text-red-400" /> Gmail
                  <Badge variant="success" size="sm">Live</Badge>
                </h2>
                <div className="space-y-2">
                  {(gm?.emails || []).slice(0, 5).map((e: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/10 transition-colors">
                      <Mail size={14} className="text-gray-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{e.subject || 'No subject'}</p>
                        <p className="text-xs text-gray-500 truncate">{e.from}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discord Section */}
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MessageCircle size={20} className="text-indigo-400" /> Discord
                  <Badge variant="success" size="sm">Live</Badge>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(dc?.guilds || []).map((g: any) => (
                    <div key={g.id} className="px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm flex items-center gap-2">
                      {g.owner && <span className="text-[10px] text-gold-500">OWNER</span>}
                      <span className="text-gray-300">{g.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Insights */}
              {ig?.insights && Object.keys(ig.insights).length > 0 && (
                <div>
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BarChart3 size={20} className="text-emerald-400" /> Daily Insights
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(ig.insights).map(([key, val]) => (
                      <div key={key} className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                        <p className="text-xs text-gray-500 capitalize mb-1">{key.replace(/_/g, ' ')}</p>
                        <p className="text-xl font-bold">{fmt(val as number)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === CONTENT TAB === */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-gold-500/20 bg-gradient-to-br from-gold-500/5 to-transparent">
                <h2 className="text-xl font-bold mb-1 flex items-center gap-2"><Sparkles size={22} className="text-gold-500" /> AI Content Engine</h2>
                <p className="text-sm text-gray-400 mb-6">Generate content based on your real performance data, then publish with one click.</p>

                {/* Platform */}
                <div className="flex gap-2 mb-4">
                  {[
                    { id: 'instagram', icon: <Instagram size={16} />, color: 'border-pink-500 bg-pink-500/10 text-pink-300' },
                    { id: 'facebook', icon: <Facebook size={16} />, color: 'border-blue-500 bg-blue-500/10 text-blue-300' },
                  ].map(p => (
                    <button key={p.id} onClick={() => setContentPlatform(p.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
                        contentPlatform === p.id ? p.color : 'border-white/10 text-gray-500'}`}>
                      {p.icon} {p.id}
                    </button>
                  ))}
                </div>

                {/* Media URL */}
                <div className="mb-4">
                  <label className="text-xs text-gray-500 block mb-1">Image/Video URL (public)</label>
                  <input type="url" value={contentMediaUrl} onChange={e => setContentMediaUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-gold-500/40 focus:outline-none" />
                </div>

                {/* Caption */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-gray-500">Caption</label>
                    <Button variant="ghost" size="sm" icon={generating ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />} onClick={generateCaption} disabled={generating}>
                      {generating ? 'Generating...' : 'AI Generate'}
                    </Button>
                  </div>
                  <textarea value={contentCaption} onChange={e => setContentCaption(e.target.value)}
                    placeholder="Write your caption or click AI Generate..."
                    rows={6}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-gold-500/40 focus:outline-none resize-none" />
                  <p className="text-xs text-gray-600 mt-1">{contentCaption.length} chars</p>
                </div>

                {/* Publish */}
                <Button size="lg" fullWidth onClick={publishPost}
                  disabled={posting || !contentCaption.trim() || !contentMediaUrl.trim()}
                  icon={posting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  className="bg-gradient-to-r from-gold-500 to-amber-600 text-black border-0 font-bold">
                  {posting ? 'Publishing...' : `Publish to ${contentPlatform}`}
                </Button>

                {postResult && (
                  <div className={`mt-4 p-3 rounded-lg text-sm ${postResult.error ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                    {postResult.error ? `Error: ${typeof postResult.error === 'string' ? postResult.error : JSON.stringify(postResult.error).slice(0, 100)}` : 'Published successfully!'}
                  </div>
                )}
              </div>

              {/* What's Working Section */}
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Target size={18} className="text-emerald-400" /> What's Working (from your data)</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-sm">Reels avg engagement</span>
                    <span className="font-bold text-purple-400">{fmt(ig?.stats?.reelAvg || 0)} likes</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-sm">Images avg engagement</span>
                    <span className="font-bold text-blue-400">{fmt(ig?.stats?.imageAvg || 0)} likes</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-sm">Best format</span>
                    <Badge variant={(ig?.stats?.reelAvg || 0) > (ig?.stats?.imageAvg || 0) ? 'primary' : 'success'} size="sm">
                      {(ig?.stats?.reelAvg || 0) > (ig?.stats?.imageAvg || 0) ? 'REELS' : 'IMAGES'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-sm">Engagement rate</span>
                    <span className={`font-bold ${Number(ig?.stats?.engRate) > 1 ? 'text-green-400' : 'text-amber-400'}`}>{ig?.stats?.engRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === CONNECT TAB === */}
          {activeTab === 'connect' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400 mb-4">Connect additional platforms by adding their API endpoint. Data will appear in the feeds automatically.</p>
              {[
                { name: 'Instagram', status: 'active', via: 'Composio' },
                { name: 'Facebook', status: 'partial', via: 'Composio' },
                { name: 'Gmail', status: 'active', via: 'Composio' },
                { name: 'Discord', status: 'active', via: 'Composio' },
                { name: 'ElevenLabs', status: 'partial', via: 'Direct API' },
                { name: 'Claude', status: 'active', via: 'Direct API' },
                { name: 'Perplexity', status: 'active', via: 'Direct API' },
                { name: 'OpenRouter', status: 'active', via: 'Direct API' },
                { name: 'Gemma 4', status: 'active', via: 'Google AI' },
                { name: 'Shopify', status: 'expired', via: 'Composio' },
                { name: 'Slack', status: 'expired', via: 'Composio' },
                { name: 'WhatsApp', status: 'expired', via: 'Composio' },
              ].map(p => (
                <div key={p.name} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-gray-600">via {p.via}</p>
                  </div>
                  <Badge variant={p.status === 'active' ? 'success' : p.status === 'partial' ? 'warning' : 'error'} size="sm">
                    {p.status === 'active' ? 'Connected' : p.status === 'partial' ? 'Partial' : 'Expired'}
                  </Badge>
                </div>
              ))}
              <div className="p-4 rounded-xl border-2 border-dashed border-white/10 text-center hover:border-gold-500/30 transition-colors cursor-pointer">
                <Plus size={20} className="mx-auto text-gray-600 mb-2" />
                <p className="text-sm text-gray-500">Add Custom API</p>
                <p className="text-xs text-gray-700">Connect any REST API endpoint</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: AI Chat Panel */}
        <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col bg-[#0c0c14]">
          <div className="p-4 border-b border-white/5 flex items-center gap-2">
            <Bot size={18} className="text-gold-500" />
            <span className="font-bold text-sm">AI Strategy Advisor</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Live Data</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[600px] lg:max-h-none">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-gold-500/20 text-gold-100 rounded-br-md'
                    : 'bg-white/5 text-gray-300 rounded-bl-md'
                }`}>
                  <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-3 rounded-2xl rounded-bl-md">
                  <Loader2 size={16} className="animate-spin text-gold-500" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-white/5">
            <div className="flex gap-2">
              <input ref={chatInputRef} type="text" value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Ask about strategy, content ideas..."
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-gold-500/40 focus:outline-none" />
              <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()}
                className="p-2.5 rounded-xl bg-gold-500/20 text-gold-500 hover:bg-gold-500/30 disabled:opacity-50 transition-colors">
                <Send size={16} />
              </button>
            </div>
            <div className="flex gap-1 mt-2 overflow-x-auto">
              {['What should I post next?', 'Write me a caption', 'Analyze my engagement', 'Weekly content plan'].map(q => (
                <button key={q} onClick={() => { setChatInput(q); }}
                  className="text-[10px] px-2 py-1 rounded-full border border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20 whitespace-nowrap transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
