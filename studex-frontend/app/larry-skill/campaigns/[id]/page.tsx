'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Save,
  Copy,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Zap,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { getLarryAPI } from '@/lib/larry-api';
import type { Campaign } from '@/lib/larry-api';

export default function CampaignDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [caption, setCaption] = useState('');
  const [cta, setCta] = useState('');

  const api = getLarryAPI();

  useEffect(() => {
    loadCampaign();
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const data = await api.getCampaign(campaignId);
      setCampaign(data);
      setCaption(data.content.caption);
      setCta(data.content.cta);
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast.error('Failed to load campaign');
      router.push('/larry-skill/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!campaign) return;

    try {
      setSaving(true);
      await api.updateCampaign(campaignId, {
        ...campaign,
        content: {
          ...campaign.content,
          caption,
          cta,
        },
      });
      setCampaign((prev) =>
        prev ? { ...prev, content: { ...prev.content, caption, cta } } : null
      );
      setEditing(false);
      toast.success('Campaign updated');
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error('Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex flex-col">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin inline-block w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full" />
              <p className="text-slate-600 mt-4">Loading campaign...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex flex-col">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 flex items-center justify-center">
            <Card className="p-8 text-center">
              <p className="text-slate-600">Campaign not found</p>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.push('/larry-skill/campaigns')}
                  variant="outline"
                >
                  <ArrowLeft size={18} />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {campaign.title}
                  </h1>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <Button
                      onClick={() => {
                        setCaption(campaign.content.caption);
                        setCta(campaign.content.cta);
                        setEditing(false);
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save size={18} />
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Zap size={18} />
                    Edit
                  </Button>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Campaign Info */}
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">Campaign Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">
                        Niche
                      </label>
                      <p className="text-slate-900 font-medium mt-1">
                        {campaign.niche}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">
                        Target Audience
                      </label>
                      <p className="text-slate-900 font-medium mt-1">
                        {campaign.targetAudience}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">
                        Platforms
                      </label>
                      <div className="flex gap-2 mt-2">
                        {campaign.content.platforms.map((p) => (
                          <Badge key={p} className="bg-blue-100 text-blue-800">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Hook Formula */}
                {campaign.content.hook && (
                  <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-amber-900 mb-2">
                          🎣 Hook Formula
                        </h3>
                        <p className="text-amber-900 text-lg font-semibold">
                          "{campaign.content.hook}"
                        </p>
                      </div>
                      <Button
                        onClick={() => copyToClipboard(campaign.content.hook)}
                        variant="outline"
                        size="sm"
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Slides */}
                {campaign.content.slides.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">📸 Slide Content</h3>
                    <div className="space-y-3">
                      {campaign.content.slides.map((slide, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-100 rounded-lg flex items-start justify-between"
                        >
                          <div>
                            <div className="text-sm font-semibold text-slate-600">
                              Slide {idx + 1}
                            </div>
                            <p className="text-slate-900 mt-1">{slide}</p>
                          </div>
                          <Button
                            onClick={() => copyToClipboard(slide)}
                            variant="outline"
                            size="sm"
                          >
                            <Copy size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Caption & CTA */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">✍️ Caption & Call-to-Action</h3>

                  {editing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Caption
                        </label>
                        <Textarea
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          placeholder="Write your caption here..."
                          rows={4}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          {caption.length}/150 characters
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Call-to-Action
                        </label>
                        <Textarea
                          value={cta}
                          onChange={(e) => setCta(e.target.value)}
                          placeholder="What action do you want people to take?"
                          rows={2}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {campaign.content.caption && (
                        <div className="p-3 bg-blue-50 rounded-lg flex items-start justify-between">
                          <div>
                            <div className="text-sm font-semibold text-blue-900">
                              Caption
                            </div>
                            <p className="text-blue-900 mt-1">
                              {campaign.content.caption}
                            </p>
                          </div>
                          <Button
                            onClick={() =>
                              copyToClipboard(campaign.content.caption)
                            }
                            variant="outline"
                            size="sm"
                          >
                            <Copy size={16} />
                          </Button>
                        </div>
                      )}
                      {campaign.content.cta && (
                        <div className="p-3 bg-green-50 rounded-lg flex items-start justify-between">
                          <div>
                            <div className="text-sm font-semibold text-green-900">
                              Call-to-Action
                            </div>
                            <p className="text-green-900 mt-1">
                              {campaign.content.cta}
                            </p>
                          </div>
                          <Button
                            onClick={() =>
                              copyToClipboard(campaign.content.cta)
                            }
                            variant="outline"
                            size="sm"
                          >
                            <Copy size={16} />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Workflow Progress */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Workflow Progress</h3>
                  <div className="space-y-3">
                    {campaign.steps.map((step) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded"
                      >
                        <div>
                          {step.status === 'completed' && (
                            <CheckCircle
                              size={20}
                              className="text-green-600"
                            />
                          )}
                          {step.status === 'in_progress' && (
                            <Clock
                              size={20}
                              className="text-blue-600 animate-spin"
                            />
                          )}
                          {step.status === 'failed' && (
                            <AlertTriangle
                              size={20}
                              className="text-red-600"
                            />
                          )}
                          {step.status === 'pending' && (
                            <Clock
                              size={20}
                              className="text-slate-400"
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {step.name}
                          </p>
                          <p className="text-xs text-slate-600 capitalize">
                            {step.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Metrics */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Performance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-700">
                        <Eye size={16} className="text-blue-600" />
                        Views
                      </span>
                      <span className="font-bold text-slate-900">
                        {campaign.metrics.views.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-700">
                        <Heart size={16} className="text-red-600" />
                        Likes
                      </span>
                      <span className="font-bold text-slate-900">
                        {campaign.metrics.likes.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-700">
                        <Share2 size={16} className="text-green-600" />
                        Shares
                      </span>
                      <span className="font-bold text-slate-900">
                        {campaign.metrics.shares.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-700">
                        <MessageCircle size={16} className="text-purple-600" />
                        Comments
                      </span>
                      <span className="font-bold text-slate-900">
                        {campaign.metrics.comments.toLocaleString()}
                      </span>
                    </div>
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
