'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  Instagram, Facebook, Send, Sparkles, Image as ImageIcon, Video, BarChart3,
  TrendingUp, Heart, MessageCircle, RefreshCw, Loader2, ExternalLink,
  AlertCircle, CheckCircle, Target, Zap, Clock, Users, Brain, Lightbulb,
} from 'lucide-react';

function fmt(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

interface Advice {
  type: string; priority: string; title: string; text: string;
}

export default function CommandCenter() {
  const [tab, setTab] = useState<'post' | 'advice' | 'analytics'>('post');
  const [platform, setPlatform] = useState<'instagram' | 'facebook'>('instagram');
  const [postType, setPostType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState<any>(null);
  const [advice, setAdvice] = useState<Advice[]>([]);
  const [adviceStats, setAdviceStats] = useState<any>(null);
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [dashData, setDashData] = useState<any>(null);
  const [loadingDash, setLoadingDash] = useState(false);

  async function handlePost() {
    if (!caption.trim()) return;
    setPosting(true);
    setPostResult(null);
    try {
      let action = '';
      if (platform === 'instagram') action = postType === 'image' ? 'post_instagram_image' : 'post_instagram_reel';
      else action = 'post_facebook';

      const res = await fetch('/api/composio/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, platform, caption, imageUrl: mediaUrl, videoUrl: mediaUrl }),
      });
      const data = await res.json();
      setPostResult(data);
    } catch (err: any) {
      setPostResult({ error: err.message });
    } finally {
      setPosting(false);
    }
  }

  async function loadAdvice() {
    setLoadingAdvice(true);
    try {
      const res = await fetch('/api/composio/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_ai_advice' }),
      });
      const data = await res.json();
      setAdvice(data.advice || []);
      setAdviceStats(data.stats || null);
      setTopPosts(data.topPosts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAdvice(false);
    }
  }

  async function loadDashboard() {
    setLoadingDash(true);
    try {
      const res = await fetch('/api/composio');
      const data = await res.json();
      setDashData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDash(false);
    }
  }

  useEffect(() => {
    if (tab === 'advice' && advice.length === 0) loadAdvice();
    if (tab === 'analytics' && !dashData) loadDashboard();
  }, [tab]);

  const priorityColors: Record<string, string> = {
    high: 'text-red-400 bg-red-400/10 border-red-400/20',
    medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    low: 'text-green-400 bg-green-400/10 border-green-400/20',
  };

  const typeIcons: Record<string, React.ReactNode> = {
    content: <ImageIcon size={16} />, engagement: <Heart size={16} />, pattern: <TrendingUp size={16} />,
    reach: <Users size={16} />, posting: <Clock size={16} />, growth: <Target size={16} />,
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
              <Zap size={24} className="text-white" />
            </div>
            Social Command Center
          </h1>
          <p className="text-gray-400 mt-1">Post, analyze, and get AI advice — all in one place</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'post' as const, label: 'Create Post', icon: <Send size={16} /> },
            { id: 'advice' as const, label: 'AI Advice', icon: <Brain size={16} /> },
            { id: 'analytics' as const, label: 'Analytics', icon: <BarChart3 size={16} /> },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                tab === t.id ? 'bg-primary-600/20 text-primary-300 border border-primary-600/50' : 'text-gray-400 hover:text-white hover:bg-dark-800/50'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* === POST TAB === */}
        {tab === 'post' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Platform Select */}
              <Card>
                <h2 className="font-bold mb-4">Platform</h2>
                <div className="flex gap-3">
                  <button onClick={() => setPlatform('instagram')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all flex-1 ${
                      platform === 'instagram' ? 'border-pink-500 bg-pink-500/10 text-pink-300' : 'border-primary-700/30 text-gray-400 hover:border-primary-600/50'}`}>
                    <Instagram size={20} /> Instagram
                  </button>
                  <button onClick={() => setPlatform('facebook')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all flex-1 ${
                      platform === 'facebook' ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-primary-700/30 text-gray-400 hover:border-primary-600/50'}`}>
                    <Facebook size={20} /> Facebook
                  </button>
                </div>
              </Card>

              {/* Post Type (Instagram only) */}
              {platform === 'instagram' && (
                <Card>
                  <h2 className="font-bold mb-4">Post Type</h2>
                  <div className="flex gap-3">
                    <button onClick={() => setPostType('image')}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all flex-1 ${
                        postType === 'image' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-primary-700/30 text-gray-400'}`}>
                      <ImageIcon size={18} /> Image
                    </button>
                    <button onClick={() => setPostType('video')}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all flex-1 ${
                        postType === 'video' ? 'border-purple-500 bg-purple-500/10 text-purple-300' : 'border-primary-700/30 text-gray-400'}`}>
                      <Video size={18} /> Reel / Video
                    </button>
                  </div>
                </Card>
              )}

              {/* Media URL */}
              <Card>
                <h2 className="font-bold mb-4">{postType === 'video' ? 'Video URL' : 'Image URL'}</h2>
                <input type="url" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://example.com/your-image.jpg (must be publicly accessible)"
                  className="w-full rounded-lg border border-primary-700/30 bg-dark-800/50 px-4 py-3 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                <p className="text-xs text-gray-500 mt-2">Image/video must be hosted publicly (not a local file)</p>
              </Card>

              {/* Caption */}
              <Card>
                <h2 className="font-bold mb-4">Caption</h2>
                <textarea value={caption} onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write your caption here... Use hashtags and emojis for maximum reach"
                  rows={5}
                  className="w-full rounded-lg border border-primary-700/30 bg-dark-800/50 px-4 py-3 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none" />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">{caption.length} characters</span>
                  <span className="text-xs text-gray-500">{caption.length > 2200 ? 'Too long!' : caption.length > 1800 ? 'Getting long' : 'Good length'}</span>
                </div>
              </Card>

              {/* Post Button */}
              <Button size="lg" fullWidth onClick={handlePost}
                disabled={posting || !caption.trim() || (platform === 'instagram' && !mediaUrl.trim())}
                icon={posting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 py-4">
                {posting ? 'Publishing...' : `Post to ${platform === 'instagram' ? 'Instagram' : 'Facebook'}`}
              </Button>

              {/* Result */}
              {postResult && (
                <Card className={postResult.error ? 'border-red-500/30' : 'border-green-500/30'}>
                  {postResult.error ? (
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="font-bold text-red-400">Failed to post</p>
                        <p className="text-sm text-gray-400 mt-1">{typeof postResult.error === 'string' ? postResult.error : JSON.stringify(postResult.error)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="font-bold text-green-400">Posted successfully!</p>
                        <p className="text-sm text-gray-400 mt-1">{postResult.message || `Published to ${postResult.platform}`}</p>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-pink-900/20 to-transparent">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Lightbulb size={18} className="text-amber-400" /> Quick Tips
                </h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Use 20-25 relevant hashtags</li>
                  <li>• First line is your hook — make it count</li>
                  <li>• Post Reels for 3.5x more reach</li>
                  <li>• Best times: 7-8am, 12pm, 6-8pm SAST</li>
                  <li>• End with a question for more comments</li>
                  <li>• Carousel posts get the highest saves</li>
                </ul>
              </Card>
              <Card>
                <h3 className="font-bold mb-3">Connected Platforms</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-dark-800/50">
                    <span className="flex items-center gap-2 text-sm"><Instagram size={16} className="text-pink-400" /> Instagram</span>
                    <Badge variant="success" size="sm">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-dark-800/50">
                    <span className="flex items-center gap-2 text-sm"><Facebook size={16} className="text-blue-400" /> Facebook</span>
                    <Badge variant="warning" size="sm">Needs Pages</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* === AI ADVICE TAB === */}
        {tab === 'advice' && (
          <div className="space-y-6">
            {loadingAdvice ? (
              <div className="text-center py-16">
                <Loader2 size={48} className="animate-spin text-purple-500 mx-auto mb-4" />
                <p className="text-gray-400">Analyzing your Instagram data with AI...</p>
              </div>
            ) : (
              <>
                {adviceStats && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="text-center">
                      <p className="text-xs text-gray-400">Followers</p>
                      <p className="text-2xl font-bold">{fmt(adviceStats.followers)}</p>
                    </Card>
                    <Card className="text-center">
                      <p className="text-xs text-gray-400">Avg Engagement</p>
                      <p className="text-2xl font-bold">{adviceStats.avgEngRate}%</p>
                    </Card>
                    <Card className="text-center">
                      <p className="text-xs text-gray-400">Reel Avg Likes</p>
                      <p className="text-2xl font-bold">{fmt(adviceStats.reelAvgLikes)}</p>
                    </Card>
                    <Card className="text-center">
                      <p className="text-xs text-gray-400">Image Avg Likes</p>
                      <p className="text-2xl font-bold">{fmt(adviceStats.imageAvgLikes)}</p>
                    </Card>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Brain size={22} className="text-purple-400" /> AI Recommendations
                  </h2>
                  <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={loadAdvice}>Refresh</Button>
                </div>

                <div className="space-y-4">
                  {advice.map((a, i) => (
                    <Card key={i} className="hover:border-primary-600/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-dark-800/80 text-gray-400 mt-0.5">
                          {typeIcons[a.type] || <Sparkles size={16} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[a.priority]}`}>
                              {a.priority.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">{a.type}</span>
                          </div>
                          <h3 className="font-bold mb-1">{a.title}</h3>
                          <p className="text-sm text-gray-400">{a.text}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {topPosts.length > 0 && (
                  <>
                    <h2 className="text-xl font-bold flex items-center gap-2 mt-8">
                      <TrendingUp size={22} className="text-gold-500" /> Your Top Posts
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {topPosts.map((p: any, i: number) => (
                        <Card key={i}>
                          <Badge variant={p.type === 'VIDEO' ? 'primary' : 'success'} size="sm">{p.type}</Badge>
                          <p className="text-sm text-gray-300 mt-2 line-clamp-2">{p.caption || 'No caption'}</p>
                          <div className="flex gap-3 mt-3 text-sm">
                            <span className="text-red-400 flex items-center gap-1"><Heart size={14} /> {fmt(p.likes)}</span>
                            <span className="text-blue-400 flex items-center gap-1"><MessageCircle size={14} /> {fmt(p.comments)}</span>
                          </div>
                          <a href={p.permalink} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-primary-400 mt-2 inline-flex items-center gap-1 hover:underline">
                            View <ExternalLink size={12} />
                          </a>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* === ANALYTICS TAB === */}
        {tab === 'analytics' && (
          <div className="space-y-6">
            {loadingDash ? (
              <div className="text-center py-16">
                <Loader2 size={48} className="animate-spin text-pink-500 mx-auto mb-4" />
                <p className="text-gray-400">Loading live analytics...</p>
              </div>
            ) : dashData ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <p className="text-xs text-gray-400">Followers</p>
                    <p className="text-3xl font-bold">{fmt(dashData.summary?.followers || 0)}</p>
                  </Card>
                  <Card>
                    <p className="text-xs text-gray-400">Total Posts</p>
                    <p className="text-3xl font-bold">{fmt(dashData.summary?.totalPosts || 0)}</p>
                  </Card>
                  <Card>
                    <p className="text-xs text-gray-400">Recent Likes</p>
                    <p className="text-3xl font-bold">{fmt(dashData.summary?.totalLikes || 0)}</p>
                  </Card>
                  <Card>
                    <p className="text-xs text-gray-400">Engagement Rate</p>
                    <p className="text-3xl font-bold">{dashData.summary?.avgEngagementRate || 0}%</p>
                  </Card>
                </div>

                <h2 className="text-lg font-bold flex items-center gap-2">
                  <ImageIcon size={20} className="text-pink-400" /> Recent Posts
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(dashData.posts || []).slice(0, 9).map((post: any) => (
                    <Card key={post.id} className="hover:border-pink-500/30">
                      <div className="flex justify-between mb-2">
                        <Badge variant={post.type === 'VIDEO' ? 'primary' : 'success'} size="sm">
                          {post.type === 'VIDEO' ? 'REEL' : 'IMAGE'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2 mb-2">{post.caption || 'No caption'}</p>
                      <div className="flex gap-3 text-sm">
                        <span className="text-red-400 flex items-center gap-1"><Heart size={14} /> {fmt(post.likes)}</span>
                        <span className="text-blue-400 flex items-center gap-1"><MessageCircle size={14} /> {fmt(post.comments)}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card className="text-center py-12">
                <p className="text-gray-400">Failed to load analytics. Check your Composio API key.</p>
                <Button variant="secondary" size="sm" className="mt-4" icon={<RefreshCw size={14} />} onClick={loadDashboard}>Retry</Button>
              </Card>
            )}
          </div>
        )}

        <div className="text-center py-6">
          <p className="text-xs text-gray-600">Stud-Ex Social Command Center — Powered by Composio + Proprietary AI Engine</p>
        </div>
      </main>
    </div>
  );
}
