'use client';

import { ApiKeyConfig, AiProvider } from './types';

const STORAGE_KEY = 'studex_ai_api_keys';

export function getStoredKeys(): ApiKeyConfig[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveKey(config: ApiKeyConfig): void {
  const keys = getStoredKeys();
  const existingIndex = keys.findIndex((k) => k.id === config.id);
  if (existingIndex >= 0) {
    keys[existingIndex] = config;
  } else {
    keys.push(config);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function removeKey(id: string): void {
  const keys = getStoredKeys().filter((k) => k.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function getKeyForProvider(provider: AiProvider): ApiKeyConfig | undefined {
  return getStoredKeys().find((k) => k.provider === provider && k.isActive);
}

export function hasKeyForProvider(provider: AiProvider): boolean {
  return getStoredKeys().some((k) => k.provider === provider && k.isActive);
}

export function maskKey(key: string): string {
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 4) + '••••••••' + key.slice(-4);
}
