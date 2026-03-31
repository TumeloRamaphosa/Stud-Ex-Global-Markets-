'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { AI_PROVIDERS } from '@/lib/content-studio/providers';
import { CAMERA_PRESETS, getPresetsForProvider } from '@/lib/content-studio/camera-presets';
import { RESOLUTION_PRESETS, getResolutionsForProvider } from '@/lib/content-studio/resolutions';
import { getStoredKeys, getKeyForProvider } from '@/lib/content-studio/api-key-store';
import { getGuideForMode } from '@/lib/content-studio/guides';
import {
  AiProvider,
  GenerationMode,
  CameraCategory,
  GenerationRequest,
  ApiKeyConfig,
} from '@/lib/content-studio/types';
import Link from 'next/link';
import SaveToDrive from './save-to-drive';

const GENERATION_MODES: { id: GenerationMode; label: string; icon: string; providers: AiProvider[] }[] = [
  { id: 'text-to-video', label: 'Text to Video', icon: '🎬', providers: ['higgsfield', 'kling', 'runway', 'pika', 'luma'] },
  { id: 'image-to-video', label: 'Image to Video', icon: '🖼️', providers: ['higgsfield', 'kling', 'runway', 'pika', 'luma'] },
  { id: 'text-to-image', label: 'Text to Image', icon: '🎨', providers: ['higgsfield'] },
  { id: 'soul-mode', label: 'Soul Mode (Realistic)', icon: '🧑', providers: ['higgsfield'] },
  { id: 'video-extend', label: 'Video Extend', icon: '⏩', providers: ['kling'] },
];

const CAMERA_CATEGORIES: { id: CameraCategory; label: string }[] = [
  { id: 'dolly', label: 'Dolly' },
  { id: 'crane', label: 'Crane' },
  { id: 'orbit', label: 'Orbit' },
  { id: 'zoom', label: 'Zoom' },
  { id: 'pan', label: 'Pan/Tilt' },
  { id: 'fpv', label: 'FPV' },
  { id: 'static', label: 'Static' },
  { id: 'special', label: 'Special' },
];

const HIGGSFIELD_MODELS = [
  { id: 'dop-turbo', label: 'DOP Turbo (Best Quality)' },
  { id: 'dop-preview', label: 'DOP Preview (Balanced)' },
  { id: 'dop-lite', label: 'DOP Lite (Fast)' },
];

const KLING_MODELS = [
  { id: 'kling-3.0', label: 'Kling 3.0 (Latest, 4K)' },
  { id: 'kling-3.0-omni', label: 'Kling 3.0 Omni (Video Ref)' },
  { id: 'kling-2.6-pro', label: 'Kling 2.6 Pro (Cinematic)' },
  { id: 'kling-2.5-turbo', label: 'Kling 2.5 Turbo (Fast)' },
];

const SOUL_STYLES = [
  'Realistic', 'Fashion Editorial', 'Cinematic Portrait', 'Street Photography',
  'Studio Glamour', 'Natural Light', 'Film Noir', 'Vintage', 'High Fashion',
  'Documentary', 'Sports', 'Lifestyle', 'Beauty', 'Commercial',
];

export default function GeneratePage() {
  const [keys, setKeys] = useState<ApiKeyConfig[]>([]);
  const [provider, setProvider] = useState<AiProvider>('higgsfield');
  const [mode, setMode] = useState<GenerationMode>('text-to-video');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [resolution, setResolution] = useState('1080p');
  const [cameraPreset, setCameraPreset] = useState('');
  const [cameraCategory, setCameraCategory] = useState<CameraCategory>('dolly');
  const [duration, setDuration] = useState(5);
  const [motionStrength, setMotionStrength] = useState(0.5);
  const [seed, setSeed] = useState<number | ''>('');
  const [model, setModel] = useState('dop-turbo');
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [cameraFixed, setCameraFixed] = useState(false);
  const [quality, setQuality] = useState<'medium' | 'high' | 'ultra'>('high');
  const [styleId, setStyleId] = useState('Realistic');
  const [styleStrength, setStyleStrength] = useState(0.8);
  const [enableAudio, setEnableAudio] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    setKeys(getStoredKeys());
  }, []);

  const hasKey = keys.some((k) => k.provider === provider && k.isActive);
  const providerPresets = getPresetsForProvider(provider);
  const filteredPresets = providerPresets.filter((p) => p.category === cameraCategory);
  const providerResolutions = getResolutionsForProvider(provider);
  const guide = getGuideForMode(provider, mode);
  const availableModes = GENERATION_MODES.filter((m) => m.providers.includes(provider));
  const models = provider === 'higgsfield' ? HIGGSFIELD_MODELS : provider === 'kling' ? KLING_MODELS : [];

  const handleGenerate = async () => {
    if (!prompt.trim() || !hasKey) return;

    const request: GenerationRequest = {
      provider,
      mode,
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      resolution,
      aspectRatio: providerResolutions.find((r) => r.id === resolution)?.aspectRatio || '16:9',
      duration: mode.includes('video') ? duration : undefined,
      cameraPreset: cameraPreset || undefined,
      cameraFixed,
      seed: seed || undefined,
      motionStrength,
      styleId: mode === 'soul-mode' ? styleId : undefined,
      styleStrength: mode === 'soul-mode' ? styleStrength : undefined,
      enhancePrompt,
      model,
      quality,
    };

    // Build the full prompt with camera preset
    let fullPrompt = request.prompt;
    if (cameraPreset) {
      const preset = CAMERA_PRESETS.find((p) => p.id === cameraPreset);
      if (preset) {
        fullPrompt = `${fullPrompt}, ${preset.promptTag}`;
      }
    }

    setGenerating(true);
    setResult(null);

    // Simulate API call (replace with real API integration)
    try {
      const apiKey = getKeyForProvider(provider);
      if (!apiKey) throw new Error('No API key found');

      // Build the API request payload
      const payload = {
        ...request,
        prompt: fullPrompt,
        apiKey: apiKey.apiKey,
        apiSecret: apiKey.apiSecret,
      };

      setResult(
        `Request ready to send to ${provider} API:\n\n` +
        `Provider: ${provider}\n` +
        `Mode: ${mode}\n` +
        `Model: ${model}\n` +
        `Prompt: ${fullPrompt}\n` +
        `Resolution: ${resolution}\n` +
        `Duration: ${duration}s\n` +
        `Camera: ${cameraPreset || 'None'}\n` +
        `Motion Strength: ${motionStrength}\n` +
        `Enhance Prompt: ${enhancePrompt}\n` +
        `Seed: ${seed || 'Random'}\n` +
        (mode === 'soul-mode' ? `Style: ${styleId} (${styleStrength})\n` : '') +
        (enableAudio ? 'Audio: Enabled\n' : '') +
        `\nAPI Key: ${apiKey.apiKey.slice(0, 8)}...`
      );
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Generate Content</h2>
          <p className="text-sm text-primary-300">
            Configure your settings and create stunning AI content
          </p>
        </div>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="rounded-lg border border-primary-600 px-4 py-2 text-sm text-primary-300 transition hover:bg-primary-700"
        >
          {showGuide ? 'Hide Guide' : 'Show Guide'}
        </button>
      </div>

      {/* No API Key Warning */}
      {!hasKey && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <p className="text-yellow-300">
            No API key configured for {AI_PROVIDERS.find((p) => p.id === provider)?.name}.{' '}
            <Link href="/content-studio/api-keys" className="font-semibold text-gold-400 underline">
              Add one now
            </Link>
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Settings */}
        <div className="space-y-6 lg:col-span-2">
          {/* Provider Selection */}
          <div className="rounded-xl border border-primary-700/50 bg-primary-900/50 p-6">
            <h3 className="mb-3 font-semibold text-white">AI Provider</h3>
            <div className="flex flex-wrap gap-2">
              {AI_PROVIDERS.map((p) => {
                const connected = keys.some((k) => k.provider === p.id && k.isActive);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setProvider(p.id);
                      setCameraPreset('');
                      setMode(GENERATION_MODES.find((m) => m.providers.includes(p.id))?.id || 'text-to-video');
                      setModel(p.id === 'higgsfield' ? 'dop-turbo' : p.id === 'kling' ? 'kling-3.0' : '');
                    }}
                    className={clsx(
                      'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition',
                      provider === p.id
                        ? 'bg-gold-500 text-primary-950 shadow-glow-gold'
                        : connected
                          ? 'border border-green-500/30 bg-green-500/10 text-green-300 hover:bg-green-500/20'
                          : 'border border-primary-600 text-primary-400 hover:bg-primary-800'
                    )}
                  >
                    <span>{p.logo}</span>
                    {p.name}
                    {connected && provider !== p.id && (
                      <span className="h-2 w-2 rounded-full bg-green-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generation Mode */}
          <div className="rounded-xl border border-primary-700/50 bg-primary-900/50 p-6">
            <h3 className="mb-3 font-semibold text-white">Generation Mode</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {availableModes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={clsx(
                    'rounded-lg px-4 py-3 text-sm font-medium transition',
                    mode === m.id
                      ? 'bg-gold-500 text-primary-950'
                      : 'border border-primary-600 text-primary-300 hover:bg-primary-800'
                  )}
                >
                  <span className="mr-2">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          {models.length > 0 && (
            <div className="rounded-xl border border-primary-700/50 bg-primary-900/50 p-6">
              <h3 className="mb-3 font-semibold text-white">Model</h3>
              <div className="grid grid-cols-2 gap-2">
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    className={clsx(
                      'rounded-lg px-4 py-3 text-left text-sm transition',
                      model === m.id
                        ? 'bg-primary-700 text-white ring-1 ring-gold-500'
                        : 'border border-primary-600 text-primary-300 hover:bg-primary-800'
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prompt */}
          <div className="rounded-xl border border-primary-700/50 bg-primary-900/50 p-6">
            <h3 className="mb-3 font-semibold text-white">Prompt</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder="Describe your content in detail... Include subject, action, environment, mood, lighting, and camera direction."
              className="w-full rounded-lg border border-primary-600 bg-primary-800 px-4 py-3 text-sm text-white placeholder-primary-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-primary-500">
                {prompt.length} characters | {prompt.split(/\s+/).filter(Boolean).length} words
              </p>
              <label className="flex items-center gap-2 text-sm text-primary-300">
                <input
                  type="checkbox"
                  checked={enhancePrompt}
                  onChange={(e) => setEnhancePrompt(e.target.checked)}
                  className="rounded border-primary-600"
                />
                AI Enhance Prompt
              </label>
            </div>

            {/* Negative Prompt */}
            {provider === 'kling' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-primary-300">
                  Negative Prompt
                </label>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="blurry, distorted, low quality, watermark..."
                  className="mt-1 w-full rounded-lg border border-primary-600 bg-primary-800 px-4 py-2.5 text-sm text-white placeholder-primary-500 focus:border-gold-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Camera Presets */}
          {mode.includes('video') && (
            <div className="rounded-xl border border-primary-700/50 bg-primary-900/50 p-6">
              <h3 className="mb-3 font-semibold text-white">Camera Movement</h3>

              {/* Category Tabs */}
              <div className="mb-4 flex flex-wrap gap-1.5">
                {CAMERA_CATEGORIES.map((cat) => {
                  const count = providerPresets.filter((p) => p.category === cat.id).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCameraCategory(cat.id)}
                      className={clsx(
                        'rounded-lg px-3 py-1.5 text-xs font-medium transition',
                        cameraCategory === cat.id
                          ? 'bg-gold-500/20 text-gold-400'
                          : 'text-primary-400 hover:bg-primary-800'
                      )}
                    >
                      {cat.label} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Preset Grid */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <button
                  onClick={() => setCameraPreset('')}
                  className={clsx(
                    'rounded-lg p-3 text-left text-sm transition',
                    !cameraPreset
                      ? 'bg-primary-700 text-white ring-1 ring-gold-500'
                      : 'border border-primary-600 text-primary-400 hover:bg-primary-800'
                  )}
                >
                  <p className="font-medium">None</p>
                  <p className="text-xs opacity-70">No camera movement</p>
                </button>
                {filteredPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setCameraPreset(preset.id)}
                    className={clsx(
                      'rounded-lg p-3 text-left text-sm transition',
                      cameraPreset === preset.id
                        ? 'bg-primary-700 text-white ring-1 ring-gold-500'
                        : 'border border-primary-600 text-primary-400 hover:bg-primary-800'
                    )}
                  >
                    <p className="font-medium">{preset.name}</p>
                    <p className="text-xs opacity-70">{preset.description}</p>
                  </button>
                ))}
              </div>

              {/* Camera Fixed Toggle (Higgsfield I2V) */}
              {provider === 'higgsfield' && mode === 'image-to-video' && (
                <label className="mt-4 flex items-center gap-2 text-sm text-primary-300">
                  <input
                    type="checkbox"
                    checked={cameraFixed}
                    onChange={(e) => setCameraFixed(e.target.checked)}
                    className="rounded border-primary-600"
                  />
                  Camera Fixed (only subject moves, camera stays static)
                </label>
              )}

              {/* Motion Strength */}
              <div className="mt-4">
                <label className="block text-sm text-primary-300">
                  Motion Strength: {motionStrength.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={motionStrength}
                  onChange={(e) => setMotionStrength(parseFloat(e.target.value))}
                  className="mt-1 w-full"
                />
                <div className="flex justify-between text-xs text-primary-500">
                  <span>Subtle</span>
                  <span>Moderate</span>
                  <span>Dramatic</span>
                </div>
              </div>
            </div>
          )}

          {/* Resolution & Format */}
          <div className="rounded-xl border border-primary-700/50 bg-primary-900/50 p-6">
            <h3 className="mb-3 font-semibold text-white">Resolution & Format</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {providerResolutions.map((res) => (
                <button
                  key={res.id}
                  onClick={() => setResolution(res.id)}
                  className={clsx(
                    'rounded-lg p-3 text-left text-sm transition',
                    resolution === res.id
                      ? 'bg-primary-700 text-white ring-1 ring-gold-500'
                      : 'border border-primary-600 text-primary-400 hover:bg-primary-800'
                  )}
                >
                  <p className="font-medium">{res.label}</p>
                  <p className="text-xs opacity-70">
                    {res.width}x{res.height} ({res.aspectRatio})
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Duration (Video modes) */}
          {mode.includes('video') && (
            <div className="rounded-xl border border-primary-700/50 bg-primary-900/50 p-6">
              <h3 className="mb-3 font-semibold text-white">Duration</h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={3}
                  max={provider === 'kling' ? 15 : 10}
                  step={1}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="min-w-[3rem] text-right text-lg font-semibold text-white">
                  {duration}s
                </span>
              </div>
              <div className="mt-1 flex justify-between text-xs text-primary-500">
                <span>3s</span>
                <span>{provider === 'kling' ? '15s' : '10s'}</span>
              </div>
              {provider === 'kling' && (
                <label className="mt-3 flex items-center gap-2 text-sm text-primary-300">
                  <input
                    type="checkbox"
                    checked={enableAudio}
                    onChange={(e) => setEnableAudio(e.target.checked)}
                    className="rounded border-primary-600"
                  />
                  Enable built-in audio generation
                </label>
              )}
            </div>
          )}

          {/* Soul Mode Settings */}
          {mode === 'soul-mode' && (
            <div className="rounded-xl border border-primary-700/50 bg-primary-900/50 p-6">
              <h3 className="mb-3 font-semibold text-white">Soul Mode Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300">
                    Visual Style
                  </label>
                  <select
                    value={styleId}
                    onChange={(e) => setStyleId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-primary-600 bg-primary-800 px-4 py-2.5 text-sm text-white focus:border-gold-500 focus:outline-none"
                  >
                    {SOUL_STYLES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-primary-300">
                    Style Strength: {styleStrength.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={styleStrength}
                    onChange={(e) => setStyleStrength(parseFloat(e.target.value))}
                    className="mt-1 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-300">
                    Quality
                  </label>
                  <div className="mt-1 flex gap-2">
                    {(['medium', 'high'] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        className={clsx(
                          'rounded-lg px-4 py-2 text-sm capitalize transition',
                          quality === q
                            ? 'bg-gold-500 text-primary-950'
                            : 'border border-primary-600 text-primary-300 hover:bg-primary-800'
                        )}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          <div className="rounded-xl border border-primary-700/50 bg-primary-900/50 p-6">
            <h3 className="mb-3 font-semibold text-white">Advanced Settings</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-primary-300">
                  Seed (for reproducible results)
                </label>
                <input
                  type="number"
                  value={seed}
                  onChange={(e) =>
                    setSeed(e.target.value ? parseInt(e.target.value) : '')
                  }
                  placeholder="Random"
                  min={1}
                  max={1000000}
                  className="mt-1 w-full rounded-lg border border-primary-600 bg-primary-800 px-4 py-2.5 text-sm text-white placeholder-primary-500 focus:border-gold-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || !hasKey || generating}
            className="w-full rounded-xl bg-gradient-accent py-4 text-lg font-bold text-primary-950 shadow-glow-gold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Content'}
          </button>

          {/* Result */}
          {result && (
            <div className="rounded-xl border border-primary-700/50 bg-primary-900/50 p-6">
              <h3 className="mb-3 font-semibold text-white">Generation Result</h3>
              <pre className="whitespace-pre-wrap rounded-lg bg-primary-800 p-4 text-sm text-primary-200">
                {result}
              </pre>
            </div>
          )}

          {/* Save to Google Drive */}
          <SaveToDrive
            fileUrl={undefined /* will be populated when real API returns a URL */}
            fileName={`ai-content-${provider}-${mode}-${Date.now()}.${mode.includes('video') ? 'mp4' : 'png'}`}
            mimeType={mode.includes('video') ? 'video/mp4' : 'image/png'}
          />
        </div>

        {/* Right Column: Guide Panel */}
        <div className={clsx('space-y-4', !showGuide && 'hidden lg:block')}>
          {guide ? (
            <div className="sticky top-4 rounded-xl border border-primary-700/50 bg-primary-900/50 p-6">
              <h3 className="text-lg font-semibold text-gold-400">
                {guide.title}
              </h3>
              <div className="mt-3 whitespace-pre-line text-sm text-primary-300">
                {guide.content}
              </div>

              {/* Tips */}
              <div className="mt-6">
                <h4 className="font-semibold text-white">Pro Tips</h4>
                <ul className="mt-2 space-y-2">
                  {guide.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-primary-300">
                      <span className="text-gold-400">*</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Example Prompts */}
              <div className="mt-6">
                <h4 className="font-semibold text-white">Example Prompts</h4>
                <div className="mt-2 space-y-2">
                  {guide.examplePrompts.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(ex)}
                      className="block w-full rounded-lg bg-primary-800/50 p-3 text-left text-xs text-primary-300 transition hover:bg-primary-700 hover:text-white"
                    >
                      <span className="text-gold-400">Click to use:</span> {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-primary-700/50 bg-primary-900/50 p-6 text-center">
              <p className="text-primary-400">
                Select a provider and mode to see the guide.
              </p>
              <Link
                href="/content-studio/guides"
                className="mt-2 inline-block text-sm text-gold-400 hover:text-gold-300"
              >
                View all guides &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
