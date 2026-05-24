import { NextResponse } from 'next/server';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const COMPOSIO_KEY = process.env.COMPOSIO_API_KEY || '';
const IG_ACCOUNT = '108d0d24-67ed-4f96-9605-ebda529f383f';

const BRAND_CONTEXT = `Studex Group CEO Tumelo Ramaphosa. 86K+ IG followers @ramaphosatumelo.
Brand: Black & Gold, "Tip of the Spear", Clinical Luxury, Strategic Predator.
Verticals: Studex Meat (Halaal Wagyu/Ankole), Studex Coffee (Rwanda), Studex Wheat (Uvelka/Russia), Studex AI (Archera), Animal Exchange (Blockchain).
Hooks: Russia-Africa Forum IV, IBA Celebrity Boxing (450 fighters, 41 nations), Dubai Operations, Karongi Rwanda.`;

const DAYS = [
  { day: 1, theme: 'MARKET MAKER', focus: 'Platform credibility, verification, trade infrastructure' },
  { day: 2, theme: 'GENETIC EXCELLENCE', focus: 'Studex Meat, Ankole/Wagyu, Halaal, performance fuel' },
  { day: 3, theme: 'CORRIDOR POWER', focus: 'Trade routes, Russia-Africa, UAE, Uvelka, Rwanda, Dubai' },
  { day: 4, theme: 'DIGITAL INFRASTRUCTURE', focus: 'AI/Archera, blockchain, verification tech' },
  { day: 5, theme: 'PHYSICAL CAPITAL', focus: 'Celebrity Boxing, IBA, athletic excellence, recovery' },
  { day: 6, theme: 'ORIGIN ECONOMY', focus: 'Coffee, wheat, wildlife, food security, conservation' },
  { day: 7, theme: 'THE INVITATION', focus: 'Exclusivity, private accounts, 72-hour verification' },
];

const SLOTS = [
  { time: '00:00', name: 'Recovery Protocol' },
  { time: '04:00', name: "Predator's Hour" },
  { time: '08:00', name: 'Biohacking Breakfast' },
  { time: '12:00', name: 'Power Lunch' },
  { time: '16:00', name: 'Physical Capital' },
  { time: '20:00', name: 'Sovereign Dining' },
];

async function getIGData() {
  try {
    const [userRes, mediaRes] = await Promise.all([
      fetch('https://backend.composio.dev/api/v2/actions/INSTAGRAM_GET_USER_INFO/execute', {
        method: 'POST', headers: { 'x-api-key': COMPOSIO_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectedAccountId: IG_ACCOUNT, input: {} }),
      }),
      fetch('https://backend.composio.dev/api/v2/actions/INSTAGRAM_GET_USER_MEDIA/execute', {
        method: 'POST', headers: { 'x-api-key': COMPOSIO_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectedAccountId: IG_ACCOUNT, input: {} }),
      }),
    ]);
    const user = await userRes.json();
    const media = await mediaRes.json();
    return { user: user?.data, posts: media?.data?.data || [] };
  } catch { return { user: null, posts: [] }; }
}

export async function POST(req: Request) {
  const { action } = await req.json();

  if (action === 'recommend') {
    const { user, posts } = await getIGData();
    const followers = user?.followers_count || 86000;
    const reels = posts.filter((p: any) => p.media_type === 'VIDEO');
    const images = posts.filter((p: any) => p.media_type === 'IMAGE');
    const reelAvg = reels.length ? Math.round(reels.reduce((s: number, p: any) => s + (p.like_count || 0), 0) / reels.length) : 0;
    const imgAvg = images.length ? Math.round(images.reduce((s: number, p: any) => s + (p.like_count || 0), 0) / images.length) : 0;
    const topPosts = [...posts].sort((a: any, b: any) => (b.like_count + b.comments_count) - (a.like_count + a.comments_count)).slice(0, 5);
    const totalEng = posts.reduce((s: number, p: any) => s + (p.like_count || 0) + (p.comments_count || 0), 0);
    const engRate = posts.length ? ((totalEng / posts.length) / followers * 100).toFixed(2) : '0';

    const prompt = `Based on this REAL Instagram data for @ramaphosatumelo, generate a strategic content recommendation.

DATA:
- Followers: ${followers}
- Engagement rate: ${engRate}%
- Reels avg likes: ${reelAvg} | Images avg likes: ${imgAvg}
- Top posts: ${topPosts.map((p: any) => `"${(p.caption || '').slice(0, 60)}" (${p.like_count} likes, ${p.media_type})`).join('; ')}
- Total recent posts: ${posts.length} (${reels.length} reels, ${images.length} images)

Content Siege plan has 7 day themes: ${DAYS.map(d => `Day ${d.day}: ${d.theme}`).join(', ')}

Generate a JSON response with:
{
  "nextPost": { "day": 1-7, "slot": "00:00-20:00", "theme": "...", "reason": "why this is the best next post based on data" },
  "caption": "ready-to-post caption with 20 hashtags",
  "imagePrompt": "detailed Higgsfield prompt for generating the visual, black and gold aesthetic",
  "contentMix": { "reels": "% recommended", "images": "% recommended", "carousels": "% recommended" },
  "insights": ["3-5 data-driven insights about what's working and what to change"],
  "urgentAction": "the single most important thing to do RIGHT NOW"
}

Return ONLY valid JSON.`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 2000, system: BRAND_CONTEXT, messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    let recommendation;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      recommendation = match ? JSON.parse(match[0]) : { error: 'Failed to parse' };
    } catch { recommendation = { raw: text }; }

    return NextResponse.json({
      recommendation,
      stats: { followers, engRate, reelAvg, imgAvg, totalPosts: posts.length, reelCount: reels.length, imageCount: images.length },
      topPosts: topPosts.map((p: any) => ({ caption: (p.caption || '').slice(0, 100), likes: p.like_count, comments: p.comments_count, type: p.media_type, permalink: p.permalink })),
      siegePlan: DAYS,
      slots: SLOTS,
    });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
