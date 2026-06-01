import { NextRequest, NextResponse } from 'next/server';

const FB_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const FB_PAGE_TOKEN = process.env.FACEBOOK_PAGE_TOKEN;
const FB_API = `https://graph.facebook.com/v19.0`;

async function fbFetch(endpoint: string, options?: RequestInit) {
  const separator = endpoint.includes('?') ? '&' : '?';
  const res = await fetch(`${FB_API}${endpoint}${separator}access_token=${FB_PAGE_TOKEN}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  return res.json();
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  switch (action) {
    case 'post_text': {
      const result = await fbFetch(`/${FB_PAGE_ID}/feed`, {
        method: 'POST',
        body: JSON.stringify({ message: body.message }),
      });
      return NextResponse.json({ ok: true, post: result });
    }

    case 'post_image': {
      const result = await fbFetch(`/${FB_PAGE_ID}/photos`, {
        method: 'POST',
        body: JSON.stringify({
          url: body.imageUrl,
          caption: body.caption,
        }),
      });
      return NextResponse.json({ ok: true, post: result });
    }

    case 'post_video': {
      const result = await fbFetch(`/${FB_PAGE_ID}/videos`, {
        method: 'POST',
        body: JSON.stringify({
          file_url: body.videoUrl,
          description: body.description,
          title: body.title,
        }),
      });
      return NextResponse.json({ ok: true, post: result });
    }

    case 'schedule_post': {
      const scheduledTime = Math.floor(new Date(body.scheduledAt).getTime() / 1000);
      const result = await fbFetch(`/${FB_PAGE_ID}/feed`, {
        method: 'POST',
        body: JSON.stringify({
          message: body.message,
          published: false,
          scheduled_publish_time: scheduledTime,
        }),
      });
      return NextResponse.json({ ok: true, post: result });
    }

    case 'get_posts': {
      const limit = body.limit || 25;
      const result = await fbFetch(`/${FB_PAGE_ID}/feed?limit=${limit}&fields=id,message,created_time,likes.summary(true),comments.summary(true),shares`);
      return NextResponse.json({ ok: true, posts: result });
    }

    case 'delete_post': {
      const result = await fbFetch(`/${body.postId}`, { method: 'DELETE' });
      return NextResponse.json({ ok: true, result });
    }

    case 'get_page_insights': {
      const period = body.period || 'day';
      const metrics = body.metrics || 'page_impressions,page_engaged_users,page_post_engagements,page_fans';
      const result = await fbFetch(`/${FB_PAGE_ID}/insights?metric=${metrics}&period=${period}`);
      return NextResponse.json({ ok: true, insights: result });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
