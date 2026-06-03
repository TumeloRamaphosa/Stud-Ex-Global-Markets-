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

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

// In-memory store (replace with DB in production)
const campaigns: Map<string, Campaign> = new Map();

export async function GET() {
  return NextResponse.json({ ok: true, campaigns: Array.from(campaigns.values()) });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { action } = body;
  if (!action || typeof action !== 'string') {
    return errorResponse('Missing or invalid "action" field', 400);
  }

  try {
    switch (action) {
      case 'create': {
        if (!body.name) return errorResponse('Missing required field: name', 400);
        const id = `camp_${Date.now()}`;
        const campaign: Campaign = {
          id,
          name: String(body.name),
          type: (body.type as Campaign['type']) || 'email',
          status: 'draft',
          audience: (body.audience as string[]) || [],
          content: String(body.content || ''),
          createdAt: new Date().toISOString(),
        };
        campaigns.set(id, campaign);
        return NextResponse.json({ ok: true, campaign });
      }

      case 'generate_content': {
        if (!body.topic) return errorResponse('Missing required field: topic', 400);
        const prompt = `Generate a ${body.type || 'email'} campaign for Studex Meat:\nTopic: ${body.topic}\nAudience: ${body.audience || 'general'}\nTone: Professional, enticing, meat-lover focused\nInclude: subject line, body, CTA`;
        const content = await chatCompletion([{ role: 'user', content: prompt }]);
        return NextResponse.json({ ok: true, content });
      }

      case 'launch': {
        if (!body.campaignId) return errorResponse('Missing required field: campaignId', 400);
        const campaign = campaigns.get(String(body.campaignId));
        if (!campaign) return errorResponse('Campaign not found', 404);
        campaign.status = 'active';
        campaign.metrics = { sent: 0, opened: 0, clicked: 0, converted: 0 };
        await notifyAll(`Campaign launched: ${campaign.name}`);
        return NextResponse.json({ ok: true, campaign });
      }

      default:
        return errorResponse(`Unknown action: ${action}`, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Campaign request failed';
    console.error(`[campaigns/${action}] Error:`, err);
    return errorResponse(message);
  }
}
