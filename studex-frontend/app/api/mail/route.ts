import { NextResponse } from 'next/server';

const API_KEY = process.env.COMPOSIO_API_KEY || '';
const BASE = 'https://backend.composio.dev/api/v2';
const GMAIL_ACCOUNT = '0977bda7-635e-4ce8-8572-5ea6ffe62cd2';

async function executeAction(action: string, accountId: string, input: Record<string, any> = {}) {
  const res = await fetch(`${BASE}/actions/${action}/execute`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ connectedAccountId: accountId, input }),
  });
  return res.json();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'inbox';
  const maxResults = parseInt(searchParams.get('max') || '20');

  try {
    if (action === 'inbox') {
      const result = await executeAction('GMAIL_FETCH_EMAILS', GMAIL_ACCOUNT, { max_results: maxResults });
      return NextResponse.json({
        emails: result?.data?.messages || result?.data?.emails || [],
        source: 'gmail',
      });
    }

    if (action === 'profile') {
      const result = await executeAction('GMAIL_GET_PROFILE', GMAIL_ACCOUNT, {});
      return NextResponse.json({ profile: result?.data });
    }

    if (action === 'labels') {
      const result = await executeAction('GMAIL_LIST_LABELS', GMAIL_ACCOUNT, {});
      return NextResponse.json({ labels: result?.data?.labels || [] });
    }

    if (action === 'threads') {
      const result = await executeAction('GMAIL_LIST_THREADS', GMAIL_ACCOUNT, { max_results: maxResults });
      return NextResponse.json({ threads: result?.data?.threads || [] });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, to, subject, message, threadId } = body;

    if (action === 'send') {
      const result = await executeAction('GMAIL_SEND_EMAIL', GMAIL_ACCOUNT, {
        recipient_email: to,
        subject,
        body: message,
      });
      return NextResponse.json({ success: result.successful, data: result.data });
    }

    if (action === 'reply') {
      const result = await executeAction('GMAIL_REPLY_TO_THREAD', GMAIL_ACCOUNT, {
        thread_id: threadId,
        message_body: message,
      });
      return NextResponse.json({ success: result.successful, data: result.data });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
