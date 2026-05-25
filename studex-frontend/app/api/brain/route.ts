import { NextResponse } from 'next/server';

function getPinecone() {
  const { Pinecone } = require('@pinecone-database/pinecone');
  return new Pinecone({ apiKey: process.env.PINECONE_API_KEY || 'missing' });
}

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const INDEX_NAME = process.env.PINECONE_INDEX_MEMORY || 'studex-memory';

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || ''}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  });
  if (!res.ok) {
    const dims = 1536;
    const vec: number[] = [];
    let hash = 0;
    for (let i = 0; i < text.length; i++) { hash = ((hash << 5) - hash) + text.charCodeAt(i); hash |= 0; }
    for (let i = 0; i < dims; i++) { hash = (hash * 16807) % 2147483647; vec.push((hash / 2147483647) * 2 - 1); }
    return vec;
  }
  const data = await res.json();
  return data.data?.[0]?.embedding || [];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'list';

  try {
    const index = getPinecone().index(INDEX_NAME);

    if (action === 'stats') {
      const stats = await index.describeIndexStats();
      return NextResponse.json({ stats });
    }

    if (action === 'list') {
      const query = searchParams.get('q') || '';
      const limit = parseInt(searchParams.get('limit') || '50');

      if (query) {
        const embedding = await getEmbedding(query);
        const results = await index.query({ vector: embedding, topK: limit, includeMetadata: true });
        return NextResponse.json({
          nodes: (results.matches || []).map(m => ({
            id: m.id,
            score: m.score,
            ...m.metadata,
          })),
        });
      }

      const stats = await index.describeIndexStats();
      return NextResponse.json({
        totalVectors: stats.totalRecordCount || 0,
        namespaces: stats.namespaces || {},
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { action } = body;

  try {
    const index = getPinecone().index(INDEX_NAME);

    if (action === 'absorb') {
      const { content, type, source, title } = body;
      const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const embedding = await getEmbedding(content);

      await index.upsert({ records: [{
        id,
        values: embedding,
        metadata: { title: title || content.slice(0, 80), content: content.slice(0, 500), type, source, createdAt: new Date().toISOString() },
      }] });

      return NextResponse.json({ success: true, id });
    }

    if (action === 'absorb_batch') {
      const { items } = body;
      const vectors = await Promise.all(
        items.map(async (item: any) => {
          const id = `${item.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const embedding = await getEmbedding(item.content);
          return {
            id,
            values: embedding,
            metadata: { title: item.title || item.content.slice(0, 80), content: item.content.slice(0, 500), type: item.type, source: item.source, createdAt: new Date().toISOString() },
          };
        })
      );
      await index.upsert({ records: vectors });
      return NextResponse.json({ success: true, count: vectors.length });
    }

    if (action === 'search') {
      const embedding = await getEmbedding(body.query);
      const results = await index.query({ vector: embedding, topK: body.limit || 20, includeMetadata: true });
      return NextResponse.json({
        results: (results.matches || []).map(m => ({ id: m.id, score: m.score, ...m.metadata })),
      });
    }

    if (action === 'absorb_instagram') {
      const composioRes = await fetch('https://backend.composio.dev/api/v2/actions/INSTAGRAM_GET_USER_MEDIA/execute', {
        method: 'POST',
        headers: { 'x-api-key': process.env.COMPOSIO_API_KEY || '', 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectedAccountId: '108d0d24-67ed-4f96-9605-ebda529f383f', input: {} }),
      });
      const igData = await composioRes.json();
      const posts = igData?.data?.data || [];

      const vectors = await Promise.all(
        posts.slice(0, 25).map(async (p: any) => {
          const text = `Instagram ${p.media_type}: ${p.caption || 'No caption'} | Likes: ${p.like_count} | Comments: ${p.comments_count}`;
          const embedding = await getEmbedding(text);
          return {
            id: `ig-${p.id}`,
            values: embedding,
            metadata: {
              title: (p.caption || 'Instagram post').slice(0, 80),
              content: text.slice(0, 500),
              type: 'instagram_post',
              source: 'instagram',
              mediaType: p.media_type,
              likes: p.like_count || 0,
              comments: p.comments_count || 0,
              permalink: p.permalink || '',
              createdAt: p.timestamp || new Date().toISOString(),
            },
          };
        })
      );

      await index.upsert({ records: vectors });
      return NextResponse.json({ success: true, absorbed: vectors.length });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
