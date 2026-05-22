import { NextResponse } from 'next/server';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';

interface Draft {
  id: string;
  status: 'draft' | 'pending' | 'approved' | 'scheduled' | 'published' | 'rejected';
  caption: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'carousel';
  platforms: string[];
  hashtags: string[];
  scheduledAt: string | null;
  publishedAt: string | null;
  generatedBy: string;
  abVariant: string | null;
  abGroupId: string | null;
  rejectedReason: string | null;
  createdAt: string;
}

let drafts: Draft[] = [];

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

export async function GET() {
  return NextResponse.json({ drafts });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { action } = body;

  if (action === 'create') {
    const draft: Draft = {
      id: genId(),
      status: 'pending',
      caption: body.caption || '',
      mediaUrl: body.mediaUrl || '',
      mediaType: body.mediaType || 'image',
      platforms: body.platforms || ['instagram'],
      hashtags: body.hashtags || [],
      scheduledAt: body.scheduledAt || null,
      publishedAt: null,
      generatedBy: body.generatedBy || 'manual',
      abVariant: body.abVariant || null,
      abGroupId: body.abGroupId || null,
      rejectedReason: null,
      createdAt: new Date().toISOString(),
    };
    drafts.unshift(draft);
    return NextResponse.json({ draft });
  }

  if (action === 'approve') {
    const draft = drafts.find(d => d.id === body.id);
    if (!draft) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    draft.status = body.scheduledAt ? 'scheduled' : 'approved';
    draft.scheduledAt = body.scheduledAt || null;
    return NextResponse.json({ draft });
  }

  if (action === 'reject') {
    const draft = drafts.find(d => d.id === body.id);
    if (!draft) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    draft.status = 'rejected';
    draft.rejectedReason = body.reason || '';
    return NextResponse.json({ draft });
  }

  if (action === 'publish') {
    const draft = drafts.find(d => d.id === body.id);
    if (!draft) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    draft.status = 'published';
    draft.publishedAt = new Date().toISOString();
    return NextResponse.json({ draft });
  }

  if (action === 'update') {
    const draft = drafts.find(d => d.id === body.id);
    if (!draft) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (body.caption !== undefined) draft.caption = body.caption;
    if (body.mediaUrl !== undefined) draft.mediaUrl = body.mediaUrl;
    if (body.platforms !== undefined) draft.platforms = body.platforms;
    if (body.scheduledAt !== undefined) draft.scheduledAt = body.scheduledAt;
    return NextResponse.json({ draft });
  }

  if (action === 'delete') {
    drafts = drafts.filter(d => d.id !== body.id);
    return NextResponse.json({ success: true });
  }

  if (action === 'generate_variants') {
    const groupId = genId();
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: `Generate 3 Instagram caption variants for A/B testing. Topic: "${body.topic}". Each variant should have a different hook style (question, bold statement, story). Include 20 relevant hashtags per variant. Format as JSON array: [{"variant":"A","caption":"..."},{"variant":"B","caption":"..."},{"variant":"C","caption":"..."}]. Return ONLY the JSON array, no other text.` }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || '[]';
    let variants;
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      variants = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch { variants = []; }

    const newDrafts: Draft[] = variants.map((v: any) => ({
      id: genId(),
      status: 'pending' as const,
      caption: v.caption || '',
      mediaUrl: body.mediaUrl || '',
      mediaType: body.mediaType || 'image',
      platforms: body.platforms || ['instagram'],
      hashtags: [],
      scheduledAt: null,
      publishedAt: null,
      generatedBy: 'claude-ab-test',
      abVariant: v.variant || '',
      abGroupId: groupId,
      rejectedReason: null,
      createdAt: new Date().toISOString(),
    }));

    drafts.unshift(...newDrafts);
    return NextResponse.json({ variants: newDrafts, groupId });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
