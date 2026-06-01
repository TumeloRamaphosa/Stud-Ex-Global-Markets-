import { NextRequest, NextResponse } from 'next/server';

// Proxy to MCP Meta Ads service on :3002
const META_ADS_URL = process.env.MCP_META_ADS_URL || 'http://localhost:3002';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const resource = searchParams.get('resource') || 'campaigns';

  const res = await fetch(`${META_ADS_URL}/${resource}?${searchParams.toString()}`);
  return NextResponse.json(await res.json());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { resource, ...data } = body;

  const res = await fetch(`${META_ADS_URL}/${resource || 'campaigns'}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return NextResponse.json(await res.json());
}
