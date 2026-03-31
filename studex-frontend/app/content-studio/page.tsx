'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getStoredKeys } from '@/lib/content-studio/api-key-store';
import { AI_PROVIDERS } from '@/lib/content-studio/providers';
import { ApiKeyConfig } from '@/lib/content-studio/types';

export default function ContentStudioDashboard() {
  const [keys, setKeys] = useState<ApiKeyConfig[]>([]);

  useEffect(() => {
    setKeys(getStoredKeys());
  }, []);

  const activeProviders = AI_PROVIDERS.filter((p) =>
    keys.some((k) => k.provider === p.id && k.isActive)
  );
  const inactiveProviders = AI_PROVIDERS.filter(
    (p) => !keys.some((k) => k.provider === p.id && k.isActive)
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-gold-500/20 bg-gradient-to-r from-primary-900 to-primary-800 p-8">
        <h2 className="text-3xl font-bold text-white">
          Welcome to AI Content Studio
        </h2>
        <p className="mt-2 max-w-2xl text-primary-200">
          Your all-in-one platform for creating incredible AI-generated influencer
          content. Use Higgsfield, Kling, and more to generate realistic videos
          and images with professional camera settings.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/content-studio/generate"
            className="rounded-xl bg-gold-500 px-6 py-3 font-semibold text-primary-950 shadow-glow-gold transition hover:bg-gold-400"
          >
            Start Creating
          </Link>
          <Link
            href="/content-studio/api-keys"
            className="rounded-xl border border-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
          >
            Manage API Keys
          </Link>
          <Link
            href="/content-studio/guides"
            className="rounded-xl border border-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
          >
            View Guides
          </Link>
        </div>
      </div>

      {/* Quick Start Steps */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-primary-700/50 bg-primary-900/50 p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/20 text-lg font-bold text-gold-400">
            1
          </div>
          <h3 className="font-semibold text-white">Add API Keys</h3>
          <p className="mt-1 text-sm text-primary-300">
            Paste your API keys from Higgsfield, Kling, or other providers.
            Keys are stored locally in your browser.
          </p>
          <Link
            href="/content-studio/api-keys"
            className="mt-3 inline-block text-sm font-medium text-gold-400 hover:text-gold-300"
          >
            Add Keys &rarr;
          </Link>
        </div>
        <div className="rounded-xl border border-primary-700/50 bg-primary-900/50 p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/20 text-lg font-bold text-gold-400">
            2
          </div>
          <h3 className="font-semibold text-white">Choose Your Settings</h3>
          <p className="mt-1 text-sm text-primary-300">
            Pick camera presets, resolution, aspect ratio, and generation mode.
            Use our guides for expert tips.
          </p>
          <Link
            href="/content-studio/guides"
            className="mt-3 inline-block text-sm font-medium text-gold-400 hover:text-gold-300"
          >
            Read Guides &rarr;
          </Link>
        </div>
        <div className="rounded-xl border border-primary-700/50 bg-primary-900/50 p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/20 text-lg font-bold text-gold-400">
            3
          </div>
          <h3 className="font-semibold text-white">Generate Content</h3>
          <p className="mt-1 text-sm text-primary-300">
            Write your prompt, select camera movement, and generate stunning
            videos and images with one click.
          </p>
          <Link
            href="/content-studio/generate"
            className="mt-3 inline-block text-sm font-medium text-gold-400 hover:text-gold-300"
          >
            Generate &rarr;
          </Link>
        </div>
      </div>

      {/* Provider Status */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">
          Connected Providers
        </h3>
        {activeProviders.length === 0 ? (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-center">
            <p className="text-yellow-300">
              No API keys configured yet.{' '}
              <Link
                href="/content-studio/api-keys"
                className="font-semibold text-gold-400 underline hover:text-gold-300"
              >
                Add your first API key
              </Link>{' '}
              to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center gap-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4"
              >
                <span className="text-3xl">{provider.logo}</span>
                <div>
                  <p className="font-semibold text-white">{provider.name}</p>
                  <p className="text-sm text-green-400">Connected</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Providers */}
      {inactiveProviders.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">
            Available Providers
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {inactiveProviders.map((provider) => (
              <div
                key={provider.id}
                className="rounded-xl border border-primary-700/50 bg-primary-900/30 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{provider.logo}</span>
                  <div>
                    <p className="font-semibold text-white">{provider.name}</p>
                    <p className="text-sm text-primary-400">Not connected</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-primary-400">
                  {provider.description}
                </p>
                <Link
                  href="/content-studio/api-keys"
                  className="mt-3 inline-block text-sm font-medium text-gold-400 hover:text-gold-300"
                >
                  Add API Key &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Highlights */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: '🎬', label: '50+ Camera Presets', desc: 'Dolly, Crane, Orbit, FPV & more' },
          { icon: '📐', label: '14 Resolutions', desc: '720p to 8K, all aspect ratios' },
          { icon: '🧑', label: 'Soul Mode', desc: 'Ultra-realistic AI influencers' },
          { icon: '🔊', label: 'Built-in Audio', desc: 'Native voice in 5 languages' },
        ].map((feat) => (
          <div
            key={feat.label}
            className="rounded-xl border border-primary-700/30 bg-primary-900/30 p-4 text-center"
          >
            <span className="text-3xl">{feat.icon}</span>
            <p className="mt-2 font-semibold text-white">{feat.label}</p>
            <p className="text-xs text-primary-400">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
