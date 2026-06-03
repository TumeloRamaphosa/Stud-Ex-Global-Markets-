import { NextRequest, NextResponse } from 'next/server';

const FB_API = 'https://graph.facebook.com/v19.0';

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function getFbConfig() {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.META_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_TOKEN;
  if (!pageId || !token) return null;
  return { pageId, token };
}

async function fbFetch(endpoint: string, options?: RequestInit) {
  const config = getFbConfig();
  if (!config) {
    throw new Error('Facebook not configured: FACEBOOK_PAGE_ID and META_ACCESS_TOKEN/FACEBOOK_PAGE_TOKEN are required');
  }
  const separator = endpoint.includes('?') ? '&' : '?';
  const res = await fetch(`${FB_API}${endpoint}${separator}access_token=${config.token}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Facebook API error ${res.status}: ${errorText}`);
  }
  return res.json();
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { action } = body;
  if (!action || typeof action !== 'string') {
    return errorResponse('Missing or invalid "action" field', 400);
  }

  const config = getFbConfig();
  if (!config) {
    return errorResponse('Facebook not configured: FACEBOOK_PAGE_ID and META_ACCESS_TOKEN/FACEBOOK_PAGE_TOKEN are required', 503);
  }

  try {
    switch (action) {
      case 'post_text': {
        if (!body.message) return errorResponse('Missing required field: message', 400);
        const result = await fbFetch(`/${config.pageId}/feed`, {
          method: 'POST',
          body: JSON.stringify({ message: body.message }),
        });
        return NextResponse.json({ ok: true, post: result });
      }

      case 'post_image': {
        if (!body.imageUrl) return errorResponse('Missing required field: imageUrl', 400);
        const result = await fbFetch(`/${config.pageId}/photos`, {
          method: 'POST',
          body: JSON.stringify({
            url: body.imageUrl,
            caption: body.caption,
          }),
        });
        return NextResponse.json({ ok: true, post: result });
      }

      case 'post_video': {
        if (!body.videoUrl) return errorResponse('Missing required field: videoUrl', 400);
        const result = await fbFetch(`/${config.pageId}/videos`, {
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
        if (!body.message || !body.scheduledAt) {
          return errorResponse('Missing required fields: message, scheduledAt', 400);
        }
        const scheduledTime = Math.floor(new Date(String(body.scheduledAt)).getTime() / 1000);
        if (isNaN(scheduledTime)) return errorResponse('Invalid scheduledAt date', 400);
        const result = await fbFetch(`/${config.pageId}/feed`, {
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
        const limit = Number(body.limit) || 25;
        const result = await fbFetch(`/${config.pageId}/feed?limit=${limit}&fields=id,message,created_time,likes.summary(true),comments.summary(true),shares`);
        return NextResponse.json({ ok: true, posts: result });
      }

      case 'delete_post': {
        if (!body.postId) return errorResponse('Missing required field: postId', 400);
        const result = await fbFetch(`/${body.postId}`, { method: 'DELETE' });
        return NextResponse.json({ ok: true, result });
      }

      case 'get_page_insights': {
        const period = body.period || 'day';
        const metrics = body.metrics || 'page_impressions,page_engaged_users,page_post_engagements,page_fans';
        const result = await fbFetch(`/${config.pageId}/insights?metric=${metrics}&period=${period}`);
        return NextResponse.json({ ok: true, insights: result });
      }

      default:
        return errorResponse(`Unknown action: ${action}`, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Facebook request failed';
    console.error(`[facebook/${action}] Error:`, err);
    return errorResponse(message);
  }
}
