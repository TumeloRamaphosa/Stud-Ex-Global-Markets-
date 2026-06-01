import { NextRequest, NextResponse } from 'next/server';

// Proxy to Hermes Content Agent on :3004
const HERMES_URL = process.env.HERMES_URL || 'http://localhost:3004';

async function hermesProxy(endpoint: string, body?: Record<string, unknown>) {
  const res = await fetch(`${HERMES_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function GET() {
  try {
    const res = await fetch(`${HERMES_URL}/api/hermes`);
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ status: 'offline', service: 'hermes' });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  switch (action) {
    case 'config_set': {
      const result = await hermesProxy('/api/hermes', body);
      return NextResponse.json(result);
    }

    // Content generation proxies
    case 'social': {
      const result = await hermesProxy('/api/hermes/social', body);
      return NextResponse.json(result);
    }

    case 'email': {
      const result = await hermesProxy('/api/hermes/email', body);
      return NextResponse.json(result);
    }

    case 'video': {
      const result = await hermesProxy('/api/hermes/video', body);
      return NextResponse.json(result);
    }

    case 'image': {
      const result = await hermesProxy('/api/hermes/image', body);
      return NextResponse.json(result);
    }

    case 'calendar': {
      const result = await hermesProxy('/api/hermes/calendar', body);
      return NextResponse.json(result);
    }

    case 'ab_test': {
      const result = await hermesProxy('/api/hermes/ab_test', body);
      return NextResponse.json(result);
    }

    // Brand voice configuration
    case 'brand_voice': {
      const result = await hermesProxy('/api/hermes/brand_voice', {
        tone: body.tone,
        style: body.style,
        keywords: body.keywords,
        avoidWords: body.avoidWords,
        examples: body.examples,
        audience: body.audience,
      });
      return NextResponse.json(result);
    }

    // Repurpose content across platforms
    case 'repurpose': {
      const result = await hermesProxy('/api/hermes/repurpose', {
        content: body.content,
        sourceFormat: body.sourceFormat,
        targetPlatforms: body.targetPlatforms,
        tone: body.tone,
      });
      return NextResponse.json(result);
    }

    // Scan trending topics
    case 'trend_scan': {
      const result = await hermesProxy('/api/hermes/trend_scan', {
        industry: body.industry || 'premium meat',
        region: body.region || 'South Africa',
        platforms: body.platforms || ['twitter', 'instagram', 'facebook'],
      });
      return NextResponse.json(result);
    }

    // Analyze competitor content
    case 'competitor_content': {
      const result = await hermesProxy('/api/hermes/competitor_content', {
        competitors: body.competitors,
        platforms: body.platforms,
        dateRange: body.dateRange,
        metrics: body.metrics || ['engagement', 'frequency', 'topics'],
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
      return NextResponse.json(await res.json());
    }
  }
}
