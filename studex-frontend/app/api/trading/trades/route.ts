import { NextRequest, NextResponse } from 'next/server';
import { tradingStore } from '@/lib/trading-db';

// Verify bot API secret
function verifyAuth(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  const secret = process.env.TRADING_BOT_SECRET;
  if (!secret) return true; // No secret configured = allow all (dev mode)
  return auth === `Bearer ${secret}`;
}

// POST: Receive trade from the desktop trading bot
export async function POST(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const trade = await req.json();
    tradingStore.addTrade(trade);
    return NextResponse.json({ status: 'stored', id: trade.id });
  } catch (e) {
    return NextResponse.json({ error: 'invalid data' }, { status: 400 });
  }
}

// GET: Fetch trades for the dashboard
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const strategy = searchParams.get('strategy') || undefined;
  const statsOnly = searchParams.get('stats') === 'true';

  if (statsOnly) {
    return NextResponse.json(tradingStore.getTradeStats(strategy));
  }

  return NextResponse.json(tradingStore.getTrades(limit, strategy));
}
