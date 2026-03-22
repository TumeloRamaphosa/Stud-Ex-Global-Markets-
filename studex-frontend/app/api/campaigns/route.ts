import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (replace with Firestore in production)
const campaignStore: Map<string, any> = new Map();

export async function GET(req: NextRequest) {
  try {
    const campaigns = Array.from(campaignStore.values()).sort(
      (a, b) => b.createdAt - a.createdAt
    );

    return NextResponse.json({
      campaigns,
      total: campaigns.length,
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, niche, targetAudience } = await req.json();

    if (!title || !niche) {
      return NextResponse.json(
        { error: 'Title and niche are required' },
        { status: 400 }
      );
    }

    const campaignId = `campaign_${Date.now()}`;
    const campaign = {
      id: campaignId,
      title,
      niche,
      targetAudience,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'draft',
      steps: [
        { id: 'hook', name: 'Hook', status: 'pending', result: null },
        { id: 'slides', name: 'Slides', status: 'pending', result: null },
        { id: 'caption', name: 'Caption', status: 'pending', result: null },
        { id: 'schedule', name: 'Schedule', status: 'pending', result: null },
        { id: 'monitor', name: 'Monitor', status: 'pending', result: null },
      ],
      content: {
        hook: '',
        slides: [],
        caption: '',
        cta: '',
        platforms: ['tiktok', 'instagram'],
      },
      metrics: {
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0,
      },
      memory: {
        performancePatterns: [],
        successFormulas: [],
        optimizations: [],
      },
    };

    campaignStore.set(campaignId, campaign);

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
