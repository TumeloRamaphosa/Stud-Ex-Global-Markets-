import { NextRequest, NextResponse } from 'next/server';

// ─── Hermes Content Agent — API Proxy ───────────────────────────────────────
// Pattern: Same as Shopify/QuickBooks/n8n proxy routes
// Proxies to hermes-agent container (Express on port 3004)
// In docker-compose: http://hermes-agent:3004
// On Fly.io: http://studex-hermes-agent.internal:3004
// On Manus VM: http://<manus-ip>:3004
// ────────────────────────────────────────────────────────────────────────────

const HERMES_URL = process.env.HERMES_AGENT_URL || 'http://localhost:3004';

async function hermesFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${HERMES_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Hermes Agent error ${res.status}: ${err}`);
  }
  return res.json();
}

export async function GET(req: NextRequest) {
  const test = req.nextUrl.searchParams.get('test');
  if (test === '1') {
    return NextResponse.json({
      mock: true,
      agent: 'Hermes',
      role: 'Content Creator',
      status: 'ready',
      partner: 'CashClaw',
    });
  }
  try {
    const health = await hermesFetch('/');
    return NextResponse.json(health);
  } catch (err: any) {
    return NextResponse.json({
      status: 'offline',
      message: 'Hermes Agent not reachable. Deploy to Manus VM or start locally.',
      error: err.message,
    }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  const test = req.nextUrl.searchParams.get('test');
  if (test === '1') {
    return NextResponse.json({ mock: true, action, agent: 'Hermes' });
  }

  try {
    if (action === 'config_get') {
      const data = await hermesFetch('/config');
      return NextResponse.json(data);
    }

    if (action === 'config_set') {
      const data = await hermesFetch('/config', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return NextResponse.json(data);
    }

    if (action === 'social_post') {
      const data = await hermesFetch('/social-post', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return NextResponse.json(data);
    }

    if (action === 'email_campaign') {
      const data = await hermesFetch('/email-campaign', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return NextResponse.json(data);
    }

    if (action === 'video_script') {
      const data = await hermesFetch('/video-script', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return NextResponse.json(data);
    }

    if (action === 'image_prompt') {
      const data = await hermesFetch('/image-prompt', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return NextResponse.json(data);
    }

    if (action === 'content_calendar') {
      const data = await hermesFetch('/content-calendar', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return NextResponse.json(data);
    }

    if (action === 'ab_test') {
      const data = await hermesFetch('/ab-test', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return NextResponse.json(data);
    }

    if (action === 'generate') {
      const data = await hermesFetch('/generate', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return NextResponse.json(data);
    }

    if (action === 'ask') {
      const data = await hermesFetch('/ask', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return NextResponse.json(data);
    }

    if (action === 'report') {
      const data = await hermesFetch('/report', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return NextResponse.json(data);
    }

    return NextResponse.json(
      {
        error: 'Unknown action',
        available: [
          'config_get', 'config_set',
          'social_post', 'email_campaign', 'video_script',
          'image_prompt', 'content_calendar', 'ab_test',
          'generate', 'ask', 'report',
        ],
      },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
