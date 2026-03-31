import { NextRequest, NextResponse } from 'next/server';
import { tradingStore } from '@/lib/trading-db';

export async function POST(req: NextRequest) {
  try {
    const feedback = await req.json();
    tradingStore.addRALFFeedback(feedback);
    return NextResponse.json({ status: 'stored' });
  } catch {
    return NextResponse.json({ error: 'invalid data' }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const strategy = searchParams.get('strategy') || undefined;

  if (strategy) {
    return NextResponse.json(tradingStore.getLatestRALF(strategy));
  }

  return NextResponse.json(tradingStore.getAllRALF());
}
