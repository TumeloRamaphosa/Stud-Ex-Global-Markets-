import { NextResponse } from 'next/server';

const API_KEY = process.env.COMPOSIO_API_KEY || '';
const BASE = 'https://backend.composio.dev/api/v2';

const ACCOUNTS = {
  instagram: '108d0d24-67ed-4f96-9605-ebda529f383f',
  facebook: '3193a5d4-d47e-447b-9059-b1444e971b2c',
  gmail: '0977bda7-635e-4ce8-8572-5ea6ffe62cd2',
  discord: '10c06475-462d-4283-8bee-fbe86b9c6430',
};

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
    timestamp: new Date().toISOString(),
  });
}
