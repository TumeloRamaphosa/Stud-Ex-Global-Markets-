import { NextResponse } from 'next/server';

const META_API = 'https://graph.facebook.com/v20.0';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || '';

async function getPageToken(pageId: string): Promise<string> {
  const res = await fetch(`${META_API}/me/accounts?fields=id,access_token&access_token=${ACCESS_TOKEN}`);
  const data = await res.json();
  const page = (data.data || []).find((p: any) => p.id === pageId);
  return page?.access_token || ACCESS_TOKEN;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { action } = body;

  if (!ACCESS_TOKEN) {
    return NextResponse.json({ error: 'META_ACCESS_TOKEN not configured' }, { status: 400 });
  }

  try {
    // ===== FACEBOOK PAGE POSTING =====
    if (action === 'fb_post_text') {
      const pageToken = await getPageToken(body.pageId || '108934711902801');
      const res = await fetch(`${META_API}/${body.pageId || '108934711902801'}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: body.message, access_token: pageToken }),
      });
      const data = await res.json();
      return NextResponse.json({ success: !data.error, data, platform: 'facebook' });
    }

    if (action === 'fb_post_photo') {
      const pageToken = await getPageToken(body.pageId || '108934711902801');
      const res = await fetch(`${META_API}/${body.pageId || '108934711902801'}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: body.imageUrl, caption: body.caption, access_token: pageToken }),
      });
      const data = await res.json();
      return NextResponse.json({ success: !data.error, data, platform: 'facebook' });
    }

    if (action === 'fb_post_link') {
      const pageToken = await getPageToken(body.pageId || '108934711902801');
      const res = await fetch(`${META_API}/${body.pageId || '108934711902801'}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: body.message, link: body.link, access_token: pageToken }),
      });
      const data = await res.json();
      return NextResponse.json({ success: !data.error, data, platform: 'facebook' });
    }

    // ===== FACEBOOK PAGE DATA =====
    if (action === 'fb_get_pages') {
      const res = await fetch(`${META_API}/me/accounts?fields=id,name,access_token,category,fan_count,followers_count&access_token=${ACCESS_TOKEN}`);
      const data = await res.json();
      return NextResponse.json({ pages: data.data || [] });
    }

    if (action === 'fb_get_posts') {
      const pageToken = await getPageToken(body.pageId || '108934711902801');
      const res = await fetch(`${META_API}/${body.pageId || '108934711902801'}/posts?fields=id,message,created_time,shares,likes.summary(true),comments.summary(true)&limit=20&access_token=${pageToken}`);
      const data = await res.json();
      return NextResponse.json({ posts: data.data || [] });
    }

    if (action === 'fb_get_insights') {
      const pageToken = await getPageToken(body.pageId || '108934711902801');
      const res = await fetch(`${META_API}/${body.pageId || '108934711902801'}/insights?metric=page_impressions,page_engaged_users,page_post_engagements,page_fan_adds&period=day&access_token=${pageToken}`);
      const data = await res.json();
      return NextResponse.json({ insights: data.data || [] });
    }

    // ===== ADS =====
    if (action === 'ads_campaigns') {
      const res = await fetch(`${META_API}/${AD_ACCOUNT_ID}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget&limit=20&access_token=${ACCESS_TOKEN}`);
      const data = await res.json();
      return NextResponse.json({ campaigns: data.data || [] });
    }

    if (action === 'ads_insights') {
      const res = await fetch(`${META_API}/${AD_ACCOUNT_ID}/insights?fields=impressions,clicks,spend,cpc,cpm,ctr,reach,actions&date_preset=${body.period || 'maximum'}&access_token=${ACCESS_TOKEN}`);
      const data = await res.json();
      return NextResponse.json({ insights: data.data || [] });
    }

    if (action === 'ads_pause') {
      const res = await fetch(`${META_API}/${body.campaignId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAUSED', access_token: ACCESS_TOKEN }),
      });
      const data = await res.json();
      return NextResponse.json({ success: data.success, data });
    }

    if (action === 'ads_resume') {
      const res = await fetch(`${META_API}/${body.campaignId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE', access_token: ACCESS_TOKEN }),
      });
      const data = await res.json();
      return NextResponse.json({ success: data.success, data });
    }

    // ===== AUDIENCES =====
    if (action === 'ads_audiences') {
      const res = await fetch(`${META_API}/${AD_ACCOUNT_ID}/customaudiences?fields=id,name,approximate_count,subtype&limit=20&access_token=${ACCESS_TOKEN}`);
      const data = await res.json();
      return NextResponse.json({ audiences: data.data || [] });
    }

    return NextResponse.json({ error: 'Unknown action. Available: fb_post_text, fb_post_photo, fb_post_link, fb_get_pages, fb_get_posts, fb_get_insights, ads_campaigns, ads_insights, ads_pause, ads_resume, ads_audiences' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
