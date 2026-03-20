'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  TrendingUp,
  Eye,
  Users,
  Send,
  Plus,
  BarChart3,
  Megaphone,
  Settings,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react';
import { marketingApi } from '@/lib/marketing-api';
import type { MarketingProfile, MarketingPost } from '@/lib/marketing-types';
import { PLATFORM_LABELS } from '@/lib/marketing-types';

export default function MarketingDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<MarketingProfile | null>(null);
  const [posts, setPosts] = useState<MarketingPost[]>([]);
  const [loading, setLoading] = useState(true);

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

  const totalPosts = posts.length;
  const postedCount = posts.filter((p) => p.status === 'posted').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const failedCount = posts.filter((p) => p.status === 'failed').length;

  const totalPlatformPosts = posts.reduce((acc, p) => acc + p.platforms.length, 0);

  if (!loading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-dark text-white">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 overflow-auto">
            <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
              <div className="text-center py-20">
                <Megaphone size={64} className="mx-auto text-primary-400 mb-6" />
                <h1 className="text-4xl font-bold mb-4">Marketing Skill App</h1>
                <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                  AI-powered automated marketing for TikTok, Instagram, and 10+ platforms.
                  Create viral slideshows, post everywhere, and track what converts.
                </p>
                <Button
                  size="lg"
                  icon={<Zap size={20} />}
                  onClick={() => router.push('/marketing/settings')}
                >
                  Set Up Marketing Profile
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <Card>
                  <ImageIcon size={32} className="text-primary-400 mb-3" />
                  <h3 className="font-bold text-lg mb-2">AI Slideshow Creator</h3>
                  <p className="text-gray-400 text-sm">
                    Generate 6-slide TikTok-optimized carousels with AI images and viral text overlays.
                  </p>
                </Card>
                <Card>
                  <Send size={32} className="text-emerald-400 mb-3" />
                  <h3 className="font-bold text-lg mb-2">Multi-Platform Posting</h3>
                  <p className="text-gray-400 text-sm">
                    Post to TikTok, Instagram, YouTube, LinkedIn, and more in a single click.
                  </p>
                </Card>
                <Card>
                  <BarChart3 size={32} className="text-gold-400 mb-3" />
                  <h3 className="font-bold text-lg mb-2">Intelligence Loop</h3>
                  <p className="text-gray-400 text-sm">
                    Daily reports diagnose what works and recommend data-driven adjustments.
                  </p>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
                  <Megaphone size={32} className="text-primary-400" />
                  Marketing Dashboard
                </h1>
                <p className="text-gray-400">
                  {profile?.appName} — Automated marketing pipeline
                </p>
              </div>
              <div className="flex gap-3 mt-4 sm:mt-0">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<BarChart3 size={18} />}
                  onClick={() => router.push('/marketing/analytics')}
                >
                  Analytics
                </Button>
                <Button
                  size="sm"
                  icon={<Plus size={18} />}
                  onClick={() => router.push('/marketing/create')}
                >
                  Create Post
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Posts</p>
                    <p className="text-3xl font-bold">{totalPosts}</p>
                  </div>
                  <Send className="text-primary-400" size={24} />
                </div>
                <p className="text-primary-400 text-sm mt-3">{postedCount} published</p>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Platform Reach</p>
                    <p className="text-3xl font-bold">{totalPlatformPosts}</p>
                  </div>
                  <Users className="text-emerald-500" size={24} />
                </div>
                <p className="text-emerald-500 text-sm mt-3">
                  {profile?.uploadPost.platforms.length || 0} connected platforms
                </p>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Drafts</p>
                    <p className="text-3xl font-bold">{draftCount}</p>
                  </div>
                  <Clock className="text-amber-400" size={24} />
                </div>
                <p className="text-amber-400 text-sm mt-3">Ready to publish</p>
              </Card>

              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Success Rate</p>
                    <p className="text-3xl font-bold">
                      {totalPosts > 0 ? Math.round((postedCount / totalPosts) * 100) : 0}%
                    </p>
                  </div>
                  {failedCount > 0 ? (
                    <AlertTriangle className="text-red-400" size={24} />
                  ) : (
                    <CheckCircle className="text-green-400" size={24} />
                  )}
                </div>
                <p className={`text-sm mt-3 ${failedCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {failedCount > 0 ? `${failedCount} failed` : 'All posts successful'}
                </p>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              {/* Recent Posts */}
              <div className="lg:col-span-2">
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <TrendingUp size={24} className="text-gold-500" />
                      Recent Posts
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/marketing/campaigns')}
                    >
                      View All
                    </Button>
                  </div>

                  {posts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No posts yet. Create your first slideshow!</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => router.push('/marketing/create')}
                      >
                        Create Post
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts.slice(0, 5).map((post) => (
                        <div
                          key={post.id}
                          className="border-b border-primary-700/20 pb-4 last:border-0"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-bold truncate">{post.hookText}</h3>
                              <p className="text-sm text-gray-400">
                                {post.platforms.map((p) => PLATFORM_LABELS[p]).join(', ')}
                              </p>
                            </div>
                            <Badge
                              variant={
                                post.status === 'posted'
                                  ? 'success'
                                  : post.status === 'failed'
                                  ? 'error'
                                  : post.status === 'draft'
                                  ? 'info'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              {post.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{post.slides.length} slides</span>
                            <span>{post.hookCategory}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-primary-900/30 to-transparent">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Zap size={20} className="text-gold-500" />
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <Button
                      variant="secondary"
                      fullWidth
                      icon={<Plus size={18} />}
                      onClick={() => router.push('/marketing/create')}
                    >
                      Create Slideshow
                    </Button>
                    <Button
                      variant="secondary"
                      fullWidth
                      icon={<BarChart3 size={18} />}
                      onClick={() => router.push('/marketing/analytics')}
                    >
                      View Analytics
                    </Button>
                    <Button
                      variant="secondary"
                      fullWidth
                      icon={<Settings size={18} />}
                      onClick={() => router.push('/marketing/settings')}
                    >
                      Settings
                    </Button>
                  </div>
                </Card>

                {/* Connected Platforms */}
                <Card>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Send size={20} className="text-emerald-400" />
                    Connected Platforms
                  </h2>
                  <div className="space-y-2">
                    {profile?.uploadPost.platforms.map((platform) => (
                      <div
                        key={platform}
                        className="flex items-center justify-between p-2 rounded-lg bg-dark-800/50"
                      >
                        <span className="text-sm font-medium">
                          {PLATFORM_LABELS[platform]}
                        </span>
                        <Badge variant="success" size="sm">
                          Connected
                        </Badge>
                      </div>
                    ))}
                    {(!profile?.uploadPost.platforms ||
                      profile.uploadPost.platforms.length === 0) && (
                      <p className="text-sm text-gray-500">No platforms connected</p>
                    )}
                  </div>
                </Card>

                {/* Posting Schedule */}
                <Card>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-amber-400" />
                    Posting Schedule
                  </h2>
                  <div className="space-y-2">
                    {(profile?.posting.schedule || ['07:30', '16:30', '21:00']).map(
                      (time, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-2 rounded-lg bg-dark-800/50"
                        >
                          <Clock size={16} className="text-gray-500" />
                          <span className="text-sm font-medium">{time}</span>
                        </div>
                      )
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
