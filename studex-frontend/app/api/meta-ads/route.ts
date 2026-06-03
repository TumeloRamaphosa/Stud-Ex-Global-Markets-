import { NextResponse } from 'next/server';

const META_API = 'https://graph.facebook.com/v20.0';
const PAGE_TOKEN = process.env.META_PAGE_TOKEN || process.env.META_ACCESS_TOKEN || '';
const USER_TOKEN = process.env.META_USER_TOKEN || process.env.META_ACCESS_TOKEN || '';
const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || 'act_560666565541381';
const PAGE_ID = process.env.FACEBOOK_PAGE_ID || '108934711902801';
const IG_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID || '17841403538967823';

async function metaAPI(endpoint: string, params: Record<string, string> = {}, token?: string) {
  const url = new URL(`${META_API}${endpoint}`);
  url.searchParams.set('access_token', token || PAGE_TOKEN);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  return res.json();
}

async function metaPost(endpoint: string, body: Record<string, any>, token?: string) {
  const res = await fetch(`${META_API}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, access_token: token || USER_TOKEN }),
  });
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

export async function POST(req: Request) {
  const body = await req.json();
  const { action } = body;

  if (!USER_TOKEN && !PAGE_TOKEN) {
    return NextResponse.json({ error: 'No Meta token set. Set META_PAGE_TOKEN and META_USER_TOKEN.' }, { status: 400 });
  }

  try {
    if (action === 'create_campaign') {
      const data = await metaPost(`/${AD_ACCOUNT_ID}/campaigns`, {
        name: body.name,
        objective: body.objective || 'OUTCOME_TRAFFIC',
        status: 'PAUSED',
        special_ad_categories: body.special_ad_categories || [],
      });
      return NextResponse.json({ success: !data.error, data });
    }

    if (action === 'create_adset') {
      const data = await metaPost(`/${AD_ACCOUNT_ID}/adsets`, {
        name: body.name,
        campaign_id: body.campaign_id,
        daily_budget: body.daily_budget || 10000,
        billing_event: 'IMPRESSIONS',
        optimization_goal: body.optimization_goal || 'LINK_CLICKS',
        bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
        start_time: body.start_time || new Date().toISOString(),
        status: 'PAUSED',
        targeting: body.targeting || {
          geo_locations: { countries: ['ZA'] },
          age_min: 25,
          age_max: 55,
        },
      });
      return NextResponse.json({ success: !data.error, data });
    }

    if (action === 'upload_ad_image') {
      const data = await metaPost(`/${AD_ACCOUNT_ID}/adimages`, {
        url: body.image_url,
      });
      return NextResponse.json({ success: !data.error, data });
    }

    if (action === 'create_ad_creative') {
      const data = await metaPost(`/${AD_ACCOUNT_ID}/adcreatives`, {
        name: body.name,
        instagram_actor_id: IG_ACCOUNT_ID,
        object_story_spec: {
          page_id: PAGE_ID,
          link_data: {
            image_hash: body.image_hash,
            link: body.link || 'https://studexmeat.com',
            message: body.message,
            call_to_action: { type: body.cta || 'SHOP_NOW', value: { link: body.link || 'https://studexmeat.com' } },
          },
        },
      });
      return NextResponse.json({ success: !data.error, data });
    }

    if (action === 'create_ad') {
      const data = await metaPost(`/${AD_ACCOUNT_ID}/ads`, {
        name: body.name,
        adset_id: body.adset_id,
        creative: { creative_id: body.creative_id },
        status: 'PAUSED',
      });
      return NextResponse.json({ success: !data.error, data });
    }

    if (action === 'activate') {
      const results = await Promise.all(
        (body.ids || []).map((id: string) =>
          metaPost(`/${id}`, { status: 'ACTIVE' })
        )
      );
      return NextResponse.json({ success: true, results });
    }

    if (action === 'connection_status') {
      const pageCheck = await metaAPI(`/${PAGE_ID}`, { fields: 'id,name' }, PAGE_TOKEN).catch(() => null);
      const igCheck = await metaAPI(`/${IG_ACCOUNT_ID}`, { fields: 'id,username' }, PAGE_TOKEN).catch(() => null);
      const adsCheck = await metaAPI(`/${AD_ACCOUNT_ID}`, { fields: 'id,name' }, USER_TOKEN).catch(() => null);
      return NextResponse.json({
        facebook: { connected: !pageCheck?.error, id: PAGE_ID, data: pageCheck },
        instagram: { connected: !igCheck?.error, id: IG_ACCOUNT_ID, data: igCheck },
        ads: { connected: !adsCheck?.error, id: AD_ACCOUNT_ID, data: adsCheck },
        tokens: { page_token_set: !!PAGE_TOKEN, user_token_set: !!USER_TOKEN },
      });
    }

    return NextResponse.json({ error: 'Unknown POST action. Available: create_campaign, create_adset, upload_ad_image, create_ad_creative, create_ad, activate, connection_status' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
