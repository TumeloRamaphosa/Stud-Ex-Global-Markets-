'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Camera,
  Image,
  Send,
  Loader2,
  Play,
  Pause,
  DollarSign,
  Eye,
  MousePointer,
  TrendingUp,
  Zap,
  Brain,
  Copy,
  ChevronRight,
  Target,
  Users,
  Calendar,
  Plus,
  Layers,
  Film,
  Smartphone,
  Check,
  AlertCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = 'facebook' | 'instagram' | 'both';
type AdType = 'image' | 'carousel' | 'reel' | 'story';
type Tab = 'create' | 'campaigns' | 'quickpost' | 'templates';

interface Campaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED';
  objective: string;
  daily_budget: string;
  lifetime_budget: string;
  start_time?: string;
  spend?: string;
  reach?: string;
  cpc?: string;
  ctr?: string;
}

interface AdFormData {
  headline: string;
  primaryText: string;
  cta: string;
  linkUrl: string;
  imageUrl: string;
  budget: string;
  duration: string;
  audiences: string[];
}

interface QuickPostData {
  platform: 'facebook' | 'instagram';
  caption: string;
  imageUrl: string;
}

// ─── Templates ────────────────────────────────────────────────────────────────

const AD_TEMPLATES = [
  {
    id: 'biltong-special',
    name: 'Biltong Special',
    headline: 'Premium Wagyu Biltong — R500/kg',
    primaryText:
      'Handcrafted. Air-dried to perfection. Our Wagyu biltong is made from the finest Japanese-cross cattle, marbled for flavour and sliced to order. Taste what premium really means.',
    cta: 'SHOP_NOW',
    imageUrl: '',
    color: '#8B4513',
  },
  {
    id: 'wagyu-box',
    name: 'Wagyu Box',
    headline: 'The Ultimate Wagyu Experience',
    primaryText:
      'A curated premium box of Wagyu cuts — from ribeye to fillet, biltong to boerewors. The perfect gift for the meat connoisseur. Delivered fresh to your door across South Africa.',
    cta: 'ORDER_NOW',
    imageUrl: '',
    color: '#D4A017',
  },
  {
    id: 'weekend-braai',
    name: 'Weekend Braai',
    headline: 'Weekend Braai Sorted',
    primaryText:
      'Wagyu steaks + artisan boerewors + dry-aged biltong. Everything you need for the perfect South African braai, delivered by Friday. Premium quality, no compromises.',
    cta: 'SHOP_NOW',
    imageUrl: '',
    color: '#2E7D32',
  },
  {
    id: 'ankole-heritage',
    name: 'Ankole Heritage',
    headline: 'Discover Ankole Beef',
    primaryText:
      "Africa’s heritage breed, raised on open pastures. Ankole cattle produce lean, flavourful beef with a story that spans generations. Sustainably farmed, ethically sourced, unmistakably African.",
    cta: 'LEARN_MORE',
    imageUrl: '',
    color: '#B71C1C',
  },
];

const CTA_OPTIONS = [
  { value: 'SHOP_NOW', label: 'Shop Now' },
  { value: 'LEARN_MORE', label: 'Learn More' },
  { value: 'ORDER_NOW', label: 'Order Now' },
  { value: 'CONTACT_US', label: 'Contact Us' },
  { value: 'SIGN_UP', label: 'Sign Up' },
];

const AUDIENCE_OPTIONS = [
  'Johannesburg',
  'Cape Town',
  'Durban',
  'Pretoria',
  'Nationwide',
];

const PLACEHOLDER_POSTS = [
  {
    id: '1',
    caption: 'Weekend braai essentials, sorted. Premium Wagyu steaks now available.',
    platform: 'facebook',
    date: '2026-05-29',
    likes: 142,
    comments: 23,
    shares: 18,
  },
  {
    id: '2',
    caption: 'Biltong perfection. Air-dried, hand-sliced, unforgettable.',
    platform: 'instagram',
    date: '2026-05-28',
    likes: 287,
    comments: 41,
    shares: 32,
  },
  {
    id: '3',
    caption: 'New Ankole range just dropped. Heritage beef, modern flavour.',
    platform: 'facebook',
    date: '2026-05-27',
    likes: 98,
    comments: 15,
    shares: 11,
  },
  {
    id: '4',
    caption: 'From our farm to your table. Zero compromise on quality.',
    platform: 'instagram',
    date: '2026-05-26',
    likes: 321,
    comments: 56,
    shares: 44,
  },
  {
    id: '5',
    caption: 'Wagyu Wednesday is here. 10% off all cuts, today only.',
    platform: 'facebook',
    date: '2026-05-25',
    likes: 203,
    comments: 34,
    shares: 27,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [platform, setPlatform] = useState<Platform>('both');
  const [adType, setAdType] = useState<AdType>('image');
  const [formData, setFormData] = useState<AdFormData>({
    headline: '',
    primaryText: '',
    cta: 'SHOP_NOW',
    linkUrl: 'https://studexmeat.com/store',
    imageUrl: '',
    budget: '100',
    duration: '7',
    audiences: [],
  });

  const [quickPost, setQuickPost] = useState<QuickPostData>({
    platform: 'facebook',
    caption: '',
    imageUrl: '',
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [postingAd, setPostingAd] = useState(false);
  const [generatingCopy, setGeneratingCopy] = useState(false);
  const [postingQuick, setPostingQuick] = useState(false);
  const [generatingQuick, setGeneratingQuick] = useState(false);
  const [togglingCampaign, setTogglingCampaign] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // ─── Notification helper ────────────────────────────────────────────

  const showNotification = useCallback(
    (type: 'success' | 'error', message: string) => {
      setNotification({ type, message });
      setTimeout(() => setNotification(null), 4000);
    },
    []
  );

  // ─── Load campaigns ─────────────────────────────────────────────────

  const loadCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const res = await fetch('/api/meta-ads?action=campaigns');
      const data = await res.json();
      const campaignList: Campaign[] = (data.data || []).map((c: any) => ({
        id: c.id,
        name: c.name || 'Untitled Campaign',
        status: c.status || 'PAUSED',
        objective: c.objective || 'CONVERSIONS',
        daily_budget: c.daily_budget || '0',
        lifetime_budget: c.lifetime_budget || '0',
        start_time: c.start_time,
      }));

      // Fetch insights for spend/reach/cpc/ctr
      try {
        const insightsRes = await fetch('/api/meta-ads?action=insights&period=last_30d');
        const insightsData = await insightsRes.json();
        if (insightsData.data?.[0]) {
          const ins = insightsData.data[0];
          campaignList.forEach((c) => {
            c.spend = ins.spend || '0';
            c.reach = ins.reach || '0';
            c.cpc = ins.cpc || '0';
            c.ctr = ins.ctr || '0';
          });
        }
      } catch {
        // Insights may not be available
      }

      setCampaigns(campaignList);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
      showNotification('error', 'Failed to load campaigns');
    } finally {
      setLoadingCampaigns(false);
    }
  }, [showNotification]);

  useEffect(() => {
    if (activeTab === 'campaigns') {
      loadCampaigns();
    }
  }, [activeTab, loadCampaigns]);

  // ─── Post ad ────────────────────────────────────────────────────────

  const handlePostAd = async () => {
    if (!formData.headline || !formData.primaryText) {
      showNotification('error', 'Please fill in headline and primary text');
      return;
    }
    setPostingAd(true);
    try {
      const message = `${formData.headline}\n\n${formData.primaryText}`;

      if (formData.imageUrl) {
        const res = await fetch('/api/facebook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'fb_post_photo',
            imageUrl: formData.imageUrl,
            caption: message,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showNotification('success', 'Ad posted successfully!');
        } else {
          showNotification(
            'error',
            data.error || data.data?.error?.message || 'Failed to post ad'
          );
        }
      } else {
        const res = await fetch('/api/facebook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'fb_post_link',
            message,
            link: formData.linkUrl,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showNotification('success', 'Ad posted successfully!');
        } else {
          showNotification(
            'error',
            data.error || data.data?.error?.message || 'Failed to post ad'
          );
        }
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to post ad');
    } finally {
      setPostingAd(false);
    }
  };

  // ─── AI Generate ────────────────────────────────────────────────────

  const handleGenerateCopy = async () => {
    setGeneratingCopy(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_content',
          contentType: 'ad',
          platform: platform === 'both' ? 'facebook and instagram' : platform,
          product: 'Wagyu Biltong',
        }),
      });
      const data = await res.json();
      if (data.content) {
        // Try to parse headline and text from AI response
        const content = data.content;
        const headlineMatch = content.match(
          /(?:headline|title|subject)[:\s]*(.+?)(?:\n|$)/i
        );
        const lines = content.split('\n').filter((l: string) => l.trim());

        setFormData((prev) => ({
          ...prev,
          headline: headlineMatch?.[1]?.trim() || lines[0]?.trim() || prev.headline,
          primaryText:
            lines.length > 1
              ? lines
                  .slice(1, 4)
                  .join('\n')
                  .trim()
              : content.slice(0, 280),
        }));
        showNotification('success', 'AI copy generated!');
      } else {
        showNotification('error', 'No content returned from AI');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to generate copy');
    } finally {
      setGeneratingCopy(false);
    }
  };

  // ─── Toggle campaign ───────────────────────────────────────────────

  const toggleCampaign = async (campaign: Campaign) => {
    setTogglingCampaign(campaign.id);
    try {
      const action = campaign.status === 'ACTIVE' ? 'ads_pause' : 'ads_resume';
      const res = await fetch('/api/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, campaignId: campaign.id }),
      });
      const data = await res.json();
      if (data.success !== false) {
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaign.id
              ? { ...c, status: c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' }
              : c
          )
        );
        showNotification(
          'success',
          `Campaign ${campaign.status === 'ACTIVE' ? 'paused' : 'resumed'}`
        );
      } else {
        showNotification('error', 'Failed to toggle campaign');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to toggle campaign');
    } finally {
      setTogglingCampaign(null);
    }
  };

  // ─── Quick post ─────────────────────────────────────────────────────

  const handleQuickPost = async () => {
    if (!quickPost.caption) {
      showNotification('error', 'Please enter a caption');
      return;
    }
    setPostingQuick(true);
    try {
      const action = quickPost.imageUrl ? 'fb_post_photo' : 'fb_post_text';
      const res = await fetch('/api/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          message: quickPost.caption,
          caption: quickPost.caption,
          imageUrl: quickPost.imageUrl || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Post published!');
        setQuickPost({ ...quickPost, caption: '', imageUrl: '' });
      } else {
        showNotification(
          'error',
          data.error || data.data?.error?.message || 'Failed to post'
        );
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to post');
    } finally {
      setPostingQuick(false);
    }
  };

  const handleGenerateQuick = async () => {
    setGeneratingQuick(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_content',
          contentType: 'social_post',
          platform: quickPost.platform,
          product: 'Wagyu Biltong',
        }),
      });
      const data = await res.json();
      if (data.content) {
        const lines = data.content.split('\n').filter((l: string) => l.trim());
        setQuickPost((prev) => ({
          ...prev,
          caption: lines.slice(0, 3).join('\n').trim() || data.content.slice(0, 280),
        }));
        showNotification('success', 'Caption generated!');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to generate');
    } finally {
      setGeneratingQuick(false);
    }
  };

  // ─── Use template ───────────────────────────────────────────────────

  const applyTemplate = (template: (typeof AD_TEMPLATES)[number]) => {
    setFormData((prev) => ({
      ...prev,
      headline: template.headline,
      primaryText: template.primaryText,
      cta: template.cta,
      imageUrl: template.imageUrl || prev.imageUrl,
    }));
    setActiveTab('create');
    showNotification('success', `Template "${template.name}" loaded`);
  };

  // ─── Audience toggle ───────────────────────────────────────────────

  const toggleAudience = (city: string) => {
    setFormData((prev) => ({
      ...prev,
      audiences: prev.audiences.includes(city)
        ? prev.audiences.filter((a) => a !== city)
        : [...prev.audiences, city],
    }));
  };

  // ─── Campaign metrics ──────────────────────────────────────────────

  const totalSpend = campaigns.reduce(
    (sum, c) => sum + parseFloat(c.spend || '0'),
    0
  );
  const totalReach = campaigns.reduce(
    (sum, c) => sum + parseFloat(c.reach || '0'),
    0
  );
  const avgCPC =
    campaigns.length > 0
      ? campaigns.reduce((sum, c) => sum + parseFloat(c.cpc || '0'), 0) /
        campaigns.length
      : 0;
  const avgCTR =
    campaigns.length > 0
      ? campaigns.reduce((sum, c) => sum + parseFloat(c.ctr || '0'), 0) /
        campaigns.length
      : 0;

  // ─── CTA label helper ──────────────────────────────────────────────

  const ctaLabel = (value: string) =>
    CTA_OPTIONS.find((o) => o.value === value)?.label || value;

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Notification toast */}
      {notification && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300"
          style={{
            backgroundColor: notification.type === 'success' ? '#2E7D32' : '#C62828',
            color: '#fff',
          }}
        >
          {notification.type === 'success' ? (
            <Check size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header
        className="border-b px-6 py-6"
        style={{ borderColor: '#E8DDD0' }}
      >
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-3xl font-bold tracking-wider"
            style={{ color: '#1A1A1A', letterSpacing: '0.12em' }}
          >
            AD MANAGER
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#8B7355' }}>
            Facebook &amp; Instagram Ads
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav
        className="border-b px-6"
        style={{ borderColor: '#E8DDD0' }}
      >
        <div className="max-w-7xl mx-auto flex gap-0">
          {(
            [
              { key: 'create', label: 'Create Ad', icon: Plus },
              { key: 'campaigns', label: 'Active Campaigns', icon: TrendingUp },
              { key: 'quickpost', label: 'Quick Post', icon: Send },
              { key: 'templates', label: 'Templates', icon: Copy },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors"
              style={{
                borderColor: activeTab === key ? '#D4A017' : 'transparent',
                color: activeTab === key ? '#D4A017' : '#8B7355',
              }}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ═══ TAB 1: Create Ad ═══ */}
        {activeTab === 'create' && (
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Platform Selector */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: '#8B7355' }}
                >
                  Platform
                </label>
                <div className="flex gap-2">
                  {(
                    [
                      { value: 'facebook', label: 'Facebook', icon: Globe },
                      { value: 'instagram', label: 'Instagram', icon: Camera },
                      { value: 'both', label: 'Both', icon: Layers },
                    ] as const
                  ).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setPlatform(value)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor:
                          platform === value ? '#D4A017' : '#fff',
                        color: platform === value ? '#fff' : '#6B5B45',
                        border: `1px solid ${platform === value ? '#D4A017' : '#E8DDD0'}`,
                      }}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ad Type Selector */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: '#8B7355' }}
                >
                  Ad Type
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(
                    [
                      { value: 'image', label: 'Image Post', icon: Image },
                      { value: 'carousel', label: 'Carousel', icon: Layers },
                      { value: 'reel', label: 'Reel', icon: Film },
                      { value: 'story', label: 'Story', icon: Smartphone },
                    ] as const
                  ).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setAdType(value)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor:
                          adType === value ? '#D4A017' : '#fff',
                        color: adType === value ? '#fff' : '#6B5B45',
                        border: `1px solid ${adType === value ? '#D4A017' : '#E8DDD0'}`,
                      }}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Headline */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: '#8B7355' }}
                >
                  Headline
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) =>
                    setFormData({ ...formData, headline: e.target.value })
                  }
                  placeholder="e.g. Premium Wagyu Biltong — R500/kg"
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #E8DDD0',
                    color: '#1A1A1A',
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = '#D4A017')
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = '#E8DDD0')
                  }
                />
              </div>

              {/* Primary Text */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: '#8B7355' }}
                >
                  Primary Text
                </label>
                <textarea
                  value={formData.primaryText}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryText: e.target.value })
                  }
                  placeholder="Write your ad copy here..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none transition-all"
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #E8DDD0',
                    color: '#1A1A1A',
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = '#D4A017')
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = '#E8DDD0')
                  }
                />
              </div>

              {/* CTA + Link */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: '#8B7355' }}
                  >
                    Call to Action
                  </label>
                  <select
                    value={formData.cta}
                    onChange={(e) =>
                      setFormData({ ...formData, cta: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all appearance-none"
                    style={{
                      backgroundColor: '#fff',
                      border: '1px solid #E8DDD0',
                      color: '#1A1A1A',
                    }}
                  >
                    {CTA_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: '#8B7355' }}
                  >
                    Link URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, linkUrl: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                    style={{
                      backgroundColor: '#fff',
                      border: '1px solid #E8DDD0',
                      color: '#1A1A1A',
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = '#D4A017')
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = '#E8DDD0')
                    }
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: '#8B7355' }}
                >
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/ad-image.jpg"
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #E8DDD0',
                    color: '#1A1A1A',
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = '#D4A017')
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = '#E8DDD0')
                  }
                />
              </div>

              {/* Budget + Duration */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: '#8B7355' }}
                  >
                    Budget (R per day)
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium"
                      style={{ color: '#8B7355' }}
                    >
                      R
                    </span>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) =>
                        setFormData({ ...formData, budget: e.target.value })
                      }
                      className="w-full pl-8 pr-4 py-3 rounded-lg text-sm outline-none transition-all"
                      style={{
                        backgroundColor: '#fff',
                        border: '1px solid #E8DDD0',
                        color: '#1A1A1A',
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = '#D4A017')
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = '#E8DDD0')
                      }
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: '#8B7355' }}
                  >
                    Duration (days)
                  </label>
                  <div className="relative">
                    <Calendar
                      size={14}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{ color: '#8B7355' }}
                    />
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-all"
                      style={{
                        backgroundColor: '#fff',
                        border: '1px solid #E8DDD0',
                        color: '#1A1A1A',
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = '#D4A017')
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = '#E8DDD0')
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: '#8B7355' }}
                >
                  Target Audience
                </label>
                <div className="flex flex-wrap gap-2">
                  {AUDIENCE_OPTIONS.map((city) => (
                    <button
                      key={city}
                      onClick={() => toggleAudience(city)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                      style={{
                        backgroundColor: formData.audiences.includes(city)
                          ? '#D4A017'
                          : '#fff',
                        color: formData.audiences.includes(city)
                          ? '#fff'
                          : '#6B5B45',
                        border: `1px solid ${formData.audiences.includes(city) ? '#D4A017' : '#E8DDD0'}`,
                      }}
                    >
                      {formData.audiences.includes(city) && (
                        <Check size={12} />
                      )}
                      <Target size={12} />
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total cost preview */}
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: '#FBF5EB',
                  border: '1px solid #E8DDD0',
                }}
              >
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#8B7355' }}>Estimated total cost:</span>
                  <span
                    className="font-bold text-lg"
                    style={{ color: '#D4A017' }}
                  >
                    R
                    {(
                      parseFloat(formData.budget || '0') *
                      parseFloat(formData.duration || '0')
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleGenerateCopy}
                  disabled={generatingCopy}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #D4A017',
                    color: '#D4A017',
                  }}
                >
                  {generatingCopy ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Brain size={16} />
                  )}
                  AI Generate Copy
                </button>

                <button
                  onClick={handlePostAd}
                  disabled={postingAd || !formData.headline}
                  className="flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: '#D4A017',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(212, 160, 23, 0.3)',
                  }}
                >
                  {postingAd ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  Post Ad
                </button>
              </div>
            </div>

            {/* Preview (2 cols) */}
            <div className="lg:col-span-2">
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: '#8B7355' }}
              >
                Preview
              </label>
              <div
                className="rounded-xl overflow-hidden shadow-lg"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #E8DDD0',
                }}
              >
                {/* Post header */}
                <div className="flex items-center gap-3 p-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#D4A017' }}
                  >
                    <span className="text-white text-xs font-bold">SM</span>
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: '#1A1A1A' }}
                    >
                      StudEx Meat
                    </p>
                    <p className="text-xs" style={{ color: '#999' }}>
                      Sponsored
                      {platform === 'facebook' && ' · Facebook'}
                      {platform === 'instagram' && ' · Instagram'}
                      {platform === 'both' && ' · Facebook & Instagram'}
                    </p>
                  </div>
                </div>

                {/* Post text */}
                <div className="px-4 pb-3">
                  {formData.headline && (
                    <p
                      className="text-sm font-bold mb-1"
                      style={{ color: '#1A1A1A' }}
                    >
                      {formData.headline}
                    </p>
                  )}
                  <p
                    className="text-sm whitespace-pre-wrap"
                    style={{ color: '#4A4A4A' }}
                  >
                    {formData.primaryText || 'Your ad copy will appear here...'}
                  </p>
                </div>

                {/* Image area */}
                <div
                  className="w-full aspect-square flex items-center justify-center"
                  style={{ backgroundColor: '#F5EDE0' }}
                >
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="Ad preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-center p-8">
                      <Image
                        size={48}
                        style={{ color: '#D4A017', opacity: 0.4 }}
                        className="mx-auto mb-2"
                      />
                      <p
                        className="text-xs"
                        style={{ color: '#8B7355', opacity: 0.6 }}
                      >
                        Ad image preview
                      </p>
                    </div>
                  )}
                </div>

                {/* CTA bar */}
                <div
                  className="flex items-center justify-between p-4"
                  style={{
                    backgroundColor: '#FBF5EB',
                    borderTop: '1px solid #E8DDD0',
                  }}
                >
                  <div>
                    <p className="text-xs" style={{ color: '#999' }}>
                      studexmeat.com
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: '#1A1A1A' }}
                    >
                      {formData.headline || 'Your headline'}
                    </p>
                  </div>
                  <button
                    className="px-4 py-2 rounded-md text-xs font-bold"
                    style={{
                      backgroundColor: '#D4A017',
                      color: '#fff',
                    }}
                  >
                    {ctaLabel(formData.cta)}
                  </button>
                </div>

                {/* Post footer */}
                <div
                  className="flex items-center justify-around py-3 text-xs"
                  style={{
                    borderTop: '1px solid #E8DDD0',
                    color: '#8B7355',
                  }}
                >
                  <span className="flex items-center gap-1">
                    <Eye size={14} /> Like
                  </span>
                  <span className="flex items-center gap-1">
                    <Send size={14} /> Comment
                  </span>
                  <span className="flex items-center gap-1">
                    <ChevronRight size={14} /> Share
                  </span>
                </div>
              </div>

              {/* Ad type + budget summary */}
              <div
                className="mt-4 p-4 rounded-lg space-y-2"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #E8DDD0',
                }}
              >
                <p className="text-xs" style={{ color: '#8B7355' }}>
                  <span className="font-semibold">Type:</span>{' '}
                  {adType === 'image'
                    ? 'Image Post'
                    : adType === 'carousel'
                      ? 'Carousel'
                      : adType === 'reel'
                        ? 'Reel'
                        : 'Story'}
                </p>
                <p className="text-xs" style={{ color: '#8B7355' }}>
                  <span className="font-semibold">Budget:</span> R
                  {formData.budget}/day for {formData.duration} days
                </p>
                <p className="text-xs" style={{ color: '#8B7355' }}>
                  <span className="font-semibold">Audience:</span>{' '}
                  {formData.audiences.length > 0
                    ? formData.audiences.join(', ')
                    : 'Not selected'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 2: Active Campaigns ═══ */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            {/* Overall metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total Spend',
                  value: `R${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  icon: DollarSign,
                  color: '#D4A017',
                },
                {
                  label: 'Total Reach',
                  value: totalReach.toLocaleString(),
                  icon: Users,
                  color: '#2E7D32',
                },
                {
                  label: 'Avg CPC',
                  value: `R${avgCPC.toFixed(2)}`,
                  icon: MousePointer,
                  color: '#1565C0',
                },
                {
                  label: 'Avg CTR',
                  value: `${avgCTR.toFixed(2)}%`,
                  icon: TrendingUp,
                  color: '#B71C1C',
                },
              ].map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #E8DDD0',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} style={{ color }} />
                    <span
                      className="text-xs font-medium uppercase tracking-wider"
                      style={{ color: '#8B7355' }}
                    >
                      {label}
                    </span>
                  </div>
                  <p
                    className="text-xl font-bold"
                    style={{ color: '#1A1A1A' }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Campaign list */}
            {loadingCampaigns ? (
              <div className="flex items-center justify-center py-20">
                <Loader2
                  size={32}
                  className="animate-spin"
                  style={{ color: '#D4A017' }}
                />
                <span className="ml-3 text-sm" style={{ color: '#8B7355' }}>
                  Loading campaigns...
                </span>
              </div>
            ) : campaigns.length === 0 ? (
              <div
                className="text-center py-20 rounded-xl"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #E8DDD0',
                }}
              >
                <TrendingUp
                  size={48}
                  className="mx-auto mb-4"
                  style={{ color: '#D4A017', opacity: 0.4 }}
                />
                <p
                  className="text-lg font-semibold mb-2"
                  style={{ color: '#1A1A1A' }}
                >
                  No campaigns found
                </p>
                <p className="text-sm" style={{ color: '#8B7355' }}>
                  Create your first ad to start a campaign, or connect your Meta
                  Ad Account.
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: '#D4A017', color: '#fff' }}
                >
                  <Plus size={16} />
                  Create Ad
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="p-5 rounded-xl transition-all"
                    style={{
                      backgroundColor: '#fff',
                      border: '1px solid #E8DDD0',
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className="text-sm font-bold"
                            style={{ color: '#1A1A1A' }}
                          >
                            {campaign.name}
                          </h3>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor:
                                campaign.status === 'ACTIVE'
                                  ? '#E8F5E9'
                                  : '#FFF3E0',
                              color:
                                campaign.status === 'ACTIVE'
                                  ? '#2E7D32'
                                  : '#E65100',
                            }}
                          >
                            {campaign.status === 'ACTIVE' ? 'Active' : 'Paused'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs">
                          <span style={{ color: '#8B7355' }}>
                            <span className="font-semibold">Objective:</span>{' '}
                            {campaign.objective}
                          </span>
                          <span style={{ color: '#8B7355' }}>
                            <span className="font-semibold">Budget:</span> R
                            {(
                              parseFloat(campaign.daily_budget || '0') / 100
                            ).toFixed(0)}
                            /day
                          </span>
                          {campaign.spend && (
                            <span style={{ color: '#8B7355' }}>
                              <span className="font-semibold">Spend:</span> R
                              {parseFloat(campaign.spend).toFixed(2)}
                            </span>
                          )}
                          {campaign.reach && (
                            <span style={{ color: '#8B7355' }}>
                              <span className="font-semibold">Reach:</span>{' '}
                              {parseInt(campaign.reach).toLocaleString()}
                            </span>
                          )}
                          {campaign.cpc && (
                            <span style={{ color: '#8B7355' }}>
                              <span className="font-semibold">CPC:</span> R
                              {parseFloat(campaign.cpc).toFixed(2)}
                            </span>
                          )}
                          {campaign.ctr && (
                            <span style={{ color: '#8B7355' }}>
                              <span className="font-semibold">CTR:</span>{' '}
                              {parseFloat(campaign.ctr).toFixed(2)}%
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleCampaign(campaign)}
                        disabled={togglingCampaign === campaign.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                        style={{
                          backgroundColor:
                            campaign.status === 'ACTIVE'
                              ? '#FFF3E0'
                              : '#E8F5E9',
                          color:
                            campaign.status === 'ACTIVE'
                              ? '#E65100'
                              : '#2E7D32',
                          border: `1px solid ${campaign.status === 'ACTIVE' ? '#FFE0B2' : '#C8E6C9'}`,
                        }}
                      >
                        {togglingCampaign === campaign.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : campaign.status === 'ACTIVE' ? (
                          <Pause size={14} />
                        ) : (
                          <Play size={14} />
                        )}
                        {campaign.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Refresh button */}
            <div className="text-center">
              <button
                onClick={loadCampaigns}
                disabled={loadingCampaigns}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #E8DDD0',
                  color: '#8B7355',
                }}
              >
                {loadingCampaigns ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Zap size={14} />
                )}
                Refresh Campaigns
              </button>
            </div>
          </div>
        )}

        {/* ═══ TAB 3: Quick Post ═══ */}
        {activeTab === 'quickpost' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Quick post form */}
            <div className="space-y-5">
              <h2
                className="text-lg font-bold"
                style={{ color: '#1A1A1A' }}
              >
                Quick Organic Post
              </h2>

              {/* Platform select */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: '#8B7355' }}
                >
                  Platform
                </label>
                <div className="flex gap-2">
                  {(
                    [
                      { value: 'facebook', label: 'Facebook', icon: Globe },
                      { value: 'instagram', label: 'Instagram', icon: Camera },
                    ] as const
                  ).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() =>
                        setQuickPost({ ...quickPost, platform: value })
                      }
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor:
                          quickPost.platform === value
                            ? '#D4A017'
                            : '#fff',
                        color:
                          quickPost.platform === value
                            ? '#fff'
                            : '#6B5B45',
                        border: `1px solid ${quickPost.platform === value ? '#D4A017' : '#E8DDD0'}`,
                      }}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: '#8B7355' }}
                >
                  Caption
                </label>
                <textarea
                  value={quickPost.caption}
                  onChange={(e) =>
                    setQuickPost({ ...quickPost, caption: e.target.value })
                  }
                  placeholder="Write your post caption..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none transition-all"
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #E8DDD0',
                    color: '#1A1A1A',
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = '#D4A017')
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = '#E8DDD0')
                  }
                />
              </div>

              {/* Image URL */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: '#8B7355' }}
                >
                  Image URL
                </label>
                <input
                  type="url"
                  value={quickPost.imageUrl}
                  onChange={(e) =>
                    setQuickPost({ ...quickPost, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #E8DDD0',
                    color: '#1A1A1A',
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = '#D4A017')
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = '#E8DDD0')
                  }
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleGenerateQuick}
                  disabled={generatingQuick}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #D4A017',
                    color: '#D4A017',
                  }}
                >
                  {generatingQuick ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Brain size={16} />
                  )}
                  AI Generate
                </button>

                <button
                  onClick={handleQuickPost}
                  disabled={postingQuick || !quickPost.caption}
                  className="flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: '#D4A017',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(212, 160, 23, 0.3)',
                  }}
                >
                  {postingQuick ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  Post Now
                </button>
              </div>
            </div>

            {/* Recent posts */}
            <div>
              <h2
                className="text-lg font-bold mb-4"
                style={{ color: '#1A1A1A' }}
              >
                Recent Posts
              </h2>
              <div className="space-y-3">
                {PLACEHOLDER_POSTS.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-xl transition-all"
                    style={{
                      backgroundColor: '#fff',
                      border: '1px solid #E8DDD0',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          backgroundColor:
                            post.platform === 'facebook'
                              ? '#E3F2FD'
                              : '#FCE4EC',
                        }}
                      >
                        {post.platform === 'facebook' ? (
                          <Globe
                            size={14}
                            style={{ color: '#1565C0' }}
                          />
                        ) : (
                          <Camera
                            size={14}
                            style={{ color: '#C2185B' }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm mb-2 leading-relaxed"
                          style={{ color: '#4A4A4A' }}
                        >
                          {post.caption}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <span style={{ color: '#999' }}>
                            {post.date}
                          </span>
                          <span style={{ color: '#8B7355' }}>
                            {post.likes} likes
                          </span>
                          <span style={{ color: '#8B7355' }}>
                            {post.comments} comments
                          </span>
                          <span style={{ color: '#8B7355' }}>
                            {post.shares} shares
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 4: Templates ═══ */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div>
              <h2
                className="text-lg font-bold"
                style={{ color: '#1A1A1A' }}
              >
                Ad Templates
              </h2>
              <p className="text-sm mt-1" style={{ color: '#8B7355' }}>
                Pre-built templates for StudEx Meat campaigns. Click to load into
                the ad creator.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {AD_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className="rounded-xl overflow-hidden transition-all hover:shadow-md"
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #E8DDD0',
                  }}
                >
                  {/* Template color bar */}
                  <div
                    className="h-2"
                    style={{ backgroundColor: template.color }}
                  />

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: template.color,
                          opacity: 0.15,
                        }}
                      />
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center -ml-8"
                        style={{ color: template.color }}
                      >
                        <Zap size={16} />
                      </div>
                      <span
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: template.color }}
                      >
                        {template.name}
                      </span>
                    </div>

                    <h3
                      className="text-base font-bold"
                      style={{ color: '#1A1A1A' }}
                    >
                      {template.headline}
                    </h3>

                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: '#6B5B45' }}
                    >
                      {template.primaryText}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: '#FBF5EB',
                          color: '#8B7355',
                        }}
                      >
                        CTA: {ctaLabel(template.cta)}
                      </span>

                      <button
                        onClick={() => applyTemplate(template)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                        style={{
                          backgroundColor: '#D4A017',
                          color: '#fff',
                        }}
                      >
                        Use This Template
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
