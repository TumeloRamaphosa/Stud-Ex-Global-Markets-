import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'studex-trading-api',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    features: {
      postgres: !!process.env.POSTGRES_URL,
      ai_sdk: !!process.env.ANTHROPIC_API_KEY,
      kv: !!process.env.KV_REST_API_URL,
    },
  });
}
