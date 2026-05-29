import { NextResponse } from 'next/server';

const META_API = 'https://graph.facebook.com/v20.0';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || '';

async function metaAPI(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${META_API}${endpoint}`);
  url.searchParams.set('access_token', ACCESS_TOKEN);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  return res.json();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'status';

  if (!ACCESS_TOKEN) {
    return NextResponse.json({ error: 'META_ACCESS_TOKEN not set. Get it from developers.facebook.com/tools/explorer', connected: false });
  }

  try {
    if (action === 'status') {
      return NextResponse.json({ connected: !!ACCESS_TOKEN, adAccountId: AD_ACCOUNT_ID });
    }

    if (action === 'campaigns') {
      const data = await metaAPI(`/${AD_ACCOUNT_ID}/campaigns`, {
        fields: 'id,name,status,objective,daily_budget,lifetime_budget,start_time',
        limit: '50',
      });
      return NextResponse.json(data);
    }

    if (action === 'insights') {
      const data = await metaAPI(`/${AD_ACCOUNT_ID}/insights`, {
        fields: 'impressions,clicks,spend,cpc,cpm,ctr,reach,frequency,actions',
        date_preset: searchParams.get('period') || 'last_7d',
      });
      return NextResponse.json(data);
    }

    if (action === 'ads') {
      const data = await metaAPI(`/${AD_ACCOUNT_ID}/ads`, {
        fields: 'id,name,status,creative,campaign_id',
        limit: '50',
      });
      return NextResponse.json(data);
    }

    if (action === 'analyze') {
      const [campaigns, insights] = await Promise.all([
        metaAPI(`/${AD_ACCOUNT_ID}/campaigns`, { fields: 'id,name,status,objective,daily_budget', limit: '20' }),
        metaAPI(`/${AD_ACCOUNT_ID}/insights`, { fields: 'impressions,clicks,spend,cpc,cpm,ctr,reach,actions', date_preset: 'last_7d' }),
      ]);
      return NextResponse.json({
        campaigns: campaigns.data || [],
        insights: insights.data || [],
        activeCampaigns: (campaigns.data || []).filter((c: any) => c.status === 'ACTIVE').length,
      });
    }

    if (action === 'pages') {
      const data = await metaAPI('/me/accounts', { fields: 'id,name,category,fan_count,followers_count' });
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
