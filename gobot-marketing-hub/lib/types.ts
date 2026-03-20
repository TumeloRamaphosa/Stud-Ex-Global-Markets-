// ==================== BLOTATO TYPES ====================

export type BlotaPlatform =
  | 'twitter'
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'tiktok'
  | 'youtube'
  | 'threads'
  | 'bluesky'
  | 'pinterest';

export interface BlotaAccount {
  id: string;
  platform: BlotaPlatform;
  username: string;
  displayName: string;
  profileImage?: string;
}

export interface BlotaSubAccount {
  id: string;
  name: string;
  pageId: string;
  platform: BlotaPlatform;
}

export interface BlotaPostContent {
  text: string;
  mediaUrls: string[];
  platform: BlotaPlatform;
  additionalPosts?: { text: string; mediaUrls: string[] }[];
}

export interface BlotaTarget {
  targetType: BlotaPlatform;
  pageId?: string;
  // TikTok-specific
  privacyLevel?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY';
  isAiGenerated?: boolean;
  autoAddMusic?: boolean;
  disabledComments?: boolean;
  disabledDuet?: boolean;
  disabledStitch?: boolean;
}

export interface BlotaPostRequest {
  post: {
    accountId: string;
    content: BlotaPostContent;
    target: BlotaTarget;
  };
  scheduledTime?: string; // ISO 8601 — top-level, NOT inside post
  useNextFreeSlot?: boolean; // top-level, NOT inside post
}

export interface BlotaPostResponse {
  postSubmissionId: string;
}

export interface BlotaPostStatus {
  id: string;
  status: 'pending' | 'processing' | 'published' | 'failed';
  platform: BlotaPlatform;
  postUrl?: string;
  error?: string;
}

// ==================== AIRTABLE TYPES ====================

export interface AirtableContentRecord {
  id?: string;
  fields: {
    Title: string;
    'Hook Text': string;
    'Hook Category': string;
    Caption: string;
    CTA: string;
    'Slide Texts': string; // JSON stringified array
    'Media URLs': string; // JSON stringified array
    Platforms: string; // comma-separated
    Status: 'Draft' | 'Scheduled' | 'Posted' | 'Failed' | 'Archived';
    'Scheduled Date': string; // ISO date
    'Scheduled Time': string;
    'Posted Date'?: string;
    'Blotato Submission IDs'?: string; // JSON array
    'Impressions'?: number;
    'Conversions'?: number;
    'Diagnostic'?: string;
    'Hook Performance'?: string;
    Notes?: string;
    'Created At'?: string;
  };
}

export interface AirtableAnalyticsRecord {
  id?: string;
  fields: {
    Date: string;
    Platform: string;
    Followers: number;
    Impressions: number;
    Reach: number;
    'Profile Views': number;
    'Post Count': number;
    Notes?: string;
  };
}

export interface AirtableAutomationLog {
  id?: string;
  fields: {
    'Action Type': string;
    'Action Details': string;
    Status: 'Success' | 'Failed' | 'Pending';
    'Triggered By': string;
    'Triggered At': string;
    'Content Record ID'?: string;
    'Error Message'?: string;
  };
}

// ==================== N8N TYPES ====================

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: N8nNode[];
  connections: Record<string, unknown>;
}

export interface N8nNode {
  name: string;
  type: string;
  position: [number, number];
  parameters: Record<string, unknown>;
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'success' | 'error' | 'waiting';
  startedAt: string;
  stoppedAt?: string;
  data?: Record<string, unknown>;
}

// ==================== APP TYPES ====================

export interface ContentPost {
  id: string;
  title: string;
  hookText: string;
  hookCategory: HookCategory;
  caption: string;
  cta: string;
  slideTexts: string[];
  mediaUrls: string[];
  platforms: BlotaPlatform[];
  status: 'draft' | 'scheduled' | 'posting' | 'posted' | 'failed';
  scheduledAt?: string;
  postedAt?: string;
  blotaSubmissionIds: string[];
  platformResults: Record<BlotaPlatform, { status: string; postUrl?: string }>;
  impressions: number;
  conversions: number;
  diagnostic?: DiagnosticType;
  airtableRecordId?: string;
  createdAt: string;
  updatedAt: string;
}

export type HookCategory =
  | 'person-conflict'
  | 'budget'
  | 'self-discovery'
  | 'before-after'
  | 'pov'
  | 'listicle'
  | 'tutorial';

export type DiagnosticType = 'scale' | 'fix-cta' | 'fix-hooks' | 'full-reset';

export interface ScheduleSlot {
  time: string; // HH:mm
  platforms: BlotaPlatform[];
  label: string;
}

export const PLATFORM_CONFIG: Record<
  BlotaPlatform,
  { label: string; color: string; icon: string; requiresPageId: boolean }
> = {
  twitter: { label: 'X (Twitter)', color: '#000000', icon: 'twitter', requiresPageId: false },
  instagram: { label: 'Instagram', color: '#E4405F', icon: 'instagram', requiresPageId: false },
  facebook: { label: 'Facebook', color: '#1877F2', icon: 'facebook', requiresPageId: true },
  linkedin: { label: 'LinkedIn', color: '#0A66C2', icon: 'linkedin', requiresPageId: true },
  tiktok: { label: 'TikTok', color: '#000000', icon: 'music', requiresPageId: false },
  youtube: { label: 'YouTube', color: '#FF0000', icon: 'youtube', requiresPageId: false },
  threads: { label: 'Threads', color: '#000000', icon: 'at-sign', requiresPageId: false },
  bluesky: { label: 'Bluesky', color: '#0085FF', icon: 'cloud', requiresPageId: false },
  pinterest: { label: 'Pinterest', color: '#E60023', icon: 'pin', requiresPageId: false },
};

export const HOOK_FORMULAS: Record<HookCategory, string[]> = {
  'person-conflict': [
    'I showed my {person} what AI thinks our {space} should look like',
    'My {person} said our {space} looks like a catalogue',
    'My {person} bet me I couldn\'t redesign our {space} with AI',
  ],
  'budget': [
    '{budget} budget, designer taste — AI made it happen',
    'You don\'t need {amount} to make your {space} look expensive',
  ],
  'self-discovery': [
    'I asked AI to show me {transformation}... I wasn\'t ready',
    'I finally tried {thing} and I can\'t go back',
  ],
  'before-after': [
    'Same {space}. Same budget. AI just hits different',
    'The {space} before vs. after AI got involved',
  ],
  'pov': [
    'POV: You find an app that actually {solves_problem}',
    'POV: Your {person} sees the {space} for the first time',
  ],
  'listicle': [
    '{number} things I wish I knew before {action}',
    '{number} AI tools that changed my {area}',
  ],
  'tutorial': [
    'How I {achievement} in {timeframe}',
    'Step by step: {process}',
  ],
};

export const DEFAULT_SCHEDULE: ScheduleSlot[] = [
  { time: '07:30', platforms: ['tiktok', 'instagram'], label: 'Morning' },
  { time: '16:30', platforms: ['tiktok', 'instagram', 'linkedin'], label: 'Afternoon' },
  { time: '21:00', platforms: ['tiktok', 'instagram', 'threads'], label: 'Evening' },
];
