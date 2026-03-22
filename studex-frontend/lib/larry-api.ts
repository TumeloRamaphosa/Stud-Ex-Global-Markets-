/**
 * Larry Skill API Client
 * Complete client library for campaign management and automation
 */

export interface Campaign {
  id: string;
  title: string;
  niche: string;
  targetAudience: string;
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'running' | 'published' | 'completed' | 'paused';
  steps: WorkflowStep[];
  content: CampaignContent;
  metrics: Metrics;
  memory: MemoryData;
}

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result: string | null;
  error?: string;
}

export interface CampaignContent {
  hook: string;
  slides: string[];
  caption: string;
  cta: string;
  platforms: ('tiktok' | 'instagram' | 'linkedin' | 'youtube')[];
}

export interface Metrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
}

export interface MemoryData {
  performancePatterns: string[];
  successFormulas: string[];
  optimizations: string[];
}

export interface AnalyticsData {
  timeframe: string;
  platform: string;
  metrics: any[];
  summary: {
    totalViews: number;
    totalEngagement: number;
    avgEngagementRate: string;
    campaignCount: number;
  };
}

export class LarryAPI {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl || (typeof window !== 'undefined' ? '' : '');
  }

  // Campaign Management
  async createCampaign(data: {
    title: string;
    niche: string;
    targetAudience: string;
  }): Promise<Campaign> {
    const res = await fetch(`${this.baseUrl}/api/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create campaign');
    return res.json();
  }

  async getCampaigns(): Promise<{ campaigns: Campaign[]; total: number }> {
    const res = await fetch(`${this.baseUrl}/api/campaigns`);
    if (!res.ok) throw new Error('Failed to fetch campaigns');
    return res.json();
  }

  async getCampaign(id: string): Promise<Campaign> {
    const res = await fetch(`${this.baseUrl}/api/campaigns/${id}`);
    if (!res.ok) throw new Error('Failed to fetch campaign');
    return res.json();
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const res = await fetch(`${this.baseUrl}/api/campaigns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update campaign');
    return res.json();
  }

  async deleteCampaign(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/campaigns/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete campaign');
  }

  // Workflow Execution
  async executeStep(
    campaignId: string,
    step: string,
    context: any,
    previousResults?: any
  ): Promise<{ step: string; result: string; timestamp: string }> {
    const res = await fetch(`${this.baseUrl}/api/campaigns/${campaignId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step, context, previousResults }),
    });
    if (!res.ok) throw new Error('Failed to execute workflow step');
    return res.json();
  }

  // Social Media Integration
  async postToTikTok(campaignId: string, content: any, scheduledTime?: Date): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/social/tiktok`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, content, scheduledTime }),
    });
    if (!res.ok) throw new Error('Failed to post to TikTok');
    return res.json();
  }

  async postToInstagram(campaignId: string, content: any, scheduledTime?: Date): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/social/instagram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, content, scheduledTime }),
    });
    if (!res.ok) throw new Error('Failed to post to Instagram');
    return res.json();
  }

  async getTikTokAnalytics(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/social/tiktok`);
    if (!res.ok) throw new Error('Failed to fetch TikTok analytics');
    return res.json();
  }

  async getInstagramAnalytics(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/social/instagram`);
    if (!res.ok) throw new Error('Failed to fetch Instagram analytics');
    return res.json();
  }

  // Analytics
  async getAnalytics(timeframe: string = '7days', platform?: string): Promise<AnalyticsData> {
    const params = new URLSearchParams({
      timeframe,
      ...(platform && { platform }),
    });
    const res = await fetch(`${this.baseUrl}/api/analytics?${params}`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  }

  async logEvent(campaignId: string, event: string, data: any): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, event, data }),
    });
    if (!res.ok) throw new Error('Failed to log event');
    return res.json();
  }

  // Claude AI Chat
  async chat(messages: any[], context?: string): Promise<{ role: string; content: string }> {
    const res = await fetch(`${this.baseUrl}/api/claude/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  }
}

// Singleton instance
let apiInstance: LarryAPI | null = null;

export function getLarryAPI(): LarryAPI {
  if (!apiInstance) {
    apiInstance = new LarryAPI();
  }
  return apiInstance;
}
