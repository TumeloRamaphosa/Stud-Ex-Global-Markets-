import { Timestamp } from 'firebase/firestore';

// ==================== MARKETING TYPES ====================

export interface MarketingProfile {
  id?: string;
  userId: string;
  appName: string;
  description: string;
  audience: string;
  problem: string;
  differentiator: string;
  category: 'finance' | 'investment' | 'real-estate' | 'luxury-goods' | 'tech' | 'beauty' | 'fitness' | 'home' | 'productivity' | 'food' | 'other';
  url: string;
  imageGen: ImageGenConfig;
  uploadPost: UploadPostConfig;
  posting: PostingConfig;
  revenuecat: RevenueCatConfig;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ImageGenConfig {
  provider: 'openai' | 'stability' | 'replicate' | 'local';
  model: string;
  basePrompt: string;
}

export interface UploadPostConfig {
  apiKey: string;
  profile: string;
  platforms: Platform[];
}

export type Platform =
  | 'tiktok'
  | 'instagram'
  | 'youtube'
  | 'linkedin'
  | 'x'
  | 'threads'
  | 'pinterest'
  | 'reddit'
  | 'bluesky';

export interface PostingConfig {
  schedule: string[];
  timezone: string;
  crossPost: Platform[];
}

export interface RevenueCatConfig {
  enabled: boolean;
  projectId: string;
}

export interface SlideData {
  imageUrl: string;
  overlayText: string;
  prompt: string;
  order: number;
}

export interface MarketingPost {
  id?: string;
  profileId: string;
  userId: string;
  requestId: string;
  hookText: string;
  hookCategory: HookCategory;
  captionText: string;
  ctaText: string;
  slides: SlideData[];
  platforms: Platform[];
  platformResults: Record<string, PlatformResult>;
  status: 'draft' | 'queued' | 'generating' | 'ready' | 'posting' | 'posted' | 'failed';
  scheduledAt: Timestamp | null;
  postedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PlatformResult {
  postId: string;
  url: string;
  status: 'pending' | 'success' | 'failed';
}

export type HookCategory =
  | 'person-conflict'
  | 'budget'
  | 'self-discovery'
  | 'before-after'
  | 'pov'
  | 'listicle'
  | 'tutorial';

export interface MarketingAnalytics {
  id?: string;
  profileId: string;
  date: string;
  platforms: Record<string, PlatformMetrics>;
  createdAt: Timestamp;
}

export interface PlatformMetrics {
  followers: number;
  impressions: number;
  reach: number;
  profileViews: number;
}

export interface MarketingReport {
  id?: string;
  profileId: string;
  date: string;
  period: { start: string; end: string };
  summary: string;
  topHooks: HookPerformance[];
  ctaPerformance: CTAPerformance[];
  diagnosticBreakdown: DiagnosticBreakdown;
  recommendations: string[];
  createdAt: Timestamp;
}

export interface HookPerformance {
  id?: string;
  profileId: string;
  postId: string;
  hookText: string;
  hookCategory: HookCategory;
  requestId: string;
  date: string;
  impressions: number;
  conversions: number;
  ctaText: string;
  status: 'doubleDown' | 'testing' | 'rotation' | 'dropped';
  updatedAt: Timestamp;
}

export interface CTAPerformance {
  text: string;
  timesUsed: number;
  totalConversions: number;
  conversionRate: number;
}

export interface DiagnosticBreakdown {
  scale: number;
  fixCta: number;
  fixHooks: number;
  fullReset: number;
}

export type DiagnosticType = 'scale' | 'fix-cta' | 'fix-hooks' | 'full-reset' | 'cta-issue' | 'app-issue';

export interface CompetitorResearch {
  id?: string;
  profileId: string;
  competitors: CompetitorData[];
  gaps: string[];
  opportunities: string[];
  createdAt: Timestamp;
}

export interface CompetitorData {
  name: string;
  platform: Platform;
  hookTypes: string[];
  formatPatterns: string[];
  viewRange: { min: number; max: number };
  postingFrequency: string;
  ctaPatterns: string[];
}

export interface ContentTemplate {
  id: string;
  name: string;
  category: string;
  hookTemplate: string;
  slideTexts: string[];
  captionTemplate: string;
  ctaTemplate: string;
}

// Hook formula templates from Larry's methodology
export const HOOK_FORMULAS: Record<HookCategory, string[]> = {
  'person-conflict': [
    'I showed my {person} what AI thinks our {space} should look like',
    'My {person} said our {space} looks like a catalogue',
    'My {person} bet me I couldn\'t redesign our {space} with AI',
  ],
  'budget': [
    '{budget} budget, designer taste — AI made it happen',
    'You don\'t need {amount} to make your {space} look expensive',
    'What {amount} gets you with AI vs without',
  ],
  'self-discovery': [
    'I asked AI to show me {transformation}... I wasn\'t ready',
    'I finally tried {thing} and I can\'t go back',
    'Why did nobody tell me about {thing} sooner??',
  ],
  'before-after': [
    'Same {space}. Same budget. AI just hits different',
    'The {space} before vs. after AI got involved',
    'I can\'t believe this is the same {space}',
  ],
  'pov': [
    'POV: You find an app that actually {solves_problem}',
    'POV: Your {person} sees the {space} for the first time',
    'POV: You finally {achievement}',
  ],
  'listicle': [
    '{number} things I wish I knew before {action}',
    '{number} AI tools that changed my {area}',
    'Top {number} mistakes when {action}',
  ],
  'tutorial': [
    'How I {achievement} in {timeframe}',
    'Step by step: {process}',
    'The exact process I used to {achievement}',
  ],
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  x: 'X (Twitter)',
  threads: 'Threads',
  pinterest: 'Pinterest',
  reddit: 'Reddit',
  bluesky: 'Bluesky',
};

export const CATEGORY_LABELS: Record<string, string> = {
  finance: 'Finance & Banking',
  investment: 'Investment & Trading',
  'real-estate': 'Real Estate',
  'luxury-goods': 'Luxury Goods',
  tech: 'Technology',
  beauty: 'Beauty & Skincare',
  fitness: 'Fitness & Health',
  home: 'Home & Interior',
  productivity: 'Productivity',
  food: 'Food & Beverage',
  other: 'Other',
};
