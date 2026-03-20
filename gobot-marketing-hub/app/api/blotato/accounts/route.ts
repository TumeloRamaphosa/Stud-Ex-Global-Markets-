import { NextResponse } from 'next/server';
import { getAccounts, getSubAccounts, verifyApiKey } from '@/lib/blotato';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const platform = searchParams.get('platform');
  const accountId = searchParams.get('accountId');

  try {
    if (action === 'verify') {
      const result = await verifyApiKey();
      return NextResponse.json(result);
    }

    if (action === 'subaccounts' && accountId) {
      const subAccounts = await getSubAccounts(accountId);
      return NextResponse.json({ subAccounts });
    }

    const accounts = await getAccounts(platform as any || undefined);
    return NextResponse.json({ accounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch accounts';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
