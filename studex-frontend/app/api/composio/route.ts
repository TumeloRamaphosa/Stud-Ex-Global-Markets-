import { NextResponse } from 'next/server';

const API_KEY = process.env.COMPOSIO_API_KEY || '';
const BASE = 'https://backend.composio.dev/api/v2';

const ACCOUNTS = {
  instagram: '108d0d24-67ed-4f96-9605-ebda529f383f',
  facebook: '3193a5d4-d47e-447b-9059-b1444e971b2c',
  gmail: '0977bda7-635e-4ce8-8572-5ea6ffe62cd2',
  discord: '10c06475-462d-4283-8bee-fbe86b9c6430',
};

async function executeAction(action: string, accountId: string, input: Record<string, any> = {}) {
  const res = await fetch(`${BASE}/actions/${action}/execute`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ connectedAccountId: accountId, input }),
  });
  return res.json();
}

export async function GET() {
  try {
    const [userInfo, userMedia, userInsights] = await Promise.all([
      executeAction('INSTAGRAM_GET_USER_INFO', ACCOUNTS.instagram),
      executeAction('INSTAGRAM_GET_USER_MEDIA', ACCOUNTS.instagram),
      executeAction('INSTAGRAM_GET_USER_INSIGHTS', ACCOUNTS.instagram, {
        metric: ['reach', 'follower_count', 'profile_views', 'total_interactions', 'likes', 'comments', 'shares', 'saves'],
        period: 'day',
      }),
    ]);

    const posts = userMedia?.data?.data || [];
    const totalLikes = posts.reduce((s: number, p: any) => s + (p.like_count || 0), 0);
    const totalComments = posts.reduce((s: number, p: any) => s + (p.comments_count || 0), 0);
    const avgEngagement = posts.length > 0
      ? ((totalLikes + totalComments) / posts.length / (userInfo?.data?.followers_count || 1) * 100).toFixed(2)
      : '0';

    const insights = (userInsights?.data?.data || []).reduce((acc: any, m: any) => {
      acc[m.name] = m.values;
      return acc;
    }, {});

    return NextResponse.json({
      profile: userInfo?.data || null,
      posts: posts.slice(0, 25).map((p: any) => ({
        id: p.id,
        caption: p.caption?.slice(0, 120) || '',
        likes: p.like_count || 0,
        comments: p.comments_count || 0,
        type: p.media_type,
        permalink: p.permalink,
        thumbnail: p.thumbnail_url || p.media_url,
        timestamp: p.timestamp,
      })),
      insights,
      summary: {
        followers: userInfo?.data?.followers_count || 0,
        following: userInfo?.data?.follows_count || 0,
        totalPosts: userInfo?.data?.media_count || 0,
        recentPostCount: posts.length,
        totalLikes,
        totalComments,
        avgEngagementRate: avgEngagement,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
