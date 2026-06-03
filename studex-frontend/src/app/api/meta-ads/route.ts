import { NextRequest, NextResponse } from 'next/server';

const META_ADS_URL = process.env.MCP_META_ADS_URL || 'http://localhost:3002';

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const resource = searchParams.get('resource') || 'campaigns';

  try {
    const res = await fetch(`${META_ADS_URL}/${encodeURIComponent(resource)}?${searchParams.toString()}`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Meta Ads proxy error ${res.status}: ${errorText}`);
    }
    return NextResponse.json(await res.json());
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Meta Ads GET failed';
    console.error(`[meta-ads/GET] Error:`, err);
    return errorResponse(message);
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { resource, ...data } = body;

  try {
    const res = await fetch(`${META_ADS_URL}/${encodeURIComponent(String(resource || 'campaigns'))}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Meta Ads proxy error ${res.status}: ${errorText}`);
    }
    return NextResponse.json(await res.json());
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Meta Ads POST failed';
    console.error(`[meta-ads/POST] Error:`, err);
    return errorResponse(message);
  }
}
