import { NextResponse } from 'next/server';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';

export async function POST(req: Request) {
  const { message, platformData } = await req.json();

  const systemPrompt = `You are the Stud-Ex AI Strategy Advisor — a world-class social media strategist and business intelligence analyst for @ramaphosatumelo (86K+ followers on Instagram).

You have access to real platform data. Here is the current data:

INSTAGRAM:
- Followers: ${platformData?.instagram?.stats?.followers || 'N/A'}
- Engagement Rate: ${platformData?.instagram?.stats?.engRate || 'N/A'}%
- Reel Avg Likes: ${platformData?.instagram?.stats?.reelAvg || 'N/A'}
- Image Avg Likes: ${platformData?.instagram?.stats?.imageAvg || 'N/A'}
- Recent Reach: ${platformData?.instagram?.insights?.reach || 'N/A'}
- Total Interactions: ${platformData?.instagram?.insights?.total_interactions || 'N/A'}

TOP PERFORMING POSTS:
${(platformData?.instagram?.topPosts || []).map((p: any, i: number) => `${i + 1}. [${p.type}] ${p.likes} likes, ${p.comments} comments — "${p.caption}"`).join('\n')}

RECENT POSTS:
${(platformData?.instagram?.posts || []).slice(0, 5).map((p: any) => `- [${p.type}] ${p.likes} likes — "${p.caption}"`).join('\n')}

GMAIL: ${platformData?.gmail?.totalEmails || 0} recent emails
DISCORD: ${platformData?.discord?.guilds?.length || 0} servers

Rules:
- Give specific, actionable advice based on the REAL data above
- Reference actual post performance when recommending content
- Be direct and concise — no fluff
- When asked to write captions, include hashtags (20-25 relevant ones)
- When suggesting content strategy, base it on what's actually working
- Format responses with clear headers and bullet points
- You can generate caption ideas, hashtag strategies, posting schedules, and content plans`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    });
    const data = await res.json();
    return NextResponse.json({ reply: data.content?.[0]?.text || 'No response', tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
