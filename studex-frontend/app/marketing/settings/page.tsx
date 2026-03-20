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
  Save,
  Settings,
  Image as ImageIcon,
  Send,
  Clock,
  BarChart3,
  Shield,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { marketingApi } from '@/lib/marketing-api';
import {
  PLATFORM_LABELS,
  CATEGORY_LABELS,
  type MarketingProfile,
  type Platform,
} from '@/lib/marketing-types';

export default function MarketingSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingProfileId, setExistingProfileId] = useState<string | null>(null);

  // Profile fields
  const [appName, setAppName] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState('');
  const [problem, setProblem] = useState('');
  const [differentiator, setDifferentiator] = useState('');
  const [category, setCategory] = useState('tech');
  const [url, setUrl] = useState('');

  // Image Gen
  const [imageProvider, setImageProvider] = useState('openai');
  const [imageModel, setImageModel] = useState('gpt-image-1.5');
  const [basePrompt, setBasePrompt] = useState('');

  // Upload-Post
  const [uploadPostApiKey, setUploadPostApiKey] = useState('');
  const [uploadPostProfile, setUploadPostProfile] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    'tiktok',
    'instagram',
  ]);

  // Posting Schedule
  const [schedule, setSchedule] = useState(['07:30', '16:30', '21:00']);
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // RevenueCat
  const [revenuecatEnabled, setRevenuecatEnabled] = useState(false);
  const [revenuecatProjectId, setRevenuecatProjectId] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await marketingApi.profile.getProfile();
        if (profile) {
          setExistingProfileId(profile.id || null);
          setAppName(profile.appName || '');
          setDescription(profile.description || '');
          setAudience(profile.audience || '');
          setProblem(profile.problem || '');
          setDifferentiator(profile.differentiator || '');
          setCategory(profile.category || 'tech');
          setUrl(profile.url || '');
          setImageProvider(profile.imageGen?.provider || 'openai');
          setImageModel(profile.imageGen?.model || 'gpt-image-1.5');
          setBasePrompt(profile.imageGen?.basePrompt || '');
          setUploadPostApiKey(profile.uploadPost?.apiKey || '');
          setUploadPostProfile(profile.uploadPost?.profile || '');
          setSelectedPlatforms(
            profile.uploadPost?.platforms || ['tiktok', 'instagram']
          );
          setSchedule(profile.posting?.schedule || ['07:30', '16:30', '21:00']);
          setTimezone(
            profile.posting?.timezone ||
              Intl.DateTimeFormat().resolvedOptions().timeZone
          );
          setRevenuecatEnabled(profile.revenuecat?.enabled || false);
          setRevenuecatProjectId(profile.revenuecat?.projectId || '');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!appName.trim()) {
      toast.error('App/Business name is required');
      return;
    }

    setSaving(true);
    try {
      const profileData = {
        appName,
        description,
        audience,
        problem,
        differentiator,
        category: category as MarketingProfile['category'],
        url,
        imageGen: {
          provider: imageProvider as MarketingProfile['imageGen']['provider'],
          model: imageModel,
          basePrompt,
        },
        uploadPost: {
          apiKey: uploadPostApiKey,
          profile: uploadPostProfile,
          platforms: selectedPlatforms,
        },
        posting: {
          schedule,
          timezone,
          crossPost: [] as Platform[],
        },
        revenuecat: {
          enabled: revenuecatEnabled,
          projectId: revenuecatProjectId,
        },
      };

      if (existingProfileId) {
        await marketingApi.profile.updateProfile(existingProfileId, profileData);
        toast.success('Marketing profile updated!');
      } else {
        const id = await marketingApi.profile.createProfile(profileData);
        setExistingProfileId(id);
        toast.success('Marketing profile created!');
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const updateScheduleTime = (index: number, value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index] = value;
    setSchedule(newSchedule);
  };

  const addScheduleSlot = () => {
    setSchedule([...schedule, '12:00']);
  };

  const removeScheduleSlot = (index: number) => {
    if (schedule.length > 1) {
      setSchedule(schedule.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
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
                  <h1 className="text-2xl font-bold flex items-center gap-3">
                    <Settings size={24} className="text-primary-400" />
                    Marketing Settings
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Configure your automated marketing pipeline
                  </p>
                </div>
              </div>
              <Button
                icon={<Save size={18} />}
                isLoading={saving}
                onClick={handleSave}
              >
                Save
              </Button>
            </div>

            <div className="space-y-8">
              {/* Business Profile */}
              <Card>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Shield size={20} className="text-primary-400" />
                  Business Profile
                </h2>

                <div className="space-y-4">
                  <Input
                    label="App / Business Name"
                    placeholder="Your app or business name"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    required
                  />
                  <Textarea
                    label="Description"
                    placeholder="What does your business/app do?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Target Audience"
                      placeholder="e.g., Young professionals aged 25-35"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                    />
                    <Select
                      label="Category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Textarea
                    label="Problem Solved"
                    placeholder="What pain point does your product solve?"
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    rows={2}
                  />
                  <Input
                    label="Competitive Differentiator"
                    placeholder="What makes you unique?"
                    value={differentiator}
                    onChange={(e) => setDifferentiator(e.target.value)}
                  />
                  <Input
                    label="Website / App Store URL"
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
              </Card>

              {/* Image Generation */}
              <Card>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <ImageIcon size={20} className="text-emerald-400" />
                  Image Generation
                </h2>

                <div className="space-y-4">
                  <Select
                    label="Provider"
                    value={imageProvider}
                    onChange={(e) => setImageProvider(e.target.value)}
                  >
                    <option value="openai">OpenAI (gpt-image-1.5 — Recommended)</option>
                    <option value="stability">Stability AI (Stable Diffusion XL)</option>
                    <option value="replicate">Replicate (Open Source Models)</option>
                    <option value="local">Local Images (No API)</option>
                  </Select>

                  {imageProvider !== 'local' && (
                    <Input
                      label="Model"
                      placeholder="gpt-image-1.5"
                      value={imageModel}
                      onChange={(e) => setImageModel(e.target.value)}
                      helper={
                        imageProvider === 'openai'
                          ? 'Always use "gpt-image-1.5" — massive quality difference vs older models.'
                          : undefined
                      }
                    />
                  )}

                  <Textarea
                    label="Base Prompt Template"
                    placeholder='iPhone photo of a cozy modern living room with natural lighting, hardwood floors, white walls, large window on the left...'
                    value={basePrompt}
                    onChange={(e) => setBasePrompt(e.target.value)}
                    rows={4}
                    helper='Include "iPhone photo" and "realistic lighting". Lock architectural details for consistency across all 6 slides.'
                  />
                </div>
              </Card>

              {/* Upload-Post */}
              <Card>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Send size={20} className="text-blue-400" />
                  Upload-Post Connection
                </h2>

                <div className="space-y-4">
                  <Input
                    label="API Key"
                    type="password"
                    placeholder="Your Upload-Post API key"
                    value={uploadPostApiKey}
                    onChange={(e) => setUploadPostApiKey(e.target.value)}
                    helper="Get your API key from upload-post.com dashboard"
                  />
                  <Input
                    label="Profile Username"
                    placeholder="your_profile_name"
                    value={uploadPostProfile}
                    onChange={(e) => setUploadPostProfile(e.target.value)}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Connected Platforms
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(
                        Object.entries(PLATFORM_LABELS) as [Platform, string][]
                      ).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => togglePlatform(key)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            selectedPlatforms.includes(key)
                              ? 'bg-primary-600/20 text-primary-300 border border-primary-600/50'
                              : 'text-gray-400 bg-dark-800/50 border border-primary-700/20'
                          }`}
                        >
                          {selectedPlatforms.includes(key) ? (
                            <CheckCircle size={14} />
                          ) : (
                            <AlertCircle size={14} />
                          )}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Posting Schedule */}
              <Card>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Clock size={20} className="text-amber-400" />
                  Posting Schedule
                </h2>

                <div className="space-y-4">
                  <Input
                    label="Timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    helper="Auto-detected from your browser"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Post Times (minimum 3x daily recommended)
                    </label>
                    <div className="space-y-2">
                      {schedule.map((time, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={time}
                            onChange={(e) =>
                              updateScheduleTime(idx, e.target.value)
                            }
                            containerClassName="flex-1"
                          />
                          <span className="text-xs text-gray-500 w-24">
                            {idx === 0
                              ? 'Morning'
                              : idx === 1
                              ? 'Afternoon'
                              : idx === 2
                              ? 'Evening'
                              : `Slot ${idx + 1}`}
                          </span>
                          {schedule.length > 1 && (
                            <button
                              onClick={() => removeScheduleSlot(idx)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={addScheduleSlot}
                    >
                      + Add Time Slot
                    </Button>
                  </div>
                </div>
              </Card>

              {/* RevenueCat */}
              <Card>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <BarChart3 size={20} className="text-gold-400" />
                  RevenueCat Integration (Optional)
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  Connect RevenueCat to track the full funnel: impressions to paying users. Without this, optimization is limited to engagement metrics.
                </p>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={revenuecatEnabled}
                      onChange={(e) => setRevenuecatEnabled(e.target.checked)}
                      className="w-4 h-4 rounded border-primary-700/30 bg-dark-800/50 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium">
                      Enable RevenueCat conversion tracking
                    </span>
                  </label>

                  {revenuecatEnabled && (
                    <Input
                      label="RevenueCat Project ID"
                      placeholder="proj_..."
                      value={revenuecatProjectId}
                      onChange={(e) => setRevenuecatProjectId(e.target.value)}
                      helper="V2 secret API key starts with sk_. Set it as an environment variable for security."
                    />
                  )}
                </div>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  size="lg"
                  icon={<Save size={20} />}
                  isLoading={saving}
                  onClick={handleSave}
                >
                  {existingProfileId ? 'Update Profile' : 'Create Profile'}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
