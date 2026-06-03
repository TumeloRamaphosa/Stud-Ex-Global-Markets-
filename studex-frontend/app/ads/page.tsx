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
  Target,
  Users,
  Plus,
  Check,
  AlertCircle,
  Search,
  RefreshCw,
  Star,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'campaigns' | 'create' | 'quickpost' | 'google';

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
  impressions?: string;
  clicks?: string;
  cpc?: string;
  ctr?: string;
}

interface Insights {
  impressions?: string;
  clicks?: string;
  spend?: string;
  cpc?: string;
  ctr?: string;
  reach?: string;
}

interface CreateFormData {
  campaignName: string;
  objective: string;
  dailyBudget: string;
  country: string;
  ageMin: string;
  ageMax: string;
  imageUrl: string;
  caption: string;
  link: string;
  cta: string;
}

interface CreationStep {
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  detail?: string;
}

interface QuickPostData {
  platform: 'facebook' | 'instagram';
  caption: string;
  imageUrl: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FATHERS_DAY_CAMPAIGN_ID = '120245475014320003';

const OBJECTIVE_OPTIONS = [
  { value: 'OUTCOME_TRAFFIC', label: 'Traffic' },
  { value: 'OUTCOME_ENGAGEMENT', label: 'Engagement' },
  { value: 'OUTCOME_SALES', label: 'Sales' },
  { value: 'OUTCOME_LEADS', label: 'Leads' },
  { value: 'OUTCOME_AWARENESS', label: 'Awareness' },
];

const CTA_OPTIONS = [
  { value: 'SHOP_NOW', label: 'Shop Now' },
  { value: 'LEARN_MORE', label: 'Learn More' },
  { value: 'ORDER_NOW', label: 'Order Now' },
  { value: 'CONTACT_US', label: 'Contact Us' },
  { value: 'SIGN_UP', label: 'Sign Up' },
];

const COUNTRY_OPTIONS = [
  { value: 'ZA', label: 'South Africa' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('campaigns');

  // --- Campaign data ---
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [insights, setInsights] = useState<Insights>({});
  const [activeCampaignCount, setActiveCampaignCount] = useState(0);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [togglingCampaign, setTogglingCampaign] = useState<string | null>(null);

  // --- Create form ---
  const [createForm, setCreateForm] = useState<CreateFormData>({
    campaignName: '',
    objective: 'OUTCOME_TRAFFIC',
    dailyBudget: '100',
    country: 'ZA',
    ageMin: '25',
    ageMax: '55',
    imageUrl: '',
    caption: '',
    link: 'https://studexmeat.com/store',
    cta: 'SHOP_NOW',
  });
  const [creationSteps, setCreationSteps] = useState<CreationStep[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // --- Quick post ---
  const [quickPost, setQuickPost] = useState<QuickPostData>({
    platform: 'facebook',
    caption: '',
    imageUrl: '',
  });
  const [postingQuick, setPostingQuick] = useState(false);
  const [generatingQuick, setGeneratingQuick] = useState(false);

  // --- Notification ---
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = useCallback(
    (type: 'success' | 'error', message: string) => {
      setNotification({ type, message });
      setTimeout(() => setNotification(null), 4000);
    },
    []
  );

  // ─── Load campaigns + insights via /api/meta-ads ────────────────────

  const loadCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    setLoadError(null);
    try {
      // Fetch analyze endpoint for combined data
      const analyzeRes = await fetch('/api/meta-ads?action=analyze');
      const analyzeData = await analyzeRes.json();

      if (analyzeData.error) {
        setLoadError(analyzeData.error);
        setCampaigns([]);
        setInsights({});
        setActiveCampaignCount(0);
        return;
      }

      const campaignList: Campaign[] = (analyzeData.campaigns || []).map(
        (c: any) => ({
          id: c.id,
          name: c.name || 'Untitled Campaign',
          status: c.status || 'PAUSED',
          objective: c.objective || 'UNKNOWN',
          daily_budget: c.daily_budget || '0',
          lifetime_budget: c.lifetime_budget || '0',
          start_time: c.start_time,
        })
      );

      // Extract insights
      const insArr = analyzeData.insights || [];
      if (insArr.length > 0) {
        const ins = insArr[0];
        setInsights({
          impressions: ins.impressions || '0',
          clicks: ins.clicks || '0',
          spend: ins.spend || '0',
          cpc: ins.cpc || '0',
          ctr: ins.ctr || '0',
          reach: ins.reach || '0',
        });
      }

      setActiveCampaignCount(analyzeData.activeCampaigns || 0);

      // Also fetch detailed insights per-campaign if available
      try {
        const insightsRes = await fetch(
          '/api/meta-ads?action=insights&period=last_30d'
        );
        const insightsData = await insightsRes.json();
        if (insightsData.data?.[0]) {
          const ins = insightsData.data[0];
          setInsights((prev) => ({
            ...prev,
            impressions: ins.impressions || prev.impressions,
            clicks: ins.clicks || prev.clicks,
            spend: ins.spend || prev.spend,
            cpc: ins.cpc || prev.cpc,
            ctr: ins.ctr || prev.ctr,
            reach: ins.reach || prev.reach,
          }));
          campaignList.forEach((c) => {
            c.spend = ins.spend || '0';
            c.reach = ins.reach || '0';
            c.impressions = ins.impressions || '0';
            c.clicks = ins.clicks || '0';
            c.cpc = ins.cpc || '0';
            c.ctr = ins.ctr || '0';
          });
        }
      } catch {
        // Insights may not be available
      }

      setCampaigns(campaignList);
    } catch (err: any) {
      console.error('Failed to load campaigns:', err);
      setLoadError(err.message || 'Failed to load campaigns');
      setCampaigns([]);
    } finally {
      setLoadingCampaigns(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  // ─── Toggle campaign pause/resume ───────────────────────────────────

  const toggleCampaign = async (campaign: Campaign) => {
    setTogglingCampaign(campaign.id);
    try {
      const action =
        campaign.status === 'ACTIVE' ? 'ads_pause' : 'ads_resume';
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
              ? {
                  ...c,
                  status: c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE',
                }
              : c
          )
        );
        showNotification(
          'success',
          `Campaign ${campaign.status === 'ACTIVE' ? 'paused' : 'resumed'}`
        );
      } else {
        showNotification(
          'error',
          data.error || 'Failed to toggle campaign'
        );
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to toggle campaign');
    } finally {
      setTogglingCampaign(null);
    }
  };

  // ─── Create campaign (full flow) ───────────────────────────────────

  const handleCreateCampaign = async () => {
    if (!createForm.campaignName) {
      showNotification('error', 'Please enter a campaign name');
      return;
    }
    if (!createForm.caption) {
      showNotification('error', 'Please enter a caption/message');
      return;
    }

    setIsCreating(true);
    const steps: CreationStep[] = [
      { label: 'Creating campaign', status: 'pending' },
      { label: 'Creating ad set', status: 'pending' },
      { label: 'Uploading ad image', status: 'pending' },
      { label: 'Creating ad creative', status: 'pending' },
      { label: 'Creating ad', status: 'pending' },
    ];
    setCreationSteps([...steps]);

    const updateStep = (
      index: number,
      status: CreationStep['status'],
      detail?: string
    ) => {
      steps[index] = { ...steps[index], status, detail };
      setCreationSteps([...steps]);
    };

    try {
      // Step 1: Create campaign
      updateStep(0, 'running');
      const campaignRes = await fetch('/api/meta-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_campaign',
          name: createForm.campaignName,
          objective: createForm.objective,
          special_ad_categories: [],
        }),
      });
      const campaignData = await campaignRes.json();
      if (!campaignData.success || campaignData.data?.error) {
        updateStep(
          0,
          'error',
          campaignData.data?.error?.message || 'Failed'
        );
        showNotification(
          'error',
          campaignData.data?.error?.message || 'Failed to create campaign'
        );
        setIsCreating(false);
        return;
      }
      const campaignId = campaignData.data?.id;
      updateStep(0, 'done', `ID: ${campaignId}`);

      // Step 2: Create ad set
      updateStep(1, 'running');
      const adsetRes = await fetch('/api/meta-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_adset',
          name: `${createForm.campaignName} - Ad Set`,
          campaign_id: campaignId,
          daily_budget: parseInt(createForm.dailyBudget) * 100, // cents
          targeting: {
            geo_locations: { countries: [createForm.country] },
            age_min: parseInt(createForm.ageMin),
            age_max: parseInt(createForm.ageMax),
          },
        }),
      });
      const adsetData = await adsetRes.json();
      if (!adsetData.success || adsetData.data?.error) {
        updateStep(
          1,
          'error',
          adsetData.data?.error?.message || 'Failed'
        );
        showNotification(
          'error',
          adsetData.data?.error?.message || 'Failed to create ad set'
        );
        setIsCreating(false);
        return;
      }
      const adsetId = adsetData.data?.id;
      updateStep(1, 'done', `ID: ${adsetId}`);

      // Step 3: Upload image (if provided)
      let imageHash: string | null = null;
      if (createForm.imageUrl) {
        updateStep(2, 'running');
        const imgRes = await fetch('/api/meta-ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'upload_ad_image',
            image_url: createForm.imageUrl,
          }),
        });
        const imgData = await imgRes.json();
        if (!imgData.success || imgData.data?.error) {
          updateStep(
            2,
            'error',
            imgData.data?.error?.message || 'Failed'
          );
          showNotification(
            'error',
            imgData.data?.error?.message || 'Failed to upload image'
          );
          setIsCreating(false);
          return;
        }
        // Image hash is returned in data.images.<filename>.hash
        const images = imgData.data?.images;
        if (images) {
          const firstKey = Object.keys(images)[0];
          imageHash = images[firstKey]?.hash || null;
        }
        updateStep(2, 'done', imageHash ? `Hash: ${imageHash}` : 'Uploaded');
      } else {
        updateStep(2, 'done', 'Skipped (no image)');
      }

      // Step 4: Create ad creative
      updateStep(3, 'running');
      const creativeRes = await fetch('/api/meta-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_ad_creative',
          name: `${createForm.campaignName} - Creative`,
          image_hash: imageHash,
          link: createForm.link,
          message: createForm.caption,
          cta: createForm.cta,
        }),
      });
      const creativeData = await creativeRes.json();
      if (!creativeData.success || creativeData.data?.error) {
        updateStep(
          3,
          'error',
          creativeData.data?.error?.message || 'Failed'
        );
        showNotification(
          'error',
          creativeData.data?.error?.message ||
            'Failed to create ad creative'
        );
        setIsCreating(false);
        return;
      }
      const creativeId = creativeData.data?.id;
      updateStep(3, 'done', `ID: ${creativeId}`);

      // Step 5: Create ad
      updateStep(4, 'running');
      const adRes = await fetch('/api/meta-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_ad',
          name: `${createForm.campaignName} - Ad`,
          adset_id: adsetId,
          creative_id: creativeId,
        }),
      });
      const adData = await adRes.json();
      if (!adData.success || adData.data?.error) {
        updateStep(
          4,
          'error',
          adData.data?.error?.message || 'Failed'
        );
        showNotification(
          'error',
          adData.data?.error?.message || 'Failed to create ad'
        );
        setIsCreating(false);
        return;
      }
      updateStep(4, 'done', `ID: ${adData.data?.id}`);

      showNotification(
        'success',
        'Campaign created successfully! It is PAUSED — activate when ready.'
      );
      // Refresh campaign list
      loadCampaigns();
    } catch (err: any) {
      showNotification('error', err.message || 'Creation failed');
    } finally {
      setIsCreating(false);
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
        const lines = data.content
          .split('\n')
          .filter((l: string) => l.trim());
        setQuickPost((prev) => ({
          ...prev,
          caption:
            lines.slice(0, 3).join('\n').trim() ||
            data.content.slice(0, 280),
        }));
        showNotification('success', 'Caption generated!');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to generate');
    } finally {
      setGeneratingQuick(false);
    }
  };

  // ─── Helpers ───────────────────────────────────────────────────────

  const fathersDayCampaign = campaigns.find(
    (c) => c.id === FATHERS_DAY_CAMPAIGN_ID
  );

  const totalSpend = parseFloat(insights.spend || '0');
  const totalReach = parseFloat(insights.reach || '0');
  const totalImpressions = parseFloat(insights.impressions || '0');
  const totalClicks = parseFloat(insights.clicks || '0');
  const avgCPC = parseFloat(insights.cpc || '0');
  const avgCTR = parseFloat(insights.ctr || '0');

  const formatBudget = (cents: string) => {
    const val = parseFloat(cents || '0') / 100;
    return `R${val.toFixed(0)}`;
  };

  const formatObjective = (obj: string) => {
    return obj
      .replace('OUTCOME_', '')
      .replace(/_/g, ' ')
      .split(' ')
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(' ');
  };

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Notification toast */}
      {notification && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300"
          style={{
            backgroundColor:
              notification.type === 'success' ? '#2E7D32' : '#C62828',
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
            Meta Ads &amp; Google Ads &mdash; Live Campaign Data
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b px-6" style={{ borderColor: '#E8DDD0' }}>
        <div className="max-w-7xl mx-auto flex gap-0">
          {(
            [
              {
                key: 'campaigns',
                label: 'Campaigns',
                icon: TrendingUp,
              },
              { key: 'create', label: 'Create Campaign', icon: Plus },
              { key: 'quickpost', label: 'Quick Post', icon: Send },
              { key: 'google', label: 'Google Ads', icon: Search },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors"
              style={{
                borderColor:
                  activeTab === key ? '#D4A017' : 'transparent',
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
        {/* ═══ TAB 1: Campaigns (Live Data) ═══ */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            {/* Overall metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                {
                  label: 'Active',
                  value: activeCampaignCount.toString(),
                  icon: Zap,
                  color: '#2E7D32',
                },
                {
                  label: 'Spend',
                  value: `R${totalSpend.toFixed(2)}`,
                  icon: DollarSign,
                  color: '#D4A017',
                },
                {
                  label: 'Reach',
                  value: totalReach.toLocaleString(),
                  icon: Users,
                  color: '#1565C0',
                },
                {
                  label: 'Impressions',
                  value: totalImpressions.toLocaleString(),
                  icon: Eye,
                  color: '#6A1B9A',
                },
                {
                  label: 'CPC',
                  value: `R${avgCPC.toFixed(2)}`,
                  icon: MousePointer,
                  color: '#E65100',
                },
                {
                  label: 'CTR',
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

            {/* Father's Day Tomahawk Campaign - Featured */}
            {fathersDayCampaign && (
              <div
                className="p-6 rounded-xl relative overflow-hidden"
                style={{
                  backgroundColor: '#fff',
                  border: '2px solid #D4A017',
                  boxShadow: '0 4px 20px rgba(212, 160, 23, 0.15)',
                }}
              >
                <div
                  className="absolute top-0 right-0 px-4 py-1 rounded-bl-lg text-xs font-bold"
                  style={{ backgroundColor: '#D4A017', color: '#fff' }}
                >
                  <Star size={12} className="inline mr-1" />
                  FEATURED CAMPAIGN
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
                  <div className="flex-1">
                    <h3
                      className="text-lg font-bold mb-1"
                      style={{ color: '#1A1A1A' }}
                    >
                      {fathersDayCampaign.name}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-xs mb-3">
                      <span
                        className="px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          backgroundColor:
                            fathersDayCampaign.status === 'ACTIVE'
                              ? '#E8F5E9'
                              : '#FFF3E0',
                          color:
                            fathersDayCampaign.status === 'ACTIVE'
                              ? '#2E7D32'
                              : '#E65100',
                        }}
                      >
                        {fathersDayCampaign.status === 'ACTIVE'
                          ? 'Active'
                          : 'Paused'}
                      </span>
                      {fathersDayCampaign.status === 'PAUSED' && (
                        <span
                          className="px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            backgroundColor: '#E3F2FD',
                            color: '#1565C0',
                          }}
                        >
                          Ready to activate
                        </span>
                      )}
                    </div>
                    <div
                      className="flex flex-wrap gap-4 text-xs"
                      style={{ color: '#8B7355' }}
                    >
                      <span>
                        <span className="font-semibold">Budget:</span>{' '}
                        R100/day
                      </span>
                      <span>
                        <span className="font-semibold">Target:</span>{' '}
                        South Africa, Ages 25-55
                      </span>
                      <span>
                        <span className="font-semibold">Objective:</span>{' '}
                        {formatObjective(fathersDayCampaign.objective)}
                      </span>
                      <span>
                        <span className="font-semibold">ID:</span>{' '}
                        {fathersDayCampaign.id}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleCampaign(fathersDayCampaign)}
                    disabled={
                      togglingCampaign === fathersDayCampaign.id
                    }
                    className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                    style={{
                      backgroundColor:
                        fathersDayCampaign.status === 'ACTIVE'
                          ? '#FFF3E0'
                          : '#D4A017',
                      color:
                        fathersDayCampaign.status === 'ACTIVE'
                          ? '#E65100'
                          : '#fff',
                      border: `1px solid ${fathersDayCampaign.status === 'ACTIVE' ? '#FFE0B2' : '#D4A017'}`,
                    }}
                  >
                    {togglingCampaign === fathersDayCampaign.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : fathersDayCampaign.status === 'ACTIVE' ? (
                      <Pause size={16} />
                    ) : (
                      <Play size={16} />
                    )}
                    {fathersDayCampaign.status === 'ACTIVE'
                      ? 'Pause Campaign'
                      : 'Activate Campaign'}
                  </button>
                </div>
              </div>
            )}

            {/* Campaign list */}
            {loadingCampaigns ? (
              <div className="flex items-center justify-center py-20">
                <Loader2
                  size={32}
                  className="animate-spin"
                  style={{ color: '#D4A017' }}
                />
                <span
                  className="ml-3 text-sm"
                  style={{ color: '#8B7355' }}
                >
                  Loading campaigns from Meta Ads...
                </span>
              </div>
            ) : loadError ? (
              <div
                className="text-center py-12 rounded-xl"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #E8DDD0',
                }}
              >
                <AlertCircle
                  size={48}
                  className="mx-auto mb-4"
                  style={{ color: '#C62828', opacity: 0.6 }}
                />
                <p
                  className="text-lg font-semibold mb-2"
                  style={{ color: '#1A1A1A' }}
                >
                  Could not load campaigns
                </p>
                <p
                  className="text-sm mb-4 max-w-md mx-auto"
                  style={{ color: '#8B7355' }}
                >
                  {loadError}
                </p>
                <button
                  onClick={loadCampaigns}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: '#D4A017', color: '#fff' }}
                >
                  <RefreshCw size={16} />
                  Retry
                </button>
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
                  Create your first campaign to get started.
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: '#D4A017', color: '#fff' }}
                >
                  <Plus size={16} />
                  Create Campaign
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h2
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{ color: '#8B7355' }}
                  >
                    All Campaigns ({campaigns.length})
                  </h2>
                  <button
                    onClick={loadCampaigns}
                    disabled={loadingCampaigns}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: '#fff',
                      border: '1px solid #E8DDD0',
                      color: '#8B7355',
                    }}
                  >
                    <RefreshCw size={12} />
                    Refresh
                  </button>
                </div>

                {campaigns
                  .filter((c) => c.id !== FATHERS_DAY_CAMPAIGN_ID)
                  .map((campaign) => (
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
                              {campaign.status === 'ACTIVE'
                                ? 'Active'
                                : 'Paused'}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-4 text-xs">
                            <span style={{ color: '#8B7355' }}>
                              <span className="font-semibold">
                                Objective:
                              </span>{' '}
                              {formatObjective(campaign.objective)}
                            </span>
                            <span style={{ color: '#8B7355' }}>
                              <span className="font-semibold">
                                Budget:
                              </span>{' '}
                              {formatBudget(campaign.daily_budget)}/day
                            </span>
                            {campaign.start_time && (
                              <span style={{ color: '#8B7355' }}>
                                <span className="font-semibold">
                                  Started:
                                </span>{' '}
                                {new Date(
                                  campaign.start_time
                                ).toLocaleDateString()}
                              </span>
                            )}
                            {campaign.spend && (
                              <span style={{ color: '#8B7355' }}>
                                <span className="font-semibold">
                                  Spend:
                                </span>{' '}
                                R
                                {parseFloat(campaign.spend).toFixed(2)}
                              </span>
                            )}
                            {campaign.cpc && (
                              <span style={{ color: '#8B7355' }}>
                                <span className="font-semibold">
                                  CPC:
                                </span>{' '}
                                R
                                {parseFloat(campaign.cpc).toFixed(2)}
                              </span>
                            )}
                            {campaign.ctr && (
                              <span style={{ color: '#8B7355' }}>
                                <span className="font-semibold">
                                  CTR:
                                </span>{' '}
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
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : campaign.status === 'ACTIVE' ? (
                            <Pause size={14} />
                          ) : (
                            <Play size={14} />
                          )}
                          {campaign.status === 'ACTIVE'
                            ? 'Pause'
                            : 'Resume'}
                        </button>
                      </div>
                    </div>
                  ))}

                {/* If Father's Day campaign was filtered out, still show the featured one inline at top */}
                {fathersDayCampaign &&
                  campaigns.filter(
                    (c) => c.id !== FATHERS_DAY_CAMPAIGN_ID
                  ).length === 0 && (
                    <p
                      className="text-sm text-center py-6"
                      style={{ color: '#8B7355' }}
                    >
                      Only the featured campaign above is running.
                    </p>
                  )}
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB 2: Create Campaign ═══ */}
        {activeTab === 'create' && (
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <h2
                  className="text-lg font-bold mb-1"
                  style={{ color: '#1A1A1A' }}
                >
                  Create Meta Ads Campaign
                </h2>
                <p className="text-sm" style={{ color: '#8B7355' }}>
                  This will create a full campaign with ad set, creative,
                  and ad via the Meta Ads API.
                </p>
              </div>

              {/* Campaign Name */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: '#8B7355' }}
                >
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={createForm.campaignName}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      campaignName: e.target.value,
                    })
                  }
                  placeholder="e.g. Father's Day Tomahawk Special"
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

              {/* Objective + Budget */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: '#8B7355' }}
                  >
                    Objective
                  </label>
                  <select
                    value={createForm.objective}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        objective: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all appearance-none"
                    style={{
                      backgroundColor: '#fff',
                      border: '1px solid #E8DDD0',
                      color: '#1A1A1A',
                    }}
                  >
                    {OBJECTIVE_OPTIONS.map((opt) => (
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
                    Daily Budget (ZAR)
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
                      value={createForm.dailyBudget}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          dailyBudget: e.target.value,
                        })
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
              </div>

              {/* Targeting */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: '#8B7355' }}
                  >
                    Country
                  </label>
                  <select
                    value={createForm.country}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        country: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all appearance-none"
                    style={{
                      backgroundColor: '#fff',
                      border: '1px solid #E8DDD0',
                      color: '#1A1A1A',
                    }}
                  >
                    {COUNTRY_OPTIONS.map((opt) => (
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
                    Min Age
                  </label>
                  <input
                    type="number"
                    value={createForm.ageMin}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        ageMin: e.target.value,
                      })
                    }
                    min="18"
                    max="65"
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

                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: '#8B7355' }}
                  >
                    Max Age
                  </label>
                  <input
                    type="number"
                    value={createForm.ageMax}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        ageMax: e.target.value,
                      })
                    }
                    min="18"
                    max="65"
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
                  value={createForm.imageUrl}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      imageUrl: e.target.value,
                    })
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

              {/* Caption */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: '#8B7355' }}
                >
                  Caption / Message
                </label>
                <textarea
                  value={createForm.caption}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      caption: e.target.value,
                    })
                  }
                  placeholder="Write your ad copy / message here..."
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
                    value={createForm.cta}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        cta: e.target.value,
                      })
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
                    value={createForm.link}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        link: e.target.value,
                      })
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

              {/* Create button */}
              <button
                onClick={handleCreateCampaign}
                disabled={isCreating || !createForm.campaignName}
                className="flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-50 w-full justify-center"
                style={{
                  backgroundColor: '#D4A017',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(212, 160, 23, 0.3)',
                }}
              >
                {isCreating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                Create Campaign
              </button>
            </div>

            {/* Progress & Preview (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Creation progress */}
              {creationSteps.length > 0 && (
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: '#8B7355' }}
                  >
                    Creation Progress
                  </label>
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{
                      backgroundColor: '#fff',
                      border: '1px solid #E8DDD0',
                    }}
                  >
                    {creationSteps.map((step, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 px-5 py-3"
                        style={{
                          borderBottom:
                            i < creationSteps.length - 1
                              ? '1px solid #F0E8DA'
                              : 'none',
                          backgroundColor:
                            step.status === 'running'
                              ? '#FFFDF5'
                              : step.status === 'error'
                                ? '#FFF5F5'
                                : 'transparent',
                        }}
                      >
                        <div className="mt-0.5">
                          {step.status === 'pending' && (
                            <div
                              className="w-5 h-5 rounded-full border-2"
                              style={{ borderColor: '#E8DDD0' }}
                            />
                          )}
                          {step.status === 'running' && (
                            <Loader2
                              size={20}
                              className="animate-spin"
                              style={{ color: '#D4A017' }}
                            />
                          )}
                          {step.status === 'done' && (
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor: '#2E7D32',
                              }}
                            >
                              <Check
                                size={12}
                                style={{ color: '#fff' }}
                              />
                            </div>
                          )}
                          {step.status === 'error' && (
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor: '#C62828',
                              }}
                            >
                              <AlertCircle
                                size={12}
                                style={{ color: '#fff' }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium"
                            style={{
                              color:
                                step.status === 'pending'
                                  ? '#999'
                                  : '#1A1A1A',
                            }}
                          >
                            {step.label}
                          </p>
                          {step.detail && (
                            <p
                              className="text-xs mt-0.5 truncate"
                              style={{
                                color:
                                  step.status === 'error'
                                    ? '#C62828'
                                    : '#8B7355',
                              }}
                            >
                              {step.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview card */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: '#8B7355' }}
                >
                  Ad Preview
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
                      <span className="text-white text-xs font-bold">
                        SM
                      </span>
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
                      </p>
                    </div>
                  </div>

                  {/* Post text */}
                  <div className="px-4 pb-3">
                    <p
                      className="text-sm whitespace-pre-wrap"
                      style={{ color: '#4A4A4A' }}
                    >
                      {createForm.caption ||
                        'Your ad copy will appear here...'}
                    </p>
                  </div>

                  {/* Image area */}
                  <div
                    className="w-full aspect-video flex items-center justify-center"
                    style={{ backgroundColor: '#F5EDE0' }}
                  >
                    {createForm.imageUrl ? (
                      <img
                        src={createForm.imageUrl}
                        alt="Ad preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display =
                            'none';
                        }}
                      />
                    ) : (
                      <div className="text-center p-8">
                        <Image
                          size={48}
                          style={{
                            color: '#D4A017',
                            opacity: 0.4,
                          }}
                          className="mx-auto mb-2"
                        />
                        <p
                          className="text-xs"
                          style={{
                            color: '#8B7355',
                            opacity: 0.6,
                          }}
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
                        {createForm.campaignName || 'Campaign name'}
                      </p>
                    </div>
                    <span
                      className="px-4 py-2 rounded-md text-xs font-bold"
                      style={{
                        backgroundColor: '#D4A017',
                        color: '#fff',
                      }}
                    >
                      {CTA_OPTIONS.find(
                        (o) => o.value === createForm.cta
                      )?.label || 'Shop Now'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Settings summary */}
              <div
                className="p-4 rounded-lg space-y-2"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #E8DDD0',
                }}
              >
                <p className="text-xs" style={{ color: '#8B7355' }}>
                  <span className="font-semibold">Objective:</span>{' '}
                  {OBJECTIVE_OPTIONS.find(
                    (o) => o.value === createForm.objective
                  )?.label || createForm.objective}
                </p>
                <p className="text-xs" style={{ color: '#8B7355' }}>
                  <span className="font-semibold">Budget:</span> R
                  {createForm.dailyBudget}/day
                </p>
                <p className="text-xs" style={{ color: '#8B7355' }}>
                  <span className="font-semibold">Target:</span>{' '}
                  {COUNTRY_OPTIONS.find(
                    (o) => o.value === createForm.country
                  )?.label || createForm.country}
                  , Ages {createForm.ageMin}-{createForm.ageMax}
                </p>
                <p className="text-xs" style={{ color: '#8B7355' }}>
                  <span className="font-semibold">Status:</span> Will be
                  created as PAUSED
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 3: Quick Post ═══ */}
        {activeTab === 'quickpost' && (
          <div className="max-w-2xl mx-auto space-y-5">
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
                    {
                      value: 'facebook',
                      label: 'Facebook',
                      icon: Globe,
                    },
                    {
                      value: 'instagram',
                      label: 'Instagram',
                      icon: Camera,
                    },
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
                  setQuickPost({
                    ...quickPost,
                    caption: e.target.value,
                  })
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
                Image URL (optional)
              </label>
              <input
                type="url"
                value={quickPost.imageUrl}
                onChange={(e) =>
                  setQuickPost({
                    ...quickPost,
                    imageUrl: e.target.value,
                  })
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
        )}

        {/* ═══ TAB 4: Google Ads ═══ */}
        {activeTab === 'google' && (
          <div className="space-y-6">
            {/* Google Ads header */}
            <div
              className="p-6 rounded-xl"
              style={{
                backgroundColor: '#fff',
                border: '1px solid #E8DDD0',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#FBF5EB' }}
                >
                  <Search size={20} style={{ color: '#D4A017' }} />
                </div>
                <div>
                  <h2
                    className="text-lg font-bold"
                    style={{ color: '#1A1A1A' }}
                  >
                    Google Ads
                  </h2>
                  <p className="text-xs" style={{ color: '#8B7355' }}>
                    Customer ID: 2234319068
                  </p>
                </div>
              </div>

              <div
                className="p-4 rounded-lg text-center"
                style={{
                  backgroundColor: '#FBF5EB',
                  border: '1px dashed #E8DDD0',
                }}
              >
                <Search
                  size={40}
                  className="mx-auto mb-3"
                  style={{ color: '#D4A017', opacity: 0.3 }}
                />
                <p
                  className="text-base font-semibold mb-1"
                  style={{ color: '#1A1A1A' }}
                >
                  No Google Ads campaigns running
                </p>
                <p
                  className="text-sm mb-4"
                  style={{ color: '#8B7355' }}
                >
                  Connect your Google Ads account to manage search and
                  display campaigns.
                </p>
              </div>
            </div>

            {/* Recommended keyword */}
            <div
              className="p-6 rounded-xl"
              style={{
                backgroundColor: '#fff',
                border: '1px solid #E8DDD0',
              }}
            >
              <h3
                className="text-sm font-bold uppercase tracking-wider mb-4"
                style={{ color: '#8B7355' }}
              >
                Recommended Keywords
              </h3>

              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{
                  backgroundColor: '#FBF5EB',
                  border: '1px solid #E8DDD0',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#E8F5E9' }}
                  >
                    <Target size={14} style={{ color: '#2E7D32' }} />
                  </div>
                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: '#1A1A1A' }}
                    >
                      &quot;wagyu beef south africa&quot;
                    </p>
                    <p className="text-xs" style={{ color: '#8B7355' }}>
                      ~390 searches/month &middot; Medium competition
                    </p>
                  </div>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: '#E8F5E9',
                    color: '#2E7D32',
                  }}
                >
                  Recommended
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  'wagyu steak delivery',
                  'biltong online',
                  'premium meat box',
                  'ankole beef',
                  'boerewors delivery',
                ].map((kw) => (
                  <span
                    key={kw}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{
                      backgroundColor: '#FBF5EB',
                      color: '#8B7355',
                      border: '1px solid #E8DDD0',
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
