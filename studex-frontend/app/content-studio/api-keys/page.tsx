'use client';

import { useEffect, useState } from 'react';
import { AI_PROVIDERS } from '@/lib/content-studio/providers';
import {
  getStoredKeys,
  saveKey,
  removeKey,
  maskKey,
} from '@/lib/content-studio/api-key-store';
import { ApiKeyConfig, AiProvider, ProviderInfo } from '@/lib/content-studio/types';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyConfig[]>([]);
  const [editingProvider, setEditingProvider] = useState<AiProvider | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [secretInput, setSecretInput] = useState('');
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  useEffect(() => {
    setKeys(getStoredKeys());
  }, []);

  const refreshKeys = () => setKeys(getStoredKeys());

  const handleSaveKey = (provider: ProviderInfo) => {
    if (!keyInput.trim()) return;

    const config: ApiKeyConfig = {
      id: `${provider.id}-${Date.now()}`,
      provider: provider.id,
      name: provider.name,
      apiKey: keyInput.trim(),
      apiSecret: secretInput.trim() || undefined,
      isActive: true,
      addedAt: new Date().toISOString(),
    };

    // Deactivate any existing key for this provider
    const existing = keys.filter((k) => k.provider === provider.id);
    existing.forEach((k) => {
      saveKey({ ...k, isActive: false });
    });

    saveKey(config);
    refreshKeys();
    setEditingProvider(null);
    setKeyInput('');
    setSecretInput('');
    setShowSuccess(provider.id);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleRemoveKey = (id: string) => {
    removeKey(id);
    refreshKeys();
  };

  const getActiveKey = (providerId: string) =>
    keys.find((k) => k.provider === providerId && k.isActive);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">API Key Management</h2>
        <p className="mt-1 text-primary-300">
          Paste your API keys below. Keys are stored securely in your browser&apos;s
          local storage and never sent to our servers.
        </p>
      </div>

      {/* Security Notice */}
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <p className="font-semibold text-blue-300">Your keys are safe</p>
            <p className="text-sm text-blue-200/80">
              All API keys are stored locally in your browser only. They are used
              directly from your browser to call the provider APIs. We never store
              or transmit your keys to any server.
            </p>
          </div>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="space-y-4">
        {AI_PROVIDERS.map((provider) => {
          const activeKey = getActiveKey(provider.id);
          const isEditing = editingProvider === provider.id;

          return (
            <div
              key={provider.id}
              className="rounded-xl border border-primary-700/50 bg-primary-900/50 overflow-hidden"
            >
              {/* Provider Header */}
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{provider.logo}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {provider.name}
                    </h3>
                    <p className="text-sm text-primary-400">
                      {provider.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {provider.features.slice(0, 4).map((f) => (
                        <span
                          key={f}
                          className="rounded-full bg-primary-800 px-2.5 py-0.5 text-xs text-primary-300"
                        >
                          {f}
                        </span>
                      ))}
                      {provider.features.length > 4 && (
                        <span className="rounded-full bg-primary-800 px-2.5 py-0.5 text-xs text-primary-300">
                          +{provider.features.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  {activeKey ? (
                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400">
                      Connected
                    </span>
                  ) : (
                    <span className="rounded-full bg-primary-800 px-3 py-1 text-sm text-primary-400">
                      Not connected
                    </span>
                  )}
                </div>
              </div>

              {/* Active Key Display */}
              {activeKey && !isEditing && (
                <div className="border-t border-primary-700/30 bg-primary-900/30 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary-400">Active API Key</p>
                      <p className="mt-1 font-mono text-sm text-primary-200">
                        {maskKey(activeKey.apiKey)}
                      </p>
                      {activeKey.apiSecret && (
                        <>
                          <p className="mt-2 text-sm text-primary-400">API Secret</p>
                          <p className="mt-1 font-mono text-sm text-primary-200">
                            {maskKey(activeKey.apiSecret)}
                          </p>
                        </>
                      )}
                      <p className="mt-2 text-xs text-primary-500">
                        Added {new Date(activeKey.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingProvider(provider.id);
                          setKeyInput(activeKey.apiKey);
                          setSecretInput(activeKey.apiSecret || '');
                        }}
                        className="rounded-lg border border-primary-600 px-4 py-2 text-sm text-primary-300 transition hover:bg-primary-700"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleRemoveKey(activeKey.id)}
                        className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add/Edit Key Form */}
              {(isEditing || !activeKey) && (
                <div className="border-t border-primary-700/30 bg-primary-900/30 px-6 py-4">
                  {showSuccess === provider.id && (
                    <div className="mb-4 rounded-lg bg-green-500/20 p-3 text-sm text-green-300">
                      API key saved successfully!
                    </div>
                  )}

                  {!isEditing && !activeKey && (
                    <button
                      onClick={() => setEditingProvider(provider.id)}
                      className="w-full rounded-lg border-2 border-dashed border-primary-600 py-4 text-sm font-medium text-primary-300 transition hover:border-gold-500 hover:text-gold-400"
                    >
                      + Click to add your {provider.name} API key
                    </button>
                  )}

                  {isEditing && (
                    <div className="space-y-4">
                      {/* Where to find key */}
                      <div className="rounded-lg bg-primary-800/50 p-3">
                        <p className="text-sm font-medium text-primary-200">
                          Where to find your API key:
                        </p>
                        <a
                          href={provider.apiKeyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-sm text-gold-400 underline hover:text-gold-300"
                        >
                          {provider.apiKeyUrl} &rarr;
                        </a>
                        <p className="mt-1 text-xs text-primary-400">
                          Log in to your account, go to Settings or Developer section,
                          and copy your API key.
                        </p>
                      </div>

                      {/* API Key Input */}
                      <div>
                        <label className="block text-sm font-medium text-primary-200">
                          API Key
                        </label>
                        <input
                          type="text"
                          value={keyInput}
                          onChange={(e) => setKeyInput(e.target.value)}
                          placeholder="Paste your API key here..."
                          className="mt-1 w-full rounded-lg border border-primary-600 bg-primary-800 px-4 py-3 font-mono text-sm text-white placeholder-primary-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                        />
                      </div>

                      {/* API Secret Input (if applicable) */}
                      {provider.hasSecret && (
                        <div>
                          <label className="block text-sm font-medium text-primary-200">
                            API Secret{' '}
                            <span className="text-primary-500">(optional)</span>
                          </label>
                          <input
                            type="text"
                            value={secretInput}
                            onChange={(e) => setSecretInput(e.target.value)}
                            placeholder="Paste your API secret here..."
                            className="mt-1 w-full rounded-lg border border-primary-600 bg-primary-800 px-4 py-3 font-mono text-sm text-white placeholder-primary-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                          />
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleSaveKey(provider)}
                          disabled={!keyInput.trim()}
                          className="rounded-lg bg-gold-500 px-6 py-2.5 text-sm font-semibold text-primary-950 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Save API Key
                        </button>
                        <button
                          onClick={() => {
                            setEditingProvider(null);
                            setKeyInput('');
                            setSecretInput('');
                          }}
                          className="rounded-lg border border-primary-600 px-6 py-2.5 text-sm text-primary-300 transition hover:bg-primary-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Provider */}
      <div className="rounded-xl border border-dashed border-primary-600 bg-primary-900/30 p-6 text-center">
        <p className="text-primary-300">
          Need to add a different AI provider? More integrations coming soon.
        </p>
        <p className="mt-1 text-sm text-primary-500">
          Contact us to request a new provider integration.
        </p>
      </div>
    </div>
  );
}
