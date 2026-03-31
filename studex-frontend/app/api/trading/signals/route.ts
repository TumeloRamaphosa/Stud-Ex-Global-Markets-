import { NextRequest, NextResponse } from 'next/server';
import { tradingStore } from '@/lib/trading-db';

export async function POST(req: NextRequest) {
  try {
    const signal = await req.json();
    tradingStore.addSignal(signal);
    return NextResponse.json({ status: 'stored' });
  } catch {
    return NextResponse.json({ error: 'invalid data' }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  return NextResponse.json(tradingStore.getRecentSignals(limit));
}
