import { NextResponse } from 'next/server';

const API_KEY = process.env.COMPOSIO_API_KEY || '';
const BASE = 'https://backend.composio.dev/api/v2';
const IG_ACCOUNT = '108d0d24-67ed-4f96-9605-ebda529f383f';
const FB_ACCOUNT = '3193a5d4-d47e-447b-9059-b1444e971b2c';
const IG_USER_ID = '26555424087418067';

async function executeAction(action: string, accountId: string, input: Record<string, any> = {}) {
  const res = await fetch(`${BASE}/actions/${action}/execute`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ connectedAccountId: accountId, input }),
  });
  return res.json();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, platform, caption, imageUrl, videoUrl, pageId } = body;

    if (action === 'post_instagram_image') {
      const container = await executeAction('INSTAGRAM_CREATE_MEDIA_CONTAINER', IG_ACCOUNT, {
        ig_user_id: IG_USER_ID,
        image_url: imageUrl,
        caption,
      });
      if (!container.successful) return NextResponse.json({ error: container.error }, { status: 400 });
      const creationId = container.data?.id;
      if (!creationId) return NextResponse.json({ error: 'No creation ID returned' }, { status: 400 });

      const post = await executeAction('INSTAGRAM_CREATE_POST', IG_ACCOUNT, {
        ig_user_id: IG_USER_ID,
        creation_id: creationId,
      });
      return NextResponse.json({ success: post.successful, data: post.data, platform: 'instagram' });
    }

    if (action === 'post_instagram_reel') {
      const container = await executeAction('INSTAGRAM_CREATE_MEDIA_CONTAINER', IG_ACCOUNT, {
        ig_user_id: IG_USER_ID,
        video_url: videoUrl,
        caption,
        media_type: 'REELS',
      });
      if (!container.successful) return NextResponse.json({ error: container.error }, { status: 400 });
      return NextResponse.json({
        success: true,
        creationId: container.data?.id,
        message: 'Reel container created. Video is processing — check status before publishing.',
        platform: 'instagram',
      });
    }

    if (action === 'post_facebook') {
      const result = await executeAction('FACEBOOK_CREATE_POST', FB_ACCOUNT, {
        page_id: pageId,
        message: caption,
        link: imageUrl || undefined,
      });
      return NextResponse.json({ success: result.successful, data: result.data, platform: 'facebook' });
    }

    if (action === 'post_facebook_photo') {
      const result = await executeAction('FACEBOOK_CREATE_PHOTO_POST', FB_ACCOUNT, {
        page_id: pageId,
        url: imageUrl,
        caption,
      });
      return NextResponse.json({ success: result.successful, data: result.data, platform: 'facebook' });
    }

    if (action === 'get_ai_advice') {
      const [userInfo, userMedia, insights] = await Promise.all([
        executeAction('INSTAGRAM_GET_USER_INFO', IG_ACCOUNT),
        executeAction('INSTAGRAM_GET_USER_MEDIA', IG_ACCOUNT),
        executeAction('INSTAGRAM_GET_USER_INSIGHTS', IG_ACCOUNT, {
          metric: ['reach', 'total_interactions', 'likes', 'comments', 'shares', 'saves'],
          period: 'day',
        }),
      ]);

      const posts = userMedia?.data?.data || [];
      const followers = userInfo?.data?.followers_count || 0;

      const reels = posts.filter((p: any) => p.media_type === 'VIDEO');
      const images = posts.filter((p: any) => p.media_type === 'IMAGE');
      const reelAvgLikes = reels.length > 0 ? reels.reduce((s: number, p: any) => s + (p.like_count || 0), 0) / reels.length : 0;
      const imageAvgLikes = images.length > 0 ? images.reduce((s: number, p: any) => s + (p.like_count || 0), 0) / images.length : 0;

      const topPosts = [...posts].sort((a: any, b: any) => (b.like_count + b.comments_count) - (a.like_count + a.comments_count)).slice(0, 3);
      const lowPosts = [...posts].sort((a: any, b: any) => (a.like_count + a.comments_count) - (b.like_count + b.comments_count)).slice(0, 3);

      const insightsData = (insights?.data?.data || []).reduce((acc: any, m: any) => {
        const latest = m.values?.[m.values.length - 1]?.value || 0;
        acc[m.name] = latest;
        return acc;
      }, {});

      const totalEngagement = posts.reduce((s: number, p: any) => s + (p.like_count || 0) + (p.comments_count || 0), 0);
      const avgEngRate = posts.length > 0 ? ((totalEngagement / posts.length) / followers * 100) : 0;

      const advice = [];

      if (reelAvgLikes > imageAvgLikes * 1.5) {
        advice.push({ type: 'content', priority: 'high', title: 'Double Down on Reels', text: `Your Reels average ${Math.round(reelAvgLikes)} likes vs ${Math.round(imageAvgLikes)} for images. Shift to 70% Reels content for maximum reach.` });
      } else if (imageAvgLikes > reelAvgLikes * 1.5) {
        advice.push({ type: 'content', priority: 'high', title: 'Your Images Outperform Reels', text: `Images average ${Math.round(imageAvgLikes)} likes vs ${Math.round(reelAvgLikes)} for Reels. Your audience prefers static content — lean into carousels and infographics.` });
      } else {
        advice.push({ type: 'content', priority: 'medium', title: 'Mix Is Balanced', text: `Reels (${Math.round(reelAvgLikes)} avg) and images (${Math.round(imageAvgLikes)} avg) perform similarly. Test carousels for higher save rates.` });
      }

      if (avgEngRate < 1) {
        advice.push({ type: 'engagement', priority: 'high', title: 'Engagement Rate Below 1%', text: `At ${avgEngRate.toFixed(2)}% with ${followers.toLocaleString()} followers, focus on hooks in the first line and strong CTAs. Ask questions, use polls in Stories.` });
      } else if (avgEngRate < 3) {
        advice.push({ type: 'engagement', priority: 'medium', title: 'Engagement Rate Is Average', text: `${avgEngRate.toFixed(2)}% is decent. Push for 3%+ by posting when your audience is most active and replying to every comment within 1 hour.` });
      } else {
        advice.push({ type: 'engagement', priority: 'low', title: 'Strong Engagement Rate', text: `${avgEngRate.toFixed(2)}% is excellent! Maintain this by keeping content authentic and community-focused.` });
      }

      if (topPosts.length > 0) {
        const topTypes = topPosts.map((p: any) => p.media_type);
        const dominantType = topTypes.filter((t: string) => t === 'VIDEO').length > 1 ? 'Reels' : 'Images';
        advice.push({ type: 'pattern', priority: 'high', title: `Top Posts Are ${dominantType}`, text: `Your best performing content: "${topPosts[0]?.caption?.slice(0, 80)}..." with ${topPosts[0]?.like_count} likes. Create more content in this style.` });
      }

      const todayReach = insightsData.reach || 0;
      if (todayReach > 0) {
        const reachToFollowerRatio = (todayReach / followers * 100).toFixed(1);
        advice.push({ type: 'reach', priority: todayReach > followers * 0.1 ? 'low' : 'high', title: `Daily Reach: ${reachToFollowerRatio}% of Followers`, text: todayReach > followers * 0.1 ? 'Great reach! Your content is being shown to a healthy portion of your audience.' : `Only reaching ${reachToFollowerRatio}% of followers. Use trending audio, hashtags, and post at peak hours (check insights for your best times).` });
      }

      advice.push({ type: 'posting', priority: 'medium', title: 'Posting Schedule', text: `With ${posts.length} recent posts, aim for 5-7 posts per week. Best times for SA audiences: 7-8am, 12-1pm, 6-8pm SAST.` });
      advice.push({ type: 'growth', priority: 'medium', title: 'Growth Strategy', text: `At ${followers.toLocaleString()} followers, collaborate with accounts in the 50K-200K range, use 20-25 targeted hashtags, and engage with 30 accounts daily in your niche before posting.` });

      return NextResponse.json({
        advice: advice.sort((a, b) => { const o: any = { high: 0, medium: 1, low: 2 }; return o[a.priority] - o[b.priority]; }),
        stats: { followers, totalPosts: posts.length, avgEngRate: avgEngRate.toFixed(2), todayReach, reelAvgLikes: Math.round(reelAvgLikes), imageAvgLikes: Math.round(imageAvgLikes) },
        topPosts: topPosts.map((p: any) => ({ caption: p.caption?.slice(0, 100), likes: p.like_count, comments: p.comments_count, type: p.media_type, permalink: p.permalink })),
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
