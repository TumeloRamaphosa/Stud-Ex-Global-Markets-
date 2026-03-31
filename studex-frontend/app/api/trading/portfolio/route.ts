import { NextRequest, NextResponse } from 'next/server';
import { tradingStore } from '@/lib/trading-db';

export async function POST(req: NextRequest) {
  try {
    const snapshot = await req.json();
    tradingStore.addPortfolioSnapshot(snapshot);
    return NextResponse.json({ status: 'stored' });
  } catch {
    return NextResponse.json({ error: 'invalid data' }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hours = parseInt(searchParams.get('hours') || '24');
  const latest = searchParams.get('latest') === 'true';

  if (latest) {
    return NextResponse.json(tradingStore.getLatestPortfolio());
  }

  return NextResponse.json(tradingStore.getPortfolioHistory(hours));
}
