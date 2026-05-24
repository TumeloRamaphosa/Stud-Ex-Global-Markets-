import { NextResponse } from 'next/server';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';

const BRAND_CONTEXT = `IDENTITY CONTEXT: Studex Group CEO Tumelo Ramaphosa. 86K+ Instagram followers @ramaphosatumelo.
BRAND DNA: Black & Gold, "Tip of the Spear", Credibility-First, Expansion-Oriented.
PLATFORM: Studex Global Markets (Alibaba meets Bloomberg Terminal for Africa).
TARGET: HNW International Traders, Commodity Buyers, Government Procurement, Elite Athletes.
VERTICALS: Studex Meat (Halaal Wagyu/Ankole), Studex Coffee (Rwanda/Karongi), Studex Wheat (Uvelka/Russia), Studex AI (Archera), Animal Exchange (Blockchain/Wildlife).
RECENT HOOKS: Russia-Africa Forum IV, IBA Celebrity Boxing (450 fighters, 41 nations), Dubai Operations, Karongi Rwanda.
TONE: Strategic Predator. Zero Fluff. Clinical Luxury. Expansion Obsessed.`;

const DAYS = [
  { day: 1, theme: 'MARKET MAKER', focus: 'Platform/Credibility, Verification, Trade Infrastructure, Pre-KYC Advantage' },
  { day: 2, theme: 'GENETIC EXCELLENCE', focus: 'Studex Meat, Ankole/Wagyu as Biological Infrastructure, Halaal Certification, Performance Fuel' },
  { day: 3, theme: 'CORRIDOR POWER', focus: 'Trade Routes, Russia-Africa, UAE, Uvelka Partnership, Rwanda Operations, Dubai Hub' },
  { day: 4, theme: 'DIGITAL INFRASTRUCTURE', focus: 'AI/Archera, Cloud Optimization, Blockchain, Verification Tech' },
  { day: 5, theme: 'PHYSICAL CAPITAL', focus: 'Celebrity Boxing, IBA, Athletic Excellence, Recovery Science' },
  { day: 6, theme: 'ORIGIN ECONOMY', focus: 'Coffee/Wheat/Wildlife, Food Security, Conservation, Vertical Integration' },
  { day: 7, theme: 'THE INVITATION', focus: 'Exclusivity, Application Only, Private Accounts, 72-Hour Verification' },
];

const SLOTS = [
  { time: '00:00', name: 'Recovery Protocol', angle: 'Overnight recovery, 4AM club, biological infrastructure, anabolic recovery' },
  { time: '04:00', name: 'Predator\'s Hour', angle: 'Dawn, corridor power, time zone advantage, pre-market preparation' },
  { time: '08:00', name: 'Biohacking Breakfast', angle: 'Educational authority, macro nutrients, decision quality, certification' },
  { time: '12:00', name: 'Power Lunch', angle: 'Deal flow, relationship building, high-stakes dining, platform UI' },
  { time: '16:00', name: 'Physical Capital', angle: 'Athletic performance, boxing, discipline, corporate athlete' },
  { time: '20:00', name: 'Sovereign Dining', angle: 'Luxury, legacy, braai, gold accents, reward positioning' },
];

export async function POST(req: Request) {
  const { action, day, slot, platform, customPrompt } = await req.json();

  if (action === 'generate_post') {
    const dayInfo = DAYS.find(d => d.day === day) || DAYS[0];
    const slotInfo = SLOTS.find(s => s.time === slot) || SLOTS[0];

    const prompt = customPrompt || `Generate a ${platform || 'Instagram'} post for the 7-Day Content Siege.

DAY ${dayInfo.day}: ${dayInfo.theme}
Focus: ${dayInfo.focus}

TIME SLOT: ${slotInfo.time} — ${slotInfo.name}
Angle: ${slotInfo.angle}

Requirements:
1. Write a powerful caption (150-300 words) matching the brand tone
2. Include a strong hook in the first line (pattern interrupt)
3. Add a clear CTA at the end
4. Include 20-25 relevant hashtags
5. Match the ${slotInfo.name} energy for this time slot
6. Reference specific Studex products/services relevant to this day's theme

Format:
CAPTION:
[the caption]

HASHTAGS:
[hashtags]

IMAGE PROMPT (for AI generation):
[detailed prompt for generating the visual asset in Higgsfield/Stable Diffusion, Black & Gold aesthetic]`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: BRAND_CONTEXT,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    return NextResponse.json({
      content: data.content?.[0]?.text || '',
      day: dayInfo,
      slot: slotInfo,
      platform: platform || 'instagram',
    });
  }

  if (action === 'generate_week') {
    const results = [];
    for (const day of DAYS) {
      for (const slot of SLOTS.slice(0, 2)) {
        const prompt = `Generate a short ${platform || 'Instagram'} caption (50-80 words) for Day ${day.day}: ${day.theme}, ${slot.time} ${slot.name}. Include 10 hashtags. Brand tone: Strategic Predator, Clinical Luxury.`;
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 500, system: BRAND_CONTEXT, messages: [{ role: 'user', content: prompt }] }),
        });
        const data = await res.json();
        results.push({ day: day.day, theme: day.theme, slot: slot.time, slotName: slot.name, caption: data.content?.[0]?.text || '' });
      }
    }
    return NextResponse.json({ posts: results });
  }

  if (action === 'get_plan') {
    return NextResponse.json({ days: DAYS, slots: SLOTS, brandContext: BRAND_CONTEXT });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
