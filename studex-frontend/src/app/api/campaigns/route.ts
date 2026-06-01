import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/llm';
import { notifyAll } from '@/lib/notifications';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'whatsapp' | 'sms';
  status: 'draft' | 'active' | 'paused' | 'completed';
  audience: string[];
  content: string;
  createdAt: string;
  metrics?: { sent: number; opened: number; clicked: number; converted: number };
}

// In-memory store (replace with DB in production)
const campaigns: Map<string, Campaign> = new Map();

export async function GET() {
  return NextResponse.json({ ok: true, campaigns: Array.from(campaigns.values()) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  switch (action) {
    case 'create': {
      const id = `camp_${Date.now()}`;
      const campaign: Campaign = {
        id,
        name: body.name,
        type: body.type || 'email',
        status: 'draft',
        audience: body.audience || [],
        content: body.content || '',
        createdAt: new Date().toISOString(),
      };
      campaigns.set(id, campaign);
      return NextResponse.json({ ok: true, campaign });
    }

    case 'generate_content': {
      const prompt = `Generate a ${body.type || 'email'} campaign for Studex Meat:\nTopic: ${body.topic}\nAudience: ${body.audience}\nTone: Professional, enticing, meat-lover focused\nInclude: subject line, body, CTA`;
      const content = await chatCompletion([{ role: 'user', content: prompt }]);
      return NextResponse.json({ ok: true, content });
    }

    case 'launch': {
      const campaign = campaigns.get(body.campaignId);
      if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      campaign.status = 'active';
      campaign.metrics = { sent: 0, opened: 0, clicked: 0, converted: 0 };
      await notifyAll(`🚀 Campaign launched: ${campaign.name}`);
      return NextResponse.json({ ok: true, campaign });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
