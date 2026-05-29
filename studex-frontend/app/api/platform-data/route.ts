import { NextResponse } from 'next/server';

const API_KEY = process.env.COMPOSIO_API_KEY || '';
const BASE = 'https://backend.composio.dev/api/v2';

const ACCOUNTS = {
  instagram: '108d0d24-67ed-4f96-9605-ebda529f383f',
  facebook: '3193a5d4-d47e-447b-9059-b1444e971b2c',
  gmail: '0977bda7-635e-4ce8-8572-5ea6ffe62cd2',
  discord: '10c06475-462d-4283-8bee-fbe86b9c6430',
};

const META_API = 'https://graph.facebook.com/v20.0';
const META_TOKEN = process.env.META_ACCESS_TOKEN || '';
const META_AD_ACCOUNT = process.env.META_AD_ACCOUNT_ID || '';

async function exec(action: string, accountId: string, input: Record<string, any> = {}) {
  try {
    const res = await fetch(`${BASE}/actions/${action}/execute`, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectedAccountId: accountId, input }),
    });
    return res.json();
  } catch { return { data: null, successful: false }; }
}

export async function GET() {
  // Fetch Meta Ads data
  let metaAds = { campaigns: [], insights: null as any };
  if (META_TOKEN && META_AD_ACCOUNT) {
    try {
      const [campRes, insightRes] = await Promise.all([
        fetch(`${META_API}/${META_AD_ACCOUNT}/campaigns?fields=id,name,status,objective,daily_budget&limit=10&access_token=${META_TOKEN}`),
        fetch(`${META_API}/${META_AD_ACCOUNT}/insights?fields=impressions,clicks,spend,cpc,cpm,ctr,reach&date_preset=maximum&access_token=${META_TOKEN}`),
      ]);
      const campData = await campRes.json();
      const insightData = await insightRes.json();
      metaAds = { campaigns: campData.data || [], insights: insightData.data?.[0] || null };
    } catch {}
  }

  const [igUser, igMedia, igInsights, emails, discordUser, discordGuilds] = await Promise.all([
    exec('INSTAGRAM_GET_USER_INFO', ACCOUNTS.instagram),
    exec('INSTAGRAM_GET_USER_MEDIA', ACCOUNTS.instagram),
    exec('INSTAGRAM_GET_USER_INSIGHTS', ACCOUNTS.instagram, {
      metric: ['reach', 'follower_count', 'profile_views', 'total_interactions', 'likes', 'comments', 'shares', 'saves'],
      period: 'day',
    }),
    exec('GMAIL_FETCH_EMAILS', ACCOUNTS.gmail, { max_results: 15 }),
    exec('DISCORD_GET_MY_USER', ACCOUNTS.discord),
    exec('DISCORD_LIST_MY_GUILDS', ACCOUNTS.discord),
  ]);

  const posts = igMedia?.data?.data || [];
  const profile = igUser?.data || {};
  const followers = profile.followers_count || 0;
  const totalLikes = posts.reduce((s: number, p: any) => s + (p.like_count || 0), 0);
  const totalComments = posts.reduce((s: number, p: any) => s + (p.comments_count || 0), 0);
  const reels = posts.filter((p: any) => p.media_type === 'VIDEO');
  const images = posts.filter((p: any) => p.media_type === 'IMAGE');
  const reelAvg = reels.length ? Math.round(reels.reduce((s: number, p: any) => s + (p.like_count || 0), 0) / reels.length) : 0;
  const imageAvg = images.length ? Math.round(images.reduce((s: number, p: any) => s + (p.like_count || 0), 0) / images.length) : 0;
  const engRate = posts.length > 0 ? ((totalLikes + totalComments) / posts.length / Math.max(followers, 1) * 100).toFixed(2) : '0';

  const insights: Record<string, number> = {};
  for (const m of igInsights?.data?.data || []) {
    insights[m.name] = m.values?.[m.values.length - 1]?.value || 0;
  }

  const topPosts = [...posts].sort((a: any, b: any) => (b.like_count + b.comments_count) - (a.like_count + a.comments_count)).slice(0, 5);
  const emailList = emails?.data?.messages || emails?.data?.emails || [];
  const guilds = discordGuilds?.data?.details || [];

  return NextResponse.json({
    instagram: {
      profile,
      posts: posts.slice(0, 20).map((p: any) => ({
        id: p.id, caption: p.caption?.slice(0, 150) || '', likes: p.like_count || 0,
        comments: p.comments_count || 0, type: p.media_type, permalink: p.permalink,
        timestamp: p.timestamp,
      })),
      topPosts: topPosts.map((p: any) => ({
        caption: p.caption?.slice(0, 120) || '', likes: p.like_count, comments: p.comments_count,
        type: p.media_type, permalink: p.permalink,
      })),
      insights,
      stats: { followers, following: profile.follows_count || 0, totalPosts: profile.media_count || 0,
        totalLikes, totalComments, engRate, reelAvg, imageAvg, reelCount: reels.length, imageCount: images.length },
    },
    gmail: {
      emails: emailList.slice(0, 10).map((e: any) => ({
        id: e.id || e.messageId, subject: e.subject || '', from: e.from?.text || e.from || e.sender || '',
        snippet: e.snippet || e.text?.slice(0, 100) || '', date: e.date || e.receivedDate || '',
      })),
      totalEmails: emailList.length,
    },
    discord: {
      user: discordUser?.data || {},
      guilds: guilds.map((g: any) => ({ name: g.name, id: g.id, owner: g.owner })),
    },
    metaAds: {
      connected: !!META_TOKEN,
      campaigns: metaAds.campaigns.map((c: any) => ({
        id: c.id, name: c.name, status: c.status, objective: c.objective,
        dailyBudget: c.daily_budget ? (parseInt(c.daily_budget) / 100).toFixed(0) : null,
      })),
      insights: metaAds.insights ? {
        impressions: parseInt(metaAds.insights.impressions || '0'),
        reach: parseInt(metaAds.insights.reach || '0'),
        clicks: parseInt(metaAds.insights.clicks || '0'),
        spend: parseFloat(metaAds.insights.spend || '0').toFixed(2),
        cpc: parseFloat(metaAds.insights.cpc || '0').toFixed(2),
        cpm: parseFloat(metaAds.insights.cpm || '0').toFixed(2),
        ctr: parseFloat(metaAds.insights.ctr || '0').toFixed(2),
      } : null,
    },
    timestamp: new Date().toISOString(),
  });
}
