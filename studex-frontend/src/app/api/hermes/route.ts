import { NextRequest, NextResponse } from 'next/server';
import { recordAgentEvent } from '@/lib/agent-memory';

const HERMES_URL = process.env.HERMES_URL || 'http://localhost:3004';

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

async function hermesProxy(endpoint: string, body?: Record<string, unknown>) {
  const res = await fetch(`${HERMES_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Hermes error ${res.status}: ${errorText}`);
  }
  return res.json();
}

export async function GET() {
  try {
    const res = await fetch(`${HERMES_URL}/api/hermes`);
    if (!res.ok) {
      return NextResponse.json({ status: 'error', service: 'hermes', code: res.status });
    }
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ status: 'offline', service: 'hermes' });
  }
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
      case 'config_set': {
        const result = await hermesProxy('/api/hermes', body);
        await recordAgentEvent({
          agent: 'Hermes',
          action: 'config_set',
          status: 'completed',
          summary: `Hermes configuration updated to provider ${body.provider || 'unknown'}.`,
          source: '/api/hermes',
          details: {
            provider: body.provider as string,
            model: body.model as string,
            ollamaUrl: body.ollamaUrl as string,
          },
        });
        return NextResponse.json(result);
      }

      case 'social': {
        const result = await hermesProxy('/api/hermes/social', body);
        await recordAgentEvent({
          agent: 'Hermes',
          action: 'social',
          status: 'completed',
          summary: 'Hermes social content request completed.',
          source: '/api/hermes',
          details: {
            platform: body.platform as string,
            prompt: body.prompt as string,
          },
        });
        return NextResponse.json(result);
      }

      case 'email': {
        const result = await hermesProxy('/api/hermes/email', body);
        await recordAgentEvent({
          agent: 'Hermes',
          action: 'email',
          status: 'completed',
          summary: 'Hermes email content request completed.',
          source: '/api/hermes',
          details: {
            subject: body.subject as string,
            audience: body.audience as string,
          },
        });
        return NextResponse.json(result);
      }

      case 'video': {
        const result = await hermesProxy('/api/hermes/video', body);
        await recordAgentEvent({
          agent: 'Hermes',
          action: 'video',
          status: 'completed',
          summary: 'Hermes video content request completed.',
          source: '/api/hermes',
        });
        return NextResponse.json(result);
      }

      case 'image': {
        const result = await hermesProxy('/api/hermes/image', body);
        await recordAgentEvent({
          agent: 'Hermes',
          action: 'image',
          status: 'completed',
          summary: 'Hermes image prompt request completed.',
          source: '/api/hermes',
        });
        return NextResponse.json(result);
      }

      case 'calendar': {
        const result = await hermesProxy('/api/hermes/calendar', body);
        await recordAgentEvent({
          agent: 'Hermes',
          action: 'calendar',
          status: 'completed',
          summary: 'Hermes calendar request completed.',
          source: '/api/hermes',
        });
        return NextResponse.json(result);
      }

      case 'ab_test': {
        const result = await hermesProxy('/api/hermes/ab_test', body);
        await recordAgentEvent({
          agent: 'Hermes',
          action: 'ab_test',
          status: 'completed',
          summary: 'Hermes A/B test request completed.',
          source: '/api/hermes',
        });
        return NextResponse.json(result);
      }

      case 'brand_voice': {
        const result = await hermesProxy('/api/hermes/brand_voice', {
          tone: body.tone,
          style: body.style,
          keywords: body.keywords,
          avoidWords: body.avoidWords,
          examples: body.examples,
          audience: body.audience,
        });
        await recordAgentEvent({
          agent: 'Hermes',
          action: 'brand_voice',
          status: 'completed',
          summary: 'Hermes brand voice settings updated.',
          source: '/api/hermes',
        });
        return NextResponse.json(result);
      }

      case 'repurpose': {
        const result = await hermesProxy('/api/hermes/repurpose', {
          content: body.content,
          sourceFormat: body.sourceFormat,
          targetPlatforms: body.targetPlatforms,
          tone: body.tone,
        });
        await recordAgentEvent({
          agent: 'Hermes',
          action: 'repurpose',
          status: 'completed',
          summary: 'Hermes repurpose request completed.',
          source: '/api/hermes',
        });
        return NextResponse.json(result);
      }

      case 'trend_scan': {
        const result = await hermesProxy('/api/hermes/trend_scan', {
          industry: body.industry || 'premium meat',
          region: body.region || 'South Africa',
          platforms: body.platforms || ['twitter', 'instagram', 'facebook'],
        });
        await recordAgentEvent({
          agent: 'Hermes',
          action: 'trend_scan',
          status: 'completed',
          summary: 'Hermes trend scan completed.',
          source: '/api/hermes',
          details: {
            industry: (body.industry || 'premium meat') as string,
            region: (body.region || 'South Africa') as string,
          },
        });
        return NextResponse.json(result);
      }

      case 'competitor_content': {
        const result = await hermesProxy('/api/hermes/competitor_content', {
          competitors: body.competitors,
          platforms: body.platforms,
          dateRange: body.dateRange,
          metrics: body.metrics || ['engagement', 'frequency', 'topics'],
        });
        await recordAgentEvent({
          agent: 'Hermes',
          action: 'competitor_content',
          status: 'completed',
          summary: 'Hermes competitor content analysis completed.',
          source: '/api/hermes',
        });
        return NextResponse.json(result);
      }

      default: {
        // Fallback: proxy any unknown action to hermes service
        const endpoint = `/api/hermes/${action}`;
        const res = await fetch(`${HERMES_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Hermes fallback error ${res.status}: ${errorText}`);
        }
        await recordAgentEvent({
          agent: 'Hermes',
          action,
          status: 'completed',
          summary: `Hermes fallback action completed: ${action}.`,
          source: '/api/hermes',
        });
        return NextResponse.json(await res.json());
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Hermes request failed';
    console.error(`[hermes/${action}] Error:`, err);
    return errorResponse(message);
  }
}
