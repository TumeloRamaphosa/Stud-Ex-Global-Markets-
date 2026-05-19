'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  Instagram,
  Heart,
  MessageCircle,
  Users,
  Eye,
  TrendingUp,
  BarChart3,
  Image as ImageIcon,
  Video,
  RefreshCw,
  ExternalLink,
  Loader2,
  Share2,
  Bookmark,
  UserPlus,
  Activity,
  Globe,
  Sparkles,
} from 'lucide-react';

interface Post {
  id: string;
  caption: string;
  likes: number;
  comments: number;
  type: string;
  permalink: string;
  thumbnail: string;
  timestamp: string;
}

interface DashboardData {
  profile: {
    username: string;
    biography: string;
    followers_count: number;
    follows_count: number;
    media_count: number;
    profile_picture_url: string;
    account_type: string;
  };
  posts: Post[];
  insights: Record<string, { end_time: string; value: number }[]>;
  summary: {
    followers: number;
    following: number;
    totalPosts: number;
    recentPostCount: number;
    totalLikes: number;
    totalComments: number;
    avgEngagementRate: string;
  };
}

function fmt(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-xs mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
      </div>
      {sub && <p className="text-xs text-gray-500 mt-2">{sub}</p>}
    </Card>
  );
}

export default function SocialDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/composio');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-400">Pulling live data from Composio...</p>
          <p className="text-xs text-gray-600 mt-1">Connecting to Instagram, Facebook, Gmail, Discord</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-dark text-white flex items-center justify-center">
        <Card className="max-w-md text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <p className="text-gray-500 text-sm mb-4">Make sure COMPOSIO_API_KEY is set in your environment variables.</p>
          <Button onClick={loadData} icon={<RefreshCw size={16} />}>Retry</Button>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { profile, posts, insights, summary } = data;
  const topPost = posts.reduce((best, p) => (p.likes + p.comments) > (best.likes + best.comments) ? p : best, posts[0]);
  const reels = posts.filter(p => p.type === 'VIDEO');
  const images = posts.filter(p => p.type === 'IMAGE');
  const carousels = posts.filter(p => p.type === 'CAROUSEL_ALBUM');

  const reachData = insights?.reach || [];
  const todayReach = reachData[reachData.length - 1]?.value || 0;

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center gap-4">
            {profile.profile_picture_url && (
              <img src={profile.profile_picture_url} alt="" className="w-16 h-16 rounded-full border-2 border-pink-500" />
            )}
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                  <Instagram size={20} className="text-white" />
                </div>
                Social Analytics Dashboard
              </h1>
              <p className="text-gray-400">@{profile.username} — {profile.account_type} Account</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <span className="text-xs text-gray-500">Updated {lastUpdated}</span>
            <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={loadData}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Bio */}
        <Card className="mb-6 border-pink-500/20">
          <p className="text-sm text-gray-300">{profile.biography}</p>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Users size={22} className="text-pink-400" />}
            label="Followers"
            value={fmt(summary.followers)}
            sub={`Following: ${fmt(summary.following)}`}
            color="bg-pink-500/10"
          />
          <StatCard
            icon={<ImageIcon size={22} className="text-blue-400" />}
            label="Total Posts"
            value={fmt(summary.totalPosts)}
            sub={`${summary.recentPostCount} recent`}
            color="bg-blue-500/10"
          />
          <StatCard
            icon={<Heart size={22} className="text-red-400" />}
            label="Recent Likes"
            value={fmt(summary.totalLikes)}
            sub={`Across ${summary.recentPostCount} posts`}
            color="bg-red-500/10"
          />
          <StatCard
            icon={<TrendingUp size={22} className="text-emerald-400" />}
            label="Avg Engagement"
            value={`${summary.avgEngagementRate}%`}
            sub={todayReach > 0 ? `${fmt(todayReach)} reach today` : 'Based on recent posts'}
            color="bg-emerald-500/10"
          />
        </div>

        {/* Insights Row */}
        {Object.keys(insights).length > 0 && (
          <>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity size={20} className="text-primary-400" />
              Daily Insights (Last 2 Days)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {Object.entries(insights).map(([metric, values]) => {
                const latest = values[values.length - 1]?.value || 0;
                const prev = values[0]?.value || 0;
                const diff = latest - prev;
                return (
                  <Card key={metric} className="text-center">
                    <p className="text-xs text-gray-400 mb-1 capitalize">{metric.replace(/_/g, ' ')}</p>
                    <p className="text-2xl font-bold">{fmt(latest)}</p>
                    {diff !== 0 && (
                      <p className={`text-xs mt-1 ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {diff > 0 ? '+' : ''}{fmt(diff)} from yesterday
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Content Mix */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-primary-400" />
              Content Mix
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} className="text-blue-400" />
                  <span className="text-sm">Images</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-dark-800 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(images.length / posts.length * 100)}%` }} />
                  </div>
                  <span className="text-sm font-bold w-8">{images.length}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video size={16} className="text-purple-400" />
                  <span className="text-sm">Reels</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-dark-800 rounded-full">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(reels.length / posts.length * 100)}%` }} />
                  </div>
                  <span className="text-sm font-bold w-8">{reels.length}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-amber-400" />
                  <span className="text-sm">Carousels</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-dark-800 rounded-full">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(carousels.length / Math.max(posts.length, 1) * 100)}%` }} />
                  </div>
                  <span className="text-sm font-bold w-8">{carousels.length}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Top Post */}
          {topPost && (
            <Card className="border-gold-500/20 lg:col-span-2">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-gold-500" />
                Top Performing Post
              </h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-300 mb-3">{topPost.caption || 'No caption'}...</p>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1 text-red-400"><Heart size={14} /> {fmt(topPost.likes)}</span>
                    <span className="flex items-center gap-1 text-blue-400"><MessageCircle size={14} /> {fmt(topPost.comments)}</span>
                    <Badge variant={topPost.type === 'VIDEO' ? 'primary' : 'success'} size="sm">{topPost.type}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{timeAgo(topPost.timestamp)}</p>
                  <a href={topPost.permalink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary-400 mt-2 hover:underline">
                    View on Instagram <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Recent Posts Grid */}
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ImageIcon size={20} className="text-pink-400" />
          Recent Posts
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {posts.slice(0, 9).map((post) => (
            <Card key={post.id} className="hover:border-pink-500/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={post.type === 'VIDEO' ? 'primary' : post.type === 'CAROUSEL_ALBUM' ? 'warning' : 'success'} size="sm">
                  {post.type === 'VIDEO' ? 'REEL' : post.type === 'CAROUSEL_ALBUM' ? 'CAROUSEL' : 'IMAGE'}
                </Badge>
                <span className="text-xs text-gray-500">{timeAgo(post.timestamp)}</span>
              </div>
              <p className="text-sm text-gray-300 mb-3 line-clamp-2">{post.caption || 'No caption'}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-3 text-sm">
                  <span className="flex items-center gap-1 text-red-400"><Heart size={14} /> {fmt(post.likes)}</span>
                  <span className="flex items-center gap-1 text-blue-400"><MessageCircle size={14} /> {fmt(post.comments)}</span>
                </div>
                <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-400">
                  <ExternalLink size={14} />
                </a>
              </div>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-600">
            Live data powered by Composio + Stud-Ex Proprietary Analytics Engine
          </p>
        </div>
      </main>
    </div>
  );
}
