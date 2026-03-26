'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  Plus,
  Trash2,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { getLarryAPI } from '@/lib/larry-api';
import type { Campaign } from '@/lib/larry-api';

export default function CampaignsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const api = getLarryAPI();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await api.getCampaigns();
      setCampaigns(data.campaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      setDeleting(id);
      await api.deleteCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'published':
        return 'bg-purple-100 text-purple-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'running':
        return <Clock size={16} className="animate-spin" />;
      case 'published':
        return <TrendingUp size={16} />;
      default:
        return <AlertTriangle size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Larry Skill Campaigns
                </h1>
                <p className="text-slate-600 mt-2">
                  Manage all your marketing campaigns in one place
                </p>
              </div>
              <Button
                onClick={() => router.push('/larry-skill')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Plus size={18} />
                New Campaign
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <Card className="p-4">
                <div className="text-slate-600 text-sm font-semibold">Total</div>
                <div className="text-3xl font-bold text-slate-900 mt-2">
                  {campaigns.length}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-slate-600 text-sm font-semibold">Running</div>
                <div className="text-3xl font-bold text-blue-600 mt-2">
                  {campaigns.filter((c) => c.status === 'running').length}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-slate-600 text-sm font-semibold">Completed</div>
                <div className="text-3xl font-bold text-green-600 mt-2">
                  {campaigns.filter((c) => c.status === 'completed').length}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-slate-600 text-sm font-semibold">Total Views</div>
                <div className="text-3xl font-bold text-purple-600 mt-2">
                  {campaigns
                    .reduce((sum, c) => sum + c.metrics.views, 0)
                    .toLocaleString()}
                </div>
              </Card>
            </div>

            {/* Campaigns List */}
            {loading ? (
              <Card className="p-8 text-center">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full" />
                <p className="text-slate-600 mt-4">Loading campaigns...</p>
              </Card>
            ) : campaigns.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  No campaigns yet
                </h3>
                <p className="text-slate-600 mb-6">
                  Create your first campaign to get started with Larry Skill
                </p>
                <Button
                  onClick={() => router.push('/larry-skill')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500"
                >
                  <Plus size={18} />
                  Create Campaign
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <Card
                    key={campaign.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() =>
                      router.push(`/larry-skill/campaigns/${campaign.id}`)
                    }
                  >
                    <div className="flex items-start justify-between">
                      {/* Campaign Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-900">
                            {campaign.title}
                          </h3>
                          <Badge className={getStatusColor(campaign.status)}>
                            {getStatusIcon(campaign.status)}
                            <span className="ml-1 capitalize">
                              {campaign.status}
                            </span>
                          </Badge>
                        </div>

                        <div className="flex gap-4 mb-4 text-sm text-slate-600">
                          <span>📍 {campaign.niche}</span>
                          <span>👥 {campaign.targetAudience.substring(0, 40)}...</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Progress */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-slate-700">
                              Progress
                            </span>
                            <span className="text-sm text-slate-600">
                              {
                                campaign.steps.filter(
                                  (s) => s.status === 'completed'
                                ).length
                              }
                              /{campaign.steps.length}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${
                                  (campaign.steps.filter(
                                    (s) => s.status === 'completed'
                                  ).length /
                                    campaign.steps.length) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-4 gap-4 text-center text-sm">
                          <div>
                            <Eye size={18} className="mx-auto mb-1 text-blue-600" />
                            <div className="font-semibold">
                              {campaign.metrics.views.toLocaleString()}
                            </div>
                            <div className="text-slate-500 text-xs">Views</div>
                          </div>
                          <div>
                            <Heart size={18} className="mx-auto mb-1 text-red-600" />
                            <div className="font-semibold">
                              {campaign.metrics.likes.toLocaleString()}
                            </div>
                            <div className="text-slate-500 text-xs">Likes</div>
                          </div>
                          <div>
                            <Share2 size={18} className="mx-auto mb-1 text-green-600" />
                            <div className="font-semibold">
                              {campaign.metrics.shares.toLocaleString()}
                            </div>
                            <div className="text-slate-500 text-xs">Shares</div>
                          </div>
                          <div>
                            <MessageCircle size={18} className="mx-auto mb-1 text-purple-600" />
                            <div className="font-semibold">
                              {campaign.metrics.comments.toLocaleString()}
                            </div>
                            <div className="text-slate-500 text-xs">Comments</div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/larry-skill/campaigns/${campaign.id}`);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          View
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(campaign.id);
                          }}
                          variant="outline"
                          size="sm"
                          disabled={deleting === campaign.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
