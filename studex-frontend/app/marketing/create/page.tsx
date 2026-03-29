'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Type,
  Send,
  Eye,
  Sparkles,
  Upload,
  Trash2,
  Plus,
  Wand2,
} from 'lucide-react';
import { marketingApi } from '@/lib/marketing-api';
import {
  HOOK_FORMULAS,
  PLATFORM_LABELS,
  type MarketingProfile,
  type HookCategory,
  type Platform,
  type SlideData,
} from '@/lib/marketing-types';

type Step = 'hook' | 'slides' | 'overlays' | 'caption' | 'preview';

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'hook', label: 'Hook & Strategy', icon: <Sparkles size={18} /> },
  { id: 'slides', label: 'Slide Images', icon: <ImageIcon size={18} /> },
  { id: 'overlays', label: 'Text Overlays', icon: <Type size={18} /> },
  { id: 'caption', label: 'Caption & CTA', icon: <Wand2 size={18} /> },
  { id: 'preview', label: 'Preview & Post', icon: <Send size={18} /> },
];

export default function CreatePostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<MarketingProfile | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('hook');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [posting, setPosting] = useState(false);
  const [generatedImageUrls, setGeneratedImageUrls] = useState<string[]>([
    '', '', '', '', '', '',
  ]);

  // Form state
  const [hookCategory, setHookCategory] = useState<HookCategory>('person-conflict');
  const [hookText, setHookText] = useState('');
  const [slideTexts, setSlideTexts] = useState<string[]>([
    '', // Slide 1: Hook
    '', // Slide 2: Problem
    '', // Slide 3: Discovery
    '', // Slide 4: Transformation 1
    '', // Slide 5: Transformation 2
    '', // Slide 6: CTA
  ]);
  const [slideImages, setSlideImages] = useState<(File | null)[]>([
    null, null, null, null, null, null,
  ]);
  const [slideImagePreviews, setSlideImagePreviews] = useState<string[]>([
    '', '', '', '', '', '',
  ]);
  const [captionText, setCaptionText] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['tiktok', 'instagram']);
  const [imagePrompt, setImagePrompt] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const p = await marketingApi.profile.getProfile();
        setProfile(p);
        if (p?.imageGen.basePrompt) {
          setImagePrompt(p.imageGen.basePrompt);
        }
        if (p?.uploadPost.platforms) {
          setSelectedPlatforms(p.uploadPost.platforms);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    }
    if (user) loadProfile();
  }, [user]);

  const handleImageUpload = (index: number, file: File) => {
    const newImages = [...slideImages];
    newImages[index] = file;
    setSlideImages(newImages);

    const reader = new FileReader();
    reader.onload = (e) => {
      const newPreviews = [...slideImagePreviews];
      newPreviews[index] = e.target?.result as string;
      setSlideImagePreviews(newPreviews);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...slideImages];
    newImages[index] = null;
    setSlideImages(newImages);

    const newPreviews = [...slideImagePreviews];
    newPreviews[index] = '';
    setSlideImagePreviews(newPreviews);
  };

  const handleSlideTextChange = (index: number, text: string) => {
    const newTexts = [...slideTexts];
    newTexts[index] = text;
    setSlideTexts(newTexts);
  };

  const applyHookTemplate = (template: string) => {
    setHookText(template);
    const newTexts = [...slideTexts];
    newTexts[0] = template;
    setSlideTexts(newTexts);
  };

  // ========== AI IMAGE GENERATION ==========
  const handleGenerateImages = async () => {
    if (!imagePrompt) {
      toast.error('Please enter an image generation prompt first');
      return;
    }
    if (!profile) {
      toast.error('Please set up your marketing profile first');
      return;
    }

    setGenerating(true);
    const toastId = toast.loading('Generating 6 slideshow images with AI...');

    try {
      // Call the backend slide generation endpoint
      const response = await fetch('/api/marketing/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          slideTexts,
          provider: profile.imageGen.provider,
          model: profile.imageGen.model,
          count: 6,
        }),
      });

      if (!response.ok) {
        // Fallback: generate via client-side OpenAI if backend unavailable
        const errorText = await response.text();
        throw new Error(errorText || 'Backend generation failed');
      }

      const data = await response.json();
      if (data.images && data.images.length > 0) {
        const newPreviews = [...slideImagePreviews];
        const newUrls = [...generatedImageUrls];
        data.images.forEach((img: { url: string; index: number }) => {
          newPreviews[img.index] = img.url;
          newUrls[img.index] = img.url;
        });
        setSlideImagePreviews(newPreviews);
        setGeneratedImageUrls(newUrls);
        toast.success('Generated 6 slideshow images!', { id: toastId });
      }
    } catch (err) {
      console.error('Image generation failed:', err);
      toast.error('Image generation failed. Upload images manually or check your API key in Settings.', { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  // ========== UPLOAD IMAGES TO STORAGE ==========
  const uploadImagesToStorage = async (postId: string): Promise<SlideData[]> => {
    if (!profile?.id) throw new Error('No profile');

    const slides: SlideData[] = [];
    for (let i = 0; i < 6; i++) {
      let imageUrl = generatedImageUrls[i] || '';

      // If user uploaded a file, upload to Firebase Storage
      if (slideImages[i]) {
        imageUrl = await marketingApi.storage.uploadSlideImage(
          profile.id, postId, slideImages[i]!, i
        );
      }

      slides.push({
        imageUrl,
        overlayText: slideTexts[i],
        prompt: imagePrompt,
        order: i,
      });
    }
    return slides;
  };

  // ========== POST TO PLATFORMS VIA UPLOAD-POST ==========
  const handlePostToPlatforms = async (postId: string, slides: SlideData[]) => {
    if (!profile?.uploadPost.apiKey) {
      toast.error('Upload-Post API key not configured. Go to Settings.');
      return;
    }

    setPosting(true);
    const toastId = toast.loading(`Posting to ${selectedPlatforms.length} platforms...`);

    try {
      // Convert slide image URLs to File objects for Upload-Post API
      const imageFiles: File[] = [];
      for (const slide of slides) {
        if (slide.imageUrl) {
          const response = await fetch(slide.imageUrl);
          const blob = await response.blob();
          imageFiles.push(new File([blob], `slide-${slide.order}.png`, { type: 'image/png' }));
        }
      }

      if (imageFiles.length === 0) {
        throw new Error('No images to upload. Generate or upload images first.');
      }

      const { requestId } = await marketingApi.uploadPost.postToplatforms(
        profile.uploadPost.apiKey,
        profile.uploadPost.profile,
        selectedPlatforms,
        imageFiles,
        captionText,
        hookText
      );

      // Update the post with the request ID and status
      await marketingApi.posts.updatePost(postId, {
        requestId,
        status: 'posting',
      });

      // Track the hook performance
      if (profile.id) {
        await marketingApi.hooks.trackHook({
          profileId: profile.id,
          postId,
          hookText,
          hookCategory,
          requestId,
          date: new Date().toISOString().split('T')[0],
          impressions: 0,
          conversions: 0,
          ctaText,
          status: 'testing',
        });
      }

      toast.success(`Posted to ${selectedPlatforms.length} platforms! Request ID: ${requestId}`, { id: toastId });
    } catch (err) {
      console.error('Upload-Post failed:', err);
      await marketingApi.posts.updatePost(postId, { status: 'failed' });
      toast.error(`Posting failed: ${(err as Error).message}`, { id: toastId });
    } finally {
      setPosting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!profile?.id) {
      toast.error('Please set up your marketing profile first');
      return;
    }

    setSaving(true);
    try {
      const slides: SlideData[] = slideTexts.map((text, i) => ({
        imageUrl: slideImagePreviews[i] || '',
        overlayText: text,
        prompt: imagePrompt,
        order: i,
      }));

      await marketingApi.posts.createPost({
        profileId: profile.id,
        requestId: '',
        hookText,
        hookCategory,
        captionText,
        ctaText,
        slides,
        platforms: selectedPlatforms,
        platformResults: {},
        status: 'draft',
        scheduledAt: null,
        postedAt: null,
      });

      toast.success('Draft saved!');
      router.push('/marketing');
    } catch (err) {
      console.error('Failed to save draft:', err);
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handlePost = async () => {
    if (!profile?.id) {
      toast.error('Please set up your marketing profile first');
      return;
    }

    // Verify we have images
    const hasImages = slideImagePreviews.some((p) => p !== '') || slideImages.some((f) => f !== null);
    if (!hasImages) {
      toast.error('Please generate or upload slide images before posting');
      return;
    }

    if (!profile.uploadPost.apiKey) {
      toast.error('Upload-Post API key not configured. Go to Marketing > Settings first.');
      return;
    }

    setSaving(true);
    try {
      // Step 1: Create post in Firestore
      const postId = await marketingApi.posts.createPost({
        profileId: profile.id,
        requestId: '',
        hookText,
        hookCategory,
        captionText,
        ctaText,
        slides: [],
        platforms: selectedPlatforms,
        platformResults: {},
        status: 'generating',
        scheduledAt: null,
        postedAt: null,
      });

      toast.loading('Uploading images to storage...');

      // Step 2: Upload images to Firebase Storage
      const slides = await uploadImagesToStorage(postId);

      // Step 3: Update post with slide URLs
      await marketingApi.posts.updatePost(postId, { slides, status: 'ready' });

      // Step 4: Post to platforms via Upload-Post API
      await handlePostToPlatforms(postId, slides);

      toast.success('Post published!');
      router.push('/marketing/campaigns');
    } catch (err) {
      console.error('Failed to create post:', err);
      toast.error(`Failed to post: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const canGoNext = stepIndex < STEPS.length - 1;
  const canGoPrev = stepIndex > 0;

  const slideLabels = [
    'Hook (Attention Grabber)',
    'Problem (Pain Point)',
    'Discovery (Introduce Solution)',
    'Transformation 1 (Show Result)',
    'Transformation 2 (Reinforce)',
    'CTA (Call to Action)',
  ];

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeft size={18} />}
                onClick={() => router.push('/marketing')}
              >
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Create Slideshow Post</h1>
                <p className="text-gray-400 text-sm">
                  Step {stepIndex + 1} of {STEPS.length}: {STEPS[stepIndex].label}
                </p>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
              {STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    currentStep === step.id
                      ? 'bg-primary-600/20 text-primary-300 border border-primary-600/50'
                      : idx < stepIndex
                      ? 'bg-green-900/20 text-green-300 border border-green-600/30'
                      : 'text-gray-400 bg-dark-800/50 border border-primary-700/20'
                  }`}
                >
                  {step.icon}
                  {step.label}
                </button>
              ))}
            </div>

            {/* Step Content */}
            {currentStep === 'hook' && (
              <Card>
                <h2 className="text-xl font-bold mb-6">Hook & Strategy</h2>

                <div className="space-y-6">
                  <Select
                    label="Hook Category"
                    value={hookCategory}
                    onChange={(e) =>
                      setHookCategory(e.target.value as HookCategory)
                    }
                  >
                    <option value="person-conflict">Person Conflict (Highest Performing)</option>
                    <option value="budget">Budget Transformation</option>
                    <option value="self-discovery">Self Discovery</option>
                    <option value="before-after">Before / After</option>
                    <option value="pov">POV Format</option>
                    <option value="listicle">Listicle</option>
                    <option value="tutorial">Tutorial / How-To</option>
                  </Select>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Hook Templates
                    </label>
                    <div className="space-y-2">
                      {HOOK_FORMULAS[hookCategory].map((template, idx) => (
                        <button
                          key={idx}
                          onClick={() => applyHookTemplate(template)}
                          className="block w-full text-left p-3 rounded-lg bg-dark-800/50 border border-primary-700/20 hover:border-primary-600/50 transition-all text-sm"
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Textarea
                    label="Your Hook Text"
                    placeholder="Write your hook or select a template above..."
                    value={hookText}
                    onChange={(e) => setHookText(e.target.value)}
                    rows={3}
                    helper="This appears on Slide 1. Use reactions not labels (e.g. 'Wait... is this nice??' not 'Modern minimalist')"
                  />

                  <Textarea
                    label="Image Generation Prompt"
                    placeholder="iPhone photo of a cozy modern living room with warm lighting..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={4}
                    helper="Include 'iPhone photo' and 'realistic lighting'. Lock architectural details for consistency across slides."
                  />
                </div>
              </Card>
            )}

            {currentStep === 'slides' && (
              <div className="space-y-6">
                <Card>
                  <h2 className="text-xl font-bold mb-2">Slide Images</h2>
                  <p className="text-gray-400 text-sm mb-4">
                    Upload 6 images (1024x1536 portrait) or use AI generation. All slides should share consistent visual elements.
                  </p>

                  {/* AI Generation Button */}
                  <div className="mb-6 p-4 rounded-lg border border-primary-600/30 bg-primary-900/10">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h3 className="font-medium text-primary-300 flex items-center gap-2">
                          <Sparkles size={16} /> AI Image Generation
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          Generate all 6 slides from your prompt using {profile?.imageGen.provider || 'OpenAI'}
                        </p>
                      </div>
                      <Button
                        icon={<Wand2 size={16} />}
                        isLoading={generating}
                        onClick={handleGenerateImages}
                        disabled={!imagePrompt || generating}
                      >
                        {generating ? 'Generating...' : 'Generate 6 Slides'}
                      </Button>
                    </div>
                    {!imagePrompt && (
                      <p className="text-xs text-amber-400 mt-2">
                        Go back to Step 1 and enter an image generation prompt first.
                      </p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {slideLabels.map((label, idx) => (
                      <div key={idx} className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Slide {idx + 1}: {label}
                        </label>
                        <div className="relative aspect-[2/3] rounded-lg border-2 border-dashed border-primary-700/30 bg-dark-800/30 overflow-hidden">
                          {slideImagePreviews[idx] ? (
                            <>
                              <img
                                src={slideImagePreviews[idx]}
                                alt={`Slide ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600/80 hover:bg-red-600 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          ) : (
                            <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-dark-800/50 transition-colors">
                              <Upload size={24} className="text-gray-500 mb-2" />
                              <span className="text-xs text-gray-500">Upload Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(idx, file);
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {currentStep === 'overlays' && (
              <Card>
                <h2 className="text-xl font-bold mb-2">Text Overlays</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Add text for each slide. Use \n for line breaks. Keep 4-6 words per line, 3-4 lines per slide. Use reactions, not labels.
                </p>

                <div className="space-y-4">
                  {slideLabels.map((label, idx) => (
                    <Textarea
                      key={idx}
                      label={`Slide ${idx + 1}: ${label}`}
                      placeholder={
                        idx === 0
                          ? "I showed my landlord\nwhat AI thinks our\nkitchen should look like"
                          : idx === 5
                          ? "Download [App]\nlink in bio"
                          : `Slide ${idx + 1} text...`
                      }
                      value={slideTexts[idx]}
                      onChange={(e) => handleSlideTextChange(idx, e.target.value)}
                      rows={3}
                    />
                  ))}
                </div>
              </Card>
            )}

            {currentStep === 'caption' && (
              <Card>
                <h2 className="text-xl font-bold mb-6">Caption & CTA</h2>

                <div className="space-y-6">
                  <Textarea
                    label="Caption"
                    placeholder={`My landlord told me I can't change anything in the flat...\n\nSo I downloaded this AI app that shows you what your space COULD look like without changing a thing.\n\nI took one photo of my kitchen and honestly?? I'm obsessed.\n\nThe app is called [AppName] — it's free to try and shows you infinite design options.\n\n#homedesign #interiordesign #aidesign #homedecor #roomtransformation`}
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                    rows={8}
                    helper="Long storytelling captions get 3x more views. Structure: Hook → Problem → Discovery → Result → max 5 hashtags."
                  />

                  <Input
                    label="CTA (Call to Action)"
                    placeholder="Download [AppName] — link in bio"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    helper="This appears on your final slide. Test variations: 'link in bio', 'search on App Store', app name only."
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Target Platforms
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(
                        Object.entries(PLATFORM_LABELS) as [Platform, string][]
                      ).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedPlatforms((prev) =>
                              prev.includes(key)
                                ? prev.filter((p) => p !== key)
                                : [...prev, key]
                            );
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            selectedPlatforms.includes(key)
                              ? 'bg-primary-600/20 text-primary-300 border border-primary-600/50'
                              : 'text-gray-400 bg-dark-800/50 border border-primary-700/20 hover:border-primary-600/30'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 'preview' && (
              <div className="space-y-6">
                <Card>
                  <h2 className="text-xl font-bold mb-6">Preview Your Post</h2>

                  {/* Slide Preview Carousel */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">Slides</h3>
                    <div className="flex gap-3 overflow-x-auto pb-4">
                      {slideTexts.map((text, idx) => (
                        <div
                          key={idx}
                          className="flex-shrink-0 w-40 aspect-[2/3] rounded-lg border border-primary-700/30 bg-dark-800/50 overflow-hidden relative"
                        >
                          {slideImagePreviews[idx] && (
                            <img
                              src={slideImagePreviews[idx]}
                              alt={`Slide ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center p-3">
                            <p className="text-xs text-center font-bold text-white drop-shadow-lg whitespace-pre-line">
                              {text || `Slide ${idx + 1}`}
                            </p>
                          </div>
                          <div className="absolute top-1 left-1">
                            <Badge variant="primary" size="sm">
                              {idx + 1}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Post Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Hook</h3>
                      <p className="font-bold">{hookText || 'No hook set'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Hook Category</h3>
                      <Badge variant="primary">{hookCategory}</Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Caption</h3>
                      <p className="text-sm whitespace-pre-line text-gray-300">
                        {captionText || 'No caption set'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">CTA</h3>
                      <p className="font-medium text-primary-300">{ctaText || 'No CTA set'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Platforms</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedPlatforms.map((p) => (
                          <Badge key={p} variant="success" size="sm">
                            {PLATFORM_LABELS[p]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Validation Warnings */}
                {!slideImagePreviews.some((p) => p !== '') && (
                  <Card>
                    <div className="text-center py-4">
                      <p className="text-amber-400 font-medium">No slide images yet</p>
                      <p className="text-gray-400 text-sm mt-1">
                        Go back to Step 2 to generate images with AI or upload manually.
                      </p>
                    </div>
                  </Card>
                )}

                {!profile?.uploadPost.apiKey && (
                  <Card>
                    <div className="text-center py-4">
                      <p className="text-amber-400 font-medium">Upload-Post API not configured</p>
                      <p className="text-gray-400 text-sm mt-1">
                        Go to <button onClick={() => router.push('/marketing/settings')} className="text-primary-300 underline">Marketing Settings</button> to add your Upload-Post API key before posting.
                      </p>
                    </div>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    fullWidth
                    isLoading={saving}
                    onClick={handleSaveDraft}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    fullWidth
                    icon={<Send size={18} />}
                    isLoading={saving || posting}
                    disabled={!slideImagePreviews.some((p) => p !== '') || !profile?.uploadPost.apiKey}
                    onClick={handlePost}
                  >
                    {posting ? 'Publishing...' : `Post to ${selectedPlatforms.length} Platform${selectedPlatforms.length !== 1 ? 's' : ''}`}
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="secondary"
                icon={<ArrowLeft size={18} />}
                disabled={!canGoPrev}
                onClick={() =>
                  setCurrentStep(STEPS[stepIndex - 1].id)
                }
              >
                Previous
              </Button>
              <Button
                icon={<ArrowRight size={18} />}
                disabled={!canGoNext}
                onClick={() =>
                  setCurrentStep(STEPS[stepIndex + 1].id)
                }
              >
                Next
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
