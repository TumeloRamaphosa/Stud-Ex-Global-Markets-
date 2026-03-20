'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Plus,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Trash2,
  Eye,
  MoreVertical,
  Filter,
  Layers,
} from 'lucide-react';
import { marketingApi } from '@/lib/marketing-api';
import type { MarketingProfile, MarketingPost } from '@/lib/marketing-types';
import { PLATFORM_LABELS } from '@/lib/marketing-types';

const STATUS_CONFIG: Record<
  string,
  { icon: React.ReactNode; variant: 'success' | 'warning' | 'error' | 'info' | 'primary'; label: string }
> = {
  draft: { icon: <Clock size={14} />, variant: 'info', label: 'Draft' },
  queued: { icon: <Clock size={14} />, variant: 'warning', label: 'Queued' },
  generating: { icon: <ImageIcon size={14} />, variant: 'warning', label: 'Generating' },
  ready: { icon: <CheckCircle size={14} />, variant: 'info', label: 'Ready' },
  posting: { icon: <Send size={14} />, variant: 'warning', label: 'Posting' },
  posted: { icon: <CheckCircle size={14} />, variant: 'success', label: 'Posted' },
  failed: { icon: <XCircle size={14} />, variant: 'error', label: 'Failed' },
};

export default function CampaignsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<MarketingProfile | null>(null);
  const [posts, setPosts] = useState<MarketingPost[]>([]);
  const [activeTab, setActiveTab] = useState('all');
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
        console.error('Failed to load campaigns:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadData();
  }, [user]);

  const handleDeletePost = async (postId: string) => {
    try {
      await marketingApi.posts.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Post deleted');
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  const filteredPosts =
    activeTab === 'all'
      ? posts
      : posts.filter((p) => p.status === activeTab);

  const tabItems = [
    { id: 'all', label: `All (${posts.length})`, icon: <Layers size={16} /> },
    {
      id: 'draft',
      label: `Drafts (${posts.filter((p) => p.status === 'draft').length})`,
      icon: <Clock size={16} />,
    },
    {
      id: 'posted',
      label: `Posted (${posts.filter((p) => p.status === 'posted').length})`,
      icon: <CheckCircle size={16} />,
    },
    {
      id: 'failed',
      label: `Failed (${posts.filter((p) => p.status === 'failed').length})`,
      icon: <XCircle size={16} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ArrowLeft size={18} />}
                  onClick={() => router.push('/marketing')}
                >
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Layers size={28} className="text-primary-400" />
                    Campaign Manager
                  </h1>
                  <p className="text-gray-400">
                    Manage all your marketing posts and campaigns
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                icon={<Plus size={18} />}
                className="mt-4 sm:mt-0"
                onClick={() => router.push('/marketing/create')}
              >
                Create Post
              </Button>
            </div>

            <Tabs items={tabItems} activeTab={activeTab} onTabChange={setActiveTab}>
              {filteredPosts.length === 0 ? (
                <Card>
                  <div className="text-center py-16 text-gray-500">
                    <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No posts found</p>
                    <p className="text-sm">
                      {activeTab === 'all'
                        ? 'Create your first marketing post to get started.'
                        : `No ${activeTab} posts.`}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => router.push('/marketing/create')}
                    >
                      Create Post
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredPosts.map((post) => {
                    const statusConfig = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;

                    return (
                      <Card key={post.id} className="hover:border-primary-600/50">
                        <div className="flex items-start gap-4">
                          {/* Slide Preview */}
                          <div className="flex-shrink-0 w-16 h-24 rounded-lg bg-dark-800/50 border border-primary-700/20 overflow-hidden">
                            {post.slides[0]?.imageUrl ? (
                              <img
                                src={post.slides[0].imageUrl}
                                alt="Slide 1"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon size={20} className="text-gray-600" />
                              </div>
                            )}
                          </div>

                          {/* Post Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold truncate">
                                  {post.hookText || 'Untitled Post'}
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">
                                  {post.slides.length} slides ·{' '}
                                  {post.platforms.map((p) => PLATFORM_LABELS[p]).join(', ')}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <Badge variant={statusConfig.variant} size="sm">
                                  {statusConfig.icon}
                                  {statusConfig.label}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 mt-3">
                              <Badge variant="primary" size="sm">
                                {post.hookCategory}
                              </Badge>
                              {post.ctaText && (
                                <span className="text-xs text-gray-500 truncate">
                                  CTA: {post.ctaText}
                                </span>
                              )}
                            </div>

                            {/* Platform Results */}
                            {post.platformResults &&
                              Object.keys(post.platformResults).length > 0 && (
                                <div className="flex gap-2 mt-3">
                                  {Object.entries(post.platformResults).map(
                                    ([platform, result]) => (
                                      <Badge
                                        key={platform}
                                        variant={
                                          result.status === 'success'
                                            ? 'success'
                                            : result.status === 'failed'
                                            ? 'error'
                                            : 'warning'
                                        }
                                        size="sm"
                                      >
                                        {PLATFORM_LABELS[platform as keyof typeof PLATFORM_LABELS] ||
                                          platform}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {post.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 size={16} />}
                                onClick={() => post.id && handleDeletePost(post.id)}
                                className="text-red-400 hover:text-red-300"
                              />
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
