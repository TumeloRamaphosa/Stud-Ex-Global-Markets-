// ============================================
// AI Content Generation Platform - Type Definitions
// ============================================

// --- API Key Management ---
export interface ApiKeyConfig {
  id: string;
  provider: AiProvider;
  name: string;
  apiKey: string;
  apiSecret?: string;
  isActive: boolean;
  addedAt: string;
}

export type AiProvider =
  | 'higgsfield'
  | 'kling'
  | 'runway'
  | 'pika'
  | 'luma'
  | 'custom';

export interface ProviderInfo {
  id: AiProvider;
  name: string;
  description: string;
  websiteUrl: string;
  apiKeyUrl: string;
  features: string[];
  hasSecret: boolean;
  logo: string; // emoji fallback
}

// --- Generation Modes ---
export type GenerationMode =
  | 'text-to-video'
  | 'image-to-video'
  | 'text-to-image'
  | 'soul-mode'
  | 'video-extend';

// --- Camera Presets ---
export interface CameraPreset {
  id: string;
  name: string;
  description: string;
  category: CameraCategory;
  provider: AiProvider;
  promptTag: string; // Text to inject into prompt
}

export type CameraCategory =
  | 'dolly'
  | 'crane'
  | 'orbit'
  | 'zoom'
  | 'pan'
  | 'fpv'
  | 'static'
  | 'special';

// --- Resolution Settings ---
export interface ResolutionPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
  category: 'landscape' | 'portrait' | 'square' | 'cinematic';
  providers: AiProvider[];
}

// --- Generation Request ---
export interface GenerationRequest {
  provider: AiProvider;
  mode: GenerationMode;
  prompt: string;
  negativePrompt?: string;
  resolution: string;
  aspectRatio: string;
  duration?: number; // seconds, for video
  cameraPreset?: string;
  cameraFixed?: boolean;
  seed?: number;
  motionStrength?: number; // 0-1
  styleId?: string;
  styleStrength?: number; // 0-1
  enhancePrompt?: boolean;
  model?: string;
  sourceImageUrl?: string;
  referenceImageUrls?: string[];
  quality?: 'medium' | 'high' | 'ultra';
}

// --- Generation Result ---
export interface GenerationResult {
  id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'nsfw' | 'cancelled';
  provider: AiProvider;
  mode: GenerationMode;
  prompt: string;
  outputUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

// --- Guide Content ---
export interface GuideSection {
  id: string;
  title: string;
  provider: AiProvider;
  mode: GenerationMode;
  content: string;
  tips: string[];
  examplePrompts: string[];
}
