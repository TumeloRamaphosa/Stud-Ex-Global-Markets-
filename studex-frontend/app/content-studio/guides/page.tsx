'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { GUIDES } from '@/lib/content-studio/guides';
import { AI_PROVIDERS, getProvider } from '@/lib/content-studio/providers';
import { CAMERA_PRESETS } from '@/lib/content-studio/camera-presets';
import { RESOLUTION_PRESETS } from '@/lib/content-studio/resolutions';
import { AiProvider } from '@/lib/content-studio/types';
import Link from 'next/link';

type Tab = 'guides' | 'cameras' | 'resolutions' | 'prompts';

export default function GuidesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('guides');
  const [selectedProvider, setSelectedProvider] = useState<AiProvider | 'all'>('all');
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  const filteredGuides =
    selectedProvider === 'all'
      ? GUIDES
      : GUIDES.filter((g) => g.provider === selectedProvider);

  const filteredCameras =
    selectedProvider === 'all'
      ? CAMERA_PRESETS
      : CAMERA_PRESETS.filter((c) => c.provider === selectedProvider);

  const filteredResolutions =
    selectedProvider === 'all'
      ? RESOLUTION_PRESETS
      : RESOLUTION_PRESETS.filter((r) =>
          r.providers.includes(selectedProvider as AiProvider)
        );

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'guides', label: 'Generation Guides', count: filteredGuides.length },
    { id: 'cameras', label: 'Camera Presets', count: filteredCameras.length },
    { id: 'resolutions', label: 'Resolutions', count: filteredResolutions.length },
    { id: 'prompts', label: 'Prompt Writing Guide', count: 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Guides & Reference</h2>
        <p className="text-sm text-primary-300">
          Everything you need to create incredible AI content
        </p>
      </div>

      {/* Provider Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedProvider('all')}
          className={clsx(
            'rounded-lg px-4 py-2 text-sm font-medium transition',
            selectedProvider === 'all'
              ? 'bg-gold-500 text-primary-950'
              : 'border border-primary-600 text-primary-300 hover:bg-primary-800'
          )}
        >
          All Providers
        </button>
        {AI_PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProvider(p.id)}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
              selectedProvider === p.id
                ? 'bg-gold-500 text-primary-950'
                : 'border border-primary-600 text-primary-300 hover:bg-primary-800'
            )}
          >
            <span>{p.logo}</span>
            {p.name}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-primary-700/30 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition',
              activeTab === tab.id
                ? 'border-gold-500 text-gold-400'
                : 'border-transparent text-primary-400 hover:text-primary-200'
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 rounded-full bg-primary-800 px-2 py-0.5 text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Guides Tab */}
      {activeTab === 'guides' && (
        <div className="space-y-4">
          {filteredGuides.map((guide) => {
            const provider = getProvider(guide.provider);
            const isExpanded = expandedGuide === guide.id;
            return (
              <div
                key={guide.id}
                className="rounded-xl border border-primary-700/50 bg-primary-900/50 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedGuide(isExpanded ? null : guide.id)
                  }
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{provider?.logo}</span>
                    <div>
                      <h3 className="font-semibold text-white">{guide.title}</h3>
                      <p className="text-sm text-primary-400">
                        {provider?.name} &middot; {guide.mode}
                      </p>
                    </div>
                  </div>
                  <span className="text-primary-400">
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t border-primary-700/30 p-6">
                    <div className="whitespace-pre-line text-sm text-primary-300">
                      {guide.content}
                    </div>

                    <div className="mt-6">
                      <h4 className="font-semibold text-gold-400">Pro Tips</h4>
                      <ul className="mt-2 space-y-2">
                        {guide.tips.map((tip, i) => (
                          <li
                            key={i}
                            className="flex gap-2 text-sm text-primary-300"
                          >
                            <span className="text-gold-400">*</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-semibold text-gold-400">
                        Example Prompts
                      </h4>
                      <div className="mt-2 space-y-2">
                        {guide.examplePrompts.map((ex, i) => (
                          <div
                            key={i}
                            className="rounded-lg bg-primary-800/50 p-3 text-sm text-primary-300"
                          >
                            {ex}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link
                      href="/content-studio/generate"
                      className="mt-4 inline-block rounded-lg bg-gold-500 px-6 py-2.5 text-sm font-semibold text-primary-950 transition hover:bg-gold-400"
                    >
                      Try it now &rarr;
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Camera Presets Tab */}
      {activeTab === 'cameras' && (
        <div>
          <p className="mb-4 text-sm text-primary-300">
            Camera presets add cinematic motion to your AI-generated videos. Select a
            preset during generation and it will be integrated into your prompt
            automatically.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCameras.map((preset) => {
              const provider = getProvider(preset.provider);
              return (
                <div
                  key={preset.id}
                  className="rounded-xl border border-primary-700/50 bg-primary-900/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">{preset.name}</h4>
                    <span className="rounded-full bg-primary-800 px-2 py-0.5 text-xs text-primary-400">
                      {preset.category}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-primary-400">
                    {preset.description}
                  </p>
                  <div className="mt-2 rounded bg-primary-800/50 p-2">
                    <p className="font-mono text-xs text-primary-500">
                      Prompt tag: &quot;{preset.promptTag}&quot;
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-primary-500">
                    {provider?.logo} {provider?.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resolutions Tab */}
      {activeTab === 'resolutions' && (
        <div>
          <p className="mb-4 text-sm text-primary-300">
            Choose the right resolution for your platform and content type.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-primary-700/50 text-primary-400">
                  <th className="pb-3 pr-4 font-medium">Resolution</th>
                  <th className="pb-3 pr-4 font-medium">Dimensions</th>
                  <th className="pb-3 pr-4 font-medium">Aspect Ratio</th>
                  <th className="pb-3 pr-4 font-medium">Category</th>
                  <th className="pb-3 font-medium">Providers</th>
                </tr>
              </thead>
              <tbody>
                {filteredResolutions.map((res) => (
                  <tr
                    key={res.id}
                    className="border-b border-primary-800/50 text-primary-300"
                  >
                    <td className="py-3 pr-4 font-medium text-white">
                      {res.label}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">
                      {res.width}x{res.height}
                    </td>
                    <td className="py-3 pr-4">{res.aspectRatio}</td>
                    <td className="py-3 pr-4 capitalize">{res.category}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        {res.providers.map((p) => {
                          const prov = getProvider(p);
                          return (
                            <span key={p} title={prov?.name}>
                              {prov?.logo}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Prompt Writing Guide Tab */}
      {activeTab === 'prompts' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-primary-700/50 bg-primary-900/50 p-6">
            <h3 className="text-lg font-semibold text-gold-400">
              How to Write Great Prompts
            </h3>
            <div className="mt-4 space-y-4 text-sm text-primary-300">
              <div>
                <h4 className="font-semibold text-white">
                  1. Structure Your Prompt
                </h4>
                <p className="mt-1">
                  Follow this order for best results: <strong>Subject</strong> &rarr;{' '}
                  <strong>Action</strong> &rarr; <strong>Environment</strong> &rarr;{' '}
                  <strong>Mood/Style</strong> &rarr; <strong>Camera/Lighting</strong>
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white">2. Be Specific</h4>
                <p className="mt-1">
                  Instead of &quot;a woman walking&quot;, write &quot;a confident 25-year-old woman
                  with long dark hair, wearing a tailored blazer, walking through
                  a sunlit European street&quot;.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white">
                  3. Describe Lighting
                </h4>
                <p className="mt-1">
                  Lighting makes or breaks content. Use terms like: golden hour,
                  soft key light, neon glow, natural window light, dramatic
                  side lighting, studio three-point lighting.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white">
                  4. Include Camera Direction
                </h4>
                <p className="mt-1">
                  Add camera movement for cinematic feel: dolly in, crane up,
                  tracking shot, shallow depth of field, wide-angle lens, 85mm
                  portrait lens, aerial drone shot.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white">
                  5. Set the Mood
                </h4>
                <p className="mt-1">
                  Use mood keywords: cinematic, documentary, dreamy, energetic,
                  moody, luxury, casual, professional, editorial, vintage.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white">
                  6. Quality Modifiers
                </h4>
                <p className="mt-1">
                  Add quality boosters at the end: 4K, ultra detailed, high
                  resolution, photorealistic, film grain, color graded,
                  professional photography.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-primary-700/50 bg-primary-900/50 p-6">
            <h3 className="text-lg font-semibold text-gold-400">
              Prompt Templates for Influencer Content
            </h3>
            <div className="mt-4 space-y-4">
              {[
                {
                  label: 'Talking Head Video',
                  prompt:
                    'A [age] [gender] influencer sitting in a [environment], speaking directly to camera with [expression]. [Clothing description]. [Lighting type], [camera shot type], shallow depth of field, [mood] atmosphere, 4K quality.',
                },
                {
                  label: 'Product Showcase',
                  prompt:
                    '[Person description] holding and examining a [product], looking at the camera with [expression]. [Environment]. Soft studio lighting, medium close-up, product in focus, clean background, commercial style.',
                },
                {
                  label: 'Lifestyle/Travel',
                  prompt:
                    '[Person description] [action] in [scenic location]. [Clothing]. Golden hour lighting, cinematic [camera movement], [mood] color grading, wide establishing shot transitioning to medium, 4K cinematic quality.',
                },
                {
                  label: 'Fashion/Editorial',
                  prompt:
                    '[Person description] posing in [outfit description] against [backdrop]. [Lighting] creating [shadow/highlight effect]. [Camera angle], fashion editorial style, magazine quality, sharp focus, professional color grading.',
                },
                {
                  label: 'Fitness Content',
                  prompt:
                    '[Person description] performing [exercise/pose] in a [gym/outdoor setting]. [Clothing]. Dynamic [camera movement], energetic atmosphere, [lighting], motivational feel, high contrast, 4K ultra detailed.',
                },
              ].map((template) => (
                <div
                  key={template.label}
                  className="rounded-lg bg-primary-800/50 p-4"
                >
                  <h4 className="font-semibold text-white">{template.label}</h4>
                  <p className="mt-2 font-mono text-xs text-primary-400">
                    {template.prompt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
