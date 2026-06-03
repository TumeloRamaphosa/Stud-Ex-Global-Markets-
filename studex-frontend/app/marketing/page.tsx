'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Textarea from '@/components/ui/Textarea';
import Input from '@/components/ui/Input';
import StatusIndicator from '@/components/ui/StatusIndicator';
import {
  Send,
  Image as ImageIcon,
  Video,
  Sparkles,
  Instagram,
  Facebook,
  Zap,
  CheckCircle,
  XCircle,
  ArrowRight,
  ExternalLink,
  Heart,
  MessageCircle,
  RefreshCw,
  Type,
  Wand2,
  Play,
  Layers,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

type Platform = 'instagram' | 'facebook';
type PostType = 'image' | 'reel' | 'text';

interface TopPost {
  caption: string;
  likes: number;
  comments: number;
  type: string;
  permalink: string;
}

interface FbPost {
  id: string;
  message?: string;
  created_time?: string;
  likes?: { summary?: { total_count?: number } };
  comments?: { summary?: { total_count?: number } };
}

interface PipelineOutput {
  caption: string;
  imagePrompt: string;
  videoScript: string;
  raw?: any;
}

interface PostResult {
  success: boolean;
  message: string;
}

interface McpTool {
  name: string;
  label: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
}

// ─── Content Hub Page ───────────────────────────────────────────────────────

export default function ContentHubPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Section 1: Quick Post state
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [postType, setPostType] = useState<PostType>('image');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [captionTopic, setCaptionTopic] = useState('');
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState<PostResult | null>(null);

  // Section 2: Pipeline state
  const [pipelineIdea, setPipelineIdea] = useState('');
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineOutput, setPipelineOutput] = useState<PipelineOutput | null>(null);
  const [pipelinePostingTo, setPipelinePostingTo] = useState<string | null>(null);
  const [pipelinePostResult, setPipelinePostResult] = useState<PostResult | null>(null);

  // Section 3: Recent Posts state
  const [igTopPosts, setIgTopPosts] = useState<TopPost[]>([]);
  const [fbPosts, setFbPosts] = useState<FbPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Section 4: MCP Tools state
  const [mcpTools, setMcpTools] = useState<McpTool[]>([
    { name: 'higgsfield', label: 'Higgsfield', description: 'AI video generation from scripts', status: 'pending' },
    { name: 'zernio', label: 'Zernio', description: 'Auto-caption and post to social', status: 'pending' },
    { name: 'pixa', label: 'Pixa', description: 'AI image generation from prompts', status: 'pending' },
    { name: 'composio', label: 'Composio', description: 'Instagram / Facebook connector', status: 'pending' },
  ]);

  // Active tab for main content
  const [activeTab, setActiveTab] = useState('quick-post');

  // ─── Data Fetching ──────────────────────────────────────────────────────

  const fetchRecentPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const [platformRes, fbRes] = await Promise.all([
        fetch('/api/platform-data').then(r => r.json()).catch(() => null),
        fetch('/api/facebook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'fb_get_posts' }),
        }).then(r => r.json()).catch(() => null),
      ]);

      if (platformRes?.instagram?.topPosts) {
        setIgTopPosts(platformRes.instagram.topPosts);
      }
      if (fbRes?.posts) {
        setFbPosts(fbRes.posts.slice(0, 6));
      }

      // Check MCP tool availability
      setMcpTools(prev => prev.map(tool => {
        if (tool.name === 'composio') {
          return { ...tool, status: platformRes?.instagram?.profile?.id ? 'active' : 'inactive' };
        }
        return tool;
      }));
    } catch (err) {
      console.error('Failed to fetch recent posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  const checkMcpStatus = useCallback(async () => {
    try {
      const hermesRes = await fetch('/api/hermes').then(r => r.json()).catch(() => null);
      const hermesOnline = hermesRes && hermesRes.status !== 'offline';

      setMcpTools(prev => prev.map(tool => {
        if (tool.name === 'higgsfield') return { ...tool, status: hermesOnline ? 'active' : 'inactive' };
        if (tool.name === 'zernio') return { ...tool, status: hermesOnline ? 'active' : 'inactive' };
        if (tool.name === 'pixa') return { ...tool, status: hermesOnline ? 'active' : 'inactive' };
        return tool;
      }));
    } catch {
      // Tools stay in pending state
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchRecentPosts();
      checkMcpStatus();
    }
  }, [user, fetchRecentPosts, checkMcpStatus]);

  // ─── Handlers ───────────────────────────────────────────────────────────

  async function handleGenerateCaption() {
    if (!captionTopic.trim()) return;
    setGeneratingCaption(true);
    try {
      const res = await fetch('/api/hermes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'social_post', task: `write a caption for ${captionTopic}`, type: 'social' }),
      });
      const data = await res.json();
      const generatedCaption = data?.data?.caption || data?.data?.content || data?.caption || data?.content || data?.result || '';
      if (generatedCaption) {
        setCaption(typeof generatedCaption === 'string' ? generatedCaption : JSON.stringify(generatedCaption));
      } else {
        setCaption(`Check out ${captionTopic}! #StudEx #Content`);
      }
    } catch (err) {
      console.error('Caption generation failed:', err);
      setCaption(`Check out ${captionTopic}! #StudEx #Content`);
    } finally {
      setGeneratingCaption(false);
    }
  }

  async function handlePostNow() {
    setPosting(true);
    setPostResult(null);
    try {
      let action = '';
      let body: Record<string, any> = {};

      if (platform === 'instagram' && postType === 'image') {
        action = 'ig_post_image';
        body = { action, imageUrl, caption };
      } else if (platform === 'instagram' && postType === 'reel') {
        action = 'ig_post_reel';
        body = { action, videoUrl, caption };
      } else if (platform === 'facebook' && postType === 'image') {
        action = 'fb_post_photo';
        body = { action, imageUrl, caption };
      } else if (platform === 'facebook' && postType === 'text') {
        action = 'fb_post_text';
        body = { action, message: caption };
      } else if (platform === 'facebook' && postType === 'reel') {
        // Facebook doesn't have direct reel posting via Graph API, treat as text with link
        action = 'fb_post_text';
        body = { action, message: `${caption}\n\n${videoUrl}` };
      } else {
        action = 'fb_post_text';
        body = { action, message: caption };
      }

      const res = await fetch('/api/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        setPostResult({ success: true, message: `Posted to ${platform} successfully!` });
        setCaption('');
        setImageUrl('');
        setVideoUrl('');
      } else {
        setPostResult({ success: false, message: data.error?.message || data.error || 'Post failed. Check API credentials.' });
      }
    } catch (err: any) {
      setPostResult({ success: false, message: err.message || 'Network error' });
    } finally {
      setPosting(false);
    }
  }

  async function handlePipelineGenerate() {
    if (!pipelineIdea.trim()) return;
    setPipelineRunning(true);
    setPipelineOutput(null);
    setPipelinePostResult(null);
    try {
      // Step 1: Get caption from Hermes
      const captionRes = await fetch('/api/hermes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'social_post', task: pipelineIdea, type: 'full_pipeline' }),
      });
      const captionData = await captionRes.json();

      // Step 2: Get image prompt from Hermes
      const imageRes = await fetch('/api/hermes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'image_prompt', task: pipelineIdea, description: pipelineIdea }),
      });
      const imageData = await imageRes.json();

      // Step 3: Get video script from Hermes
      const videoRes = await fetch('/api/hermes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'video_script', task: pipelineIdea, topic: pipelineIdea }),
      });
      const videoData = await videoRes.json();

      const generatedCaption =
        captionData?.data?.caption || captionData?.data?.content || captionData?.result || captionData?.caption ||
        `Exciting content about: ${pipelineIdea}`;
      const generatedImagePrompt =
        imageData?.data?.prompt || imageData?.data?.image_prompt || imageData?.result || imageData?.prompt ||
        `Professional photo for: ${pipelineIdea}`;
      const generatedVideoScript =
        videoData?.data?.script || videoData?.data?.video_script || videoData?.result || videoData?.script ||
        `Short-form video script about: ${pipelineIdea}`;

      setPipelineOutput({
        caption: typeof generatedCaption === 'string' ? generatedCaption : JSON.stringify(generatedCaption),
        imagePrompt: typeof generatedImagePrompt === 'string' ? generatedImagePrompt : JSON.stringify(generatedImagePrompt),
        videoScript: typeof generatedVideoScript === 'string' ? generatedVideoScript : JSON.stringify(generatedVideoScript),
        raw: { captionData, imageData, videoData },
      });
    } catch (err) {
      console.error('Pipeline generation failed:', err);
      setPipelineOutput({
        caption: `Fresh content about ${pipelineIdea} -- connect Hermes for AI generation`,
        imagePrompt: `A stunning visual representing: ${pipelineIdea}`,
        videoScript: `Hook: Did you know about ${pipelineIdea}?\nBody: Here is why it matters...\nCTA: Follow for more!`,
      });
    } finally {
      setPipelineRunning(false);
    }
  }

  async function handlePipelinePost(target: 'instagram' | 'facebook') {
    if (!pipelineOutput) return;
    setPipelinePostingTo(target);
    setPipelinePostResult(null);
    try {
      const body: Record<string, any> = target === 'instagram'
        ? { action: 'ig_post_image', imageUrl: '', caption: pipelineOutput.caption }
        : { action: 'fb_post_text', message: pipelineOutput.caption };

      const res = await fetch('/api/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setPipelinePostResult({ success: true, message: `Posted to ${target}!` });
      } else {
        setPipelinePostResult({ success: false, message: data.error?.message || data.error || 'Post failed' });
      }
    } catch (err: any) {
      setPipelinePostResult({ success: false, message: err.message });
    } finally {
      setPipelinePostingTo(null);
    }
  }

  // ─── Toggle Button Component ────────────────────────────────────────────

  function ToggleGroup<T extends string>({
    options,
    value,
    onChange,
    icons,
  }: {
    options: { label: string; value: T }[];
    value: T;
    onChange: (v: T) => void;
    icons?: Record<T, React.ReactNode>;
  }) {
    return (
      <div className="flex rounded-lg border border-[#D4A017]/30 overflow-hidden">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all ${
              value === opt.value
                ? 'bg-[#D4A017] text-[#1a1a2e]'
                : 'bg-[#1a1a2e]/60 text-gray-300 hover:bg-[#D4A017]/10 hover:text-[#D4A017]'
            }`}
          >
            {icons?.[opt.value]}
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  const tabItems = [
    { id: 'quick-post', label: 'Quick Post', icon: <Send size={16} /> },
    { id: 'pipeline', label: 'Content Pipeline', icon: <Zap size={16} /> },
    { id: 'recent', label: 'Recent Posts', icon: <Layers size={16} /> },
    { id: 'mcp-tools', label: 'MCP Tools', icon: <Sparkles size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#1a1a2e]">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#D4A017] flex items-center justify-center">
                  <Zap size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e]">
                    Content Hub
                  </h1>
                  <p className="text-[#6b5b3e] text-sm">
                    One-prompt content creation with Hermes, Higgsfield, Zernio, and Pixa
                  </p>
                </div>
              </div>
            </div>

            {/* Main Tabs */}
            <Tabs
              items={tabItems}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className="[&_button]:!text-[#6b5b3e] [&_button[class*='border-b-primary']]:!text-[#D4A017] [&_button[class*='border-b-primary']]:!border-b-[#D4A017] [&>div:first-child]:!border-b-[#D4A017]/20"
            >
              {/* ══════════════════════════════════════════════════════════════
                  SECTION 1: QUICK POST
                  ══════════════════════════════════════════════════════════════ */}
              {activeTab === 'quick-post' && (
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left: Post Form */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="!bg-white !border-[#D4A017]/20 shadow-sm">
                      <h2 className="text-xl font-bold text-[#1a1a2e] mb-5 flex items-center gap-2">
                        <Send size={20} className="text-[#D4A017]" />
                        Create a Post
                      </h2>

                      {/* Platform Selector */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-[#6b5b3e] mb-2">Platform</label>
                        <ToggleGroup
                          options={[
                            { label: 'Instagram', value: 'instagram' as Platform },
                            { label: 'Facebook', value: 'facebook' as Platform },
                          ]}
                          value={platform}
                          onChange={setPlatform}
                          icons={{
                            instagram: <Instagram size={16} />,
                            facebook: <Facebook size={16} />,
                          }}
                        />
                      </div>

                      {/* Post Type Selector */}
                      <div className="mb-5">
                        <label className="block text-sm font-medium text-[#6b5b3e] mb-2">Post Type</label>
                        <ToggleGroup
                          options={[
                            { label: 'Image', value: 'image' as PostType },
                            { label: 'Reel', value: 'reel' as PostType },
                            { label: 'Text', value: 'text' as PostType },
                          ]}
                          value={postType}
                          onChange={setPostType}
                          icons={{
                            image: <ImageIcon size={16} />,
                            reel: <Video size={16} />,
                            text: <Type size={16} />,
                          }}
                        />
                      </div>

                      {/* Caption with AI Assist */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-[#6b5b3e] mb-2">Caption</label>
                        <Textarea
                          value={caption}
                          onChange={e => setCaption(e.target.value)}
                          placeholder="Write your caption here..."
                          rows={4}
                          className="!bg-[#FFF8F0] !border-[#D4A017]/30 !text-[#1a1a2e] !placeholder-[#b8a080]"
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            value={captionTopic}
                            onChange={e => setCaptionTopic(e.target.value)}
                            placeholder="Topic for AI caption (e.g. summer sale)"
                            className="!bg-[#FFF8F0] !border-[#D4A017]/30 !text-[#1a1a2e] !placeholder-[#b8a080] flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Sparkles size={16} />}
                            isLoading={generatingCaption}
                            onClick={handleGenerateCaption}
                            className="!border-[#D4A017] !text-[#D4A017] hover:!bg-[#D4A017]/10 whitespace-nowrap"
                          >
                            Generate with Hermes
                          </Button>
                        </div>
                      </div>

                      {/* Media URL */}
                      {postType === 'image' && (
                        <div className="mb-5">
                          <Input
                            label="Image URL"
                            value={imageUrl}
                            onChange={e => setImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            icon={<ImageIcon size={16} className="text-[#D4A017]" />}
                            className="!bg-[#FFF8F0] !border-[#D4A017]/30 !text-[#1a1a2e] !placeholder-[#b8a080]"
                          />
                        </div>
                      )}
                      {postType === 'reel' && (
                        <div className="mb-5">
                          <Input
                            label="Video URL"
                            value={videoUrl}
                            onChange={e => setVideoUrl(e.target.value)}
                            placeholder="https://example.com/video.mp4"
                            icon={<Video size={16} className="text-[#D4A017]" />}
                            className="!bg-[#FFF8F0] !border-[#D4A017]/30 !text-[#1a1a2e] !placeholder-[#b8a080]"
                          />
                        </div>
                      )}

                      {/* Post Button */}
                      <Button
                        size="lg"
                        fullWidth
                        icon={<Send size={18} />}
                        isLoading={posting}
                        onClick={handlePostNow}
                        disabled={!caption.trim() || (postType === 'image' && !imageUrl.trim()) || (postType === 'reel' && !videoUrl.trim())}
                        className="!bg-[#D4A017] hover:!bg-[#b8860b] !text-white !shadow-lg"
                      >
                        Post Now to {platform === 'instagram' ? 'Instagram' : 'Facebook'}
                      </Button>

                      {/* Result */}
                      {postResult && (
                        <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
                          postResult.success
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                          {postResult.success ? <CheckCircle size={20} /> : <XCircle size={20} />}
                          <span className="text-sm font-medium">{postResult.message}</span>
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Right: Tips */}
                  <div className="space-y-6">
                    <Card className="!bg-white !border-[#D4A017]/20 shadow-sm">
                      <h3 className="font-bold text-[#1a1a2e] mb-3 flex items-center gap-2">
                        <Sparkles size={18} className="text-[#D4A017]" />
                        Quick Tips
                      </h3>
                      <div className="space-y-3 text-sm text-[#6b5b3e]">
                        <div className="flex items-start gap-2">
                          <Instagram size={14} className="mt-0.5 text-pink-500 shrink-0" />
                          <span>IG images need a public URL. Use Pixa to generate one.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Video size={14} className="mt-0.5 text-purple-500 shrink-0" />
                          <span>Reels need an .mp4 URL. Higgsfield can generate videos from scripts.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Sparkles size={14} className="mt-0.5 text-[#D4A017] shrink-0" />
                          <span>Use the AI caption generator to create engaging captions instantly.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Facebook size={14} className="mt-0.5 text-blue-500 shrink-0" />
                          <span>Facebook text posts don&apos;t need media -- just caption and go.</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="!bg-gradient-to-br !from-[#D4A017]/10 !to-[#FFF8F0] !border-[#D4A017]/30 shadow-sm">
                      <h3 className="font-bold text-[#1a1a2e] mb-2">Supported Actions</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[#6b5b3e]">IG Image Post</span>
                          <Badge variant="success" size="sm">ig_post_image</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#6b5b3e]">IG Reel Post</span>
                          <Badge variant="success" size="sm">ig_post_reel</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#6b5b3e]">FB Photo Post</span>
                          <Badge variant="info" size="sm">fb_post_photo</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#6b5b3e]">FB Text Post</span>
                          <Badge variant="info" size="sm">fb_post_text</Badge>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  SECTION 2: CONTENT PIPELINE
                  ══════════════════════════════════════════════════════════════ */}
              {activeTab === 'pipeline' && (
                <div className="space-y-6">
                  {/* Pipeline Flow Visualization */}
                  <Card className="!bg-white !border-[#D4A017]/20 shadow-sm">
                    <h2 className="text-xl font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
                      <Zap size={20} className="text-[#D4A017]" />
                      Automated Content Pipeline
                    </h2>
                    <div className="flex flex-wrap items-center justify-center gap-3 py-4">
                      {[
                        { icon: <Wand2 size={20} />, label: 'You describe', color: 'bg-[#D4A017]' },
                        { icon: <ArrowRight size={16} />, label: '', color: '' },
                        { icon: <Sparkles size={20} />, label: 'Hermes writes caption', color: 'bg-purple-500' },
                        { icon: <ArrowRight size={16} />, label: '', color: '' },
                        { icon: <Video size={20} />, label: 'Higgsfield generates video', color: 'bg-blue-500' },
                        { icon: <ArrowRight size={16} />, label: '', color: '' },
                        { icon: <Send size={20} />, label: 'Zernio posts it live', color: 'bg-green-500' },
                      ].map((step, i) =>
                        step.color ? (
                          <div key={i} className="flex flex-col items-center gap-2">
                            <div className={`${step.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md`}>
                              {step.icon}
                            </div>
                            <span className="text-xs font-medium text-[#6b5b3e] text-center max-w-[100px]">{step.label}</span>
                          </div>
                        ) : (
                          <div key={i} className="text-[#D4A017]/50 hidden sm:block">{step.icon}</div>
                        )
                      )}
                    </div>
                  </Card>

                  {/* Pipeline Input */}
                  <Card className="!bg-white !border-[#D4A017]/20 shadow-sm">
                    <h3 className="font-bold text-[#1a1a2e] mb-3 flex items-center gap-2">
                      <Wand2 size={18} className="text-[#D4A017]" />
                      Describe Your Content Idea
                    </h3>
                    <Textarea
                      value={pipelineIdea}
                      onChange={e => setPipelineIdea(e.target.value)}
                      placeholder="e.g. A 30-second reel about our new summer collection featuring bright colors and beach vibes, targeting Gen Z shoppers..."
                      rows={4}
                      className="!bg-[#FFF8F0] !border-[#D4A017]/30 !text-[#1a1a2e] !placeholder-[#b8a080]"
                    />
                    <Button
                      size="lg"
                      fullWidth
                      icon={<Zap size={18} />}
                      isLoading={pipelineRunning}
                      onClick={handlePipelineGenerate}
                      disabled={!pipelineIdea.trim()}
                      className="!bg-[#D4A017] hover:!bg-[#b8860b] !text-white !shadow-lg mt-4"
                    >
                      Generate Full Pipeline
                    </Button>
                  </Card>

                  {/* Pipeline Output */}
                  {pipelineOutput && (
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Caption Output */}
                      <Card className="!bg-white !border-purple-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                            <Sparkles size={16} className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#1a1a2e] text-sm">Hermes Caption</h4>
                            <p className="text-xs text-[#6b5b3e]">AI-generated copy</p>
                          </div>
                        </div>
                        <p className="text-sm text-[#1a1a2e] bg-[#FFF8F0] rounded-lg p-3 mb-3 whitespace-pre-wrap break-words">
                          {pipelineOutput.caption}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            icon={<Instagram size={14} />}
                            isLoading={pipelinePostingTo === 'instagram'}
                            onClick={() => handlePipelinePost('instagram')}
                            className="!border-pink-400 !text-pink-600 hover:!bg-pink-50 flex-1"
                          >
                            Post to IG
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            icon={<Facebook size={14} />}
                            isLoading={pipelinePostingTo === 'facebook'}
                            onClick={() => handlePipelinePost('facebook')}
                            className="!border-blue-400 !text-blue-600 hover:!bg-blue-50 flex-1"
                          >
                            Post to FB
                          </Button>
                        </div>
                      </Card>

                      {/* Image Prompt Output */}
                      <Card className="!bg-white !border-[#D4A017]/20 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-[#D4A017] flex items-center justify-center">
                            <ImageIcon size={16} className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#1a1a2e] text-sm">Pixa Image Prompt</h4>
                            <p className="text-xs text-[#6b5b3e]">Use with Pixa MCP</p>
                          </div>
                        </div>
                        <p className="text-sm text-[#1a1a2e] bg-[#FFF8F0] rounded-lg p-3 whitespace-pre-wrap break-words">
                          {pipelineOutput.imagePrompt}
                        </p>
                        <p className="text-xs text-[#b8a080] mt-2">
                          Copy this prompt into Pixa to generate the image, then use Quick Post to publish.
                        </p>
                      </Card>

                      {/* Video Script Output */}
                      <Card className="!bg-white !border-blue-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                            <Video size={16} className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#1a1a2e] text-sm">Higgsfield Script</h4>
                            <p className="text-xs text-[#6b5b3e]">Video generation script</p>
                          </div>
                        </div>
                        <p className="text-sm text-[#1a1a2e] bg-[#FFF8F0] rounded-lg p-3 whitespace-pre-wrap break-words">
                          {pipelineOutput.videoScript}
                        </p>
                        <p className="text-xs text-[#b8a080] mt-2">
                          Feed this script to Higgsfield MCP to generate a video, then post as a Reel.
                        </p>
                      </Card>
                    </div>
                  )}

                  {/* Pipeline Post Result */}
                  {pipelinePostResult && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${
                      pipelinePostResult.success
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      {pipelinePostResult.success ? <CheckCircle size={20} /> : <XCircle size={20} />}
                      <span className="text-sm font-medium">{pipelinePostResult.message}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  SECTION 3: RECENT POSTS
                  ══════════════════════════════════════════════════════════════ */}
              {activeTab === 'recent' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#1a1a2e] flex items-center gap-2">
                      <Layers size={20} className="text-[#D4A017]" />
                      Recent Posts
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<RefreshCw size={14} />}
                      onClick={fetchRecentPosts}
                      isLoading={loadingPosts}
                      className="!border-[#D4A017] !text-[#D4A017] hover:!bg-[#D4A017]/10"
                    >
                      Refresh
                    </Button>
                  </div>

                  {/* Instagram Top Posts */}
                  <div>
                    <h3 className="font-bold text-[#1a1a2e] mb-3 flex items-center gap-2">
                      <Instagram size={18} className="text-pink-500" />
                      Instagram Top Posts
                    </h3>
                    {loadingPosts ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                          <Card key={i} className="!bg-white !border-[#D4A017]/10 shadow-sm animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                            <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                            <div className="h-3 bg-gray-100 rounded w-1/3" />
                          </Card>
                        ))}
                      </div>
                    ) : igTopPosts.length > 0 ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {igTopPosts.map((post, i) => (
                          <Card key={i} className="!bg-white !border-[#D4A017]/20 shadow-sm">
                            <div className="flex items-start justify-between mb-2">
                              <Badge
                                variant={post.type === 'VIDEO' ? 'warning' : 'primary'}
                                size="sm"
                              >
                                {post.type === 'VIDEO' ? 'Reel' : 'Image'}
                              </Badge>
                              {post.permalink && (
                                <a
                                  href={post.permalink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#D4A017] hover:text-[#b8860b] transition-colors"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                            <p className="text-sm text-[#1a1a2e] mb-3 line-clamp-3">
                              {post.caption || 'No caption'}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-[#6b5b3e]">
                              <span className="flex items-center gap-1">
                                <Heart size={12} className="text-red-400" />
                                {post.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle size={12} className="text-blue-400" />
                                {post.comments}
                              </span>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="!bg-white !border-[#D4A017]/10 shadow-sm">
                        <div className="text-center py-8 text-[#b8a080]">
                          <Instagram size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No Instagram posts found. Connect your account or create your first post.</p>
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Facebook Posts */}
                  <div>
                    <h3 className="font-bold text-[#1a1a2e] mb-3 flex items-center gap-2">
                      <Facebook size={18} className="text-blue-600" />
                      Facebook Posts
                    </h3>
                    {loadingPosts ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                          <Card key={i} className="!bg-white !border-[#D4A017]/10 shadow-sm animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                          </Card>
                        ))}
                      </div>
                    ) : fbPosts.length > 0 ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {fbPosts.map((post, i) => (
                          <Card key={i} className="!bg-white !border-blue-100 shadow-sm">
                            <p className="text-sm text-[#1a1a2e] mb-3 line-clamp-3">
                              {post.message || 'No message'}
                            </p>
                            <div className="flex items-center justify-between text-xs text-[#6b5b3e]">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <Heart size={12} className="text-red-400" />
                                  {post.likes?.summary?.total_count || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle size={12} className="text-blue-400" />
                                  {post.comments?.summary?.total_count || 0}
                                </span>
                              </div>
                              {post.created_time && (
                                <span>{new Date(post.created_time).toLocaleDateString()}</span>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="!bg-white !border-blue-100 shadow-sm">
                        <div className="text-center py-8 text-[#b8a080]">
                          <Facebook size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No Facebook posts found. Use Quick Post to publish your first one.</p>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  SECTION 4: MCP TOOLS STATUS
                  ══════════════════════════════════════════════════════════════ */}
              {activeTab === 'mcp-tools' && (
                <div className="space-y-6">
                  <Card className="!bg-white !border-[#D4A017]/20 shadow-sm">
                    <h2 className="text-xl font-bold text-[#1a1a2e] mb-2 flex items-center gap-2">
                      <Sparkles size={20} className="text-[#D4A017]" />
                      MCP Tools Status
                    </h2>
                    <p className="text-sm text-[#6b5b3e] mb-6">
                      These Model Context Protocol tools power the automated content pipeline.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {mcpTools.map(tool => (
                        <div
                          key={tool.name}
                          className={`rounded-xl border p-5 transition-all ${
                            tool.status === 'active'
                              ? 'border-green-200 bg-green-50/50'
                              : tool.status === 'inactive'
                              ? 'border-red-200 bg-red-50/30'
                              : 'border-gray-200 bg-gray-50/30'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                tool.name === 'higgsfield' ? 'bg-blue-500' :
                                tool.name === 'zernio' ? 'bg-green-500' :
                                tool.name === 'pixa' ? 'bg-[#D4A017]' :
                                'bg-purple-500'
                              }`}>
                                {tool.name === 'higgsfield' && <Video size={20} className="text-white" />}
                                {tool.name === 'zernio' && <Send size={20} className="text-white" />}
                                {tool.name === 'pixa' && <ImageIcon size={20} className="text-white" />}
                                {tool.name === 'composio' && <Play size={20} className="text-white" />}
                              </div>
                              <div>
                                <h3 className="font-bold text-[#1a1a2e]">{tool.label}</h3>
                                <p className="text-xs text-[#6b5b3e]">{tool.description}</p>
                              </div>
                            </div>
                            <StatusIndicator
                              status={tool.status}
                              label={tool.status === 'active' ? 'Connected' : tool.status === 'inactive' ? 'Offline' : 'Checking...'}
                              size="sm"
                            />
                          </div>

                          {/* Capabilities */}
                          <div className="mt-3 pt-3 border-t border-gray-200/50">
                            <div className="flex flex-wrap gap-1.5">
                              {tool.name === 'higgsfield' && (
                                <>
                                  <Badge variant="info" size="sm">Video Gen</Badge>
                                  <Badge variant="info" size="sm">Reels</Badge>
                                  <Badge variant="info" size="sm">Script-to-Video</Badge>
                                </>
                              )}
                              {tool.name === 'zernio' && (
                                <>
                                  <Badge variant="success" size="sm">Auto-Caption</Badge>
                                  <Badge variant="success" size="sm">Auto-Post</Badge>
                                  <Badge variant="success" size="sm">Scheduling</Badge>
                                </>
                              )}
                              {tool.name === 'pixa' && (
                                <>
                                  <Badge variant="warning" size="sm">Image Gen</Badge>
                                  <Badge variant="warning" size="sm">Prompt-to-Image</Badge>
                                  <Badge variant="warning" size="sm">Thumbnails</Badge>
                                </>
                              )}
                              {tool.name === 'composio' && (
                                <>
                                  <Badge variant="primary" size="sm">IG Connector</Badge>
                                  <Badge variant="primary" size="sm">FB Connector</Badge>
                                  <Badge variant="primary" size="sm">OAuth</Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Architecture Overview */}
                  <Card className="!bg-white !border-[#D4A017]/20 shadow-sm">
                    <h3 className="font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
                      <Layers size={18} className="text-[#D4A017]" />
                      How It Works
                    </h3>
                    <div className="space-y-4 text-sm text-[#6b5b3e]">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#D4A017] flex items-center justify-center text-white text-xs font-bold shrink-0">1</div>
                        <div>
                          <p className="font-medium text-[#1a1a2e]">Describe your idea</p>
                          <p>Enter a content concept in the Pipeline tab. One sentence is enough.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">2</div>
                        <div>
                          <p className="font-medium text-[#1a1a2e]">Hermes writes the caption</p>
                          <p>The content agent generates platform-optimized copy, hashtags, and CTAs.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">3</div>
                        <div>
                          <p className="font-medium text-[#1a1a2e]">Higgsfield generates the video</p>
                          <p>The video script is fed to Higgsfield to produce a short-form reel or clip.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold shrink-0">4</div>
                        <div>
                          <p className="font-medium text-[#1a1a2e]">Zernio posts it live</p>
                          <p>Content is auto-posted to Instagram and Facebook via the Composio connector.</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
