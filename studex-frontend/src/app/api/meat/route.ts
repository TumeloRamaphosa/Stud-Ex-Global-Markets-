import { NextRequest, NextResponse } from 'next/server';

interface MeatCut {
  id: string;
  name: string;
  category: string;
  pricePerKg: number;
  marbleScore: string;
  description: string;
  inStock: boolean;
  origin: string;
}

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

const meatCuts: Map<string, MeatCut> = new Map([
  ['wagyu-ribeye', {
    id: 'wagyu-ribeye', name: 'Wagyu Ribeye', category: 'Wagyu', pricePerKg: 2800,
    marbleScore: 'A5', description: 'Premium Japanese-style Wagyu ribeye with exceptional marbling', inStock: true, origin: 'South Africa',
  }],
  ['wagyu-striploin', {
    id: 'wagyu-striploin', name: 'Wagyu Striploin', category: 'Wagyu', pricePerKg: 2400,
    marbleScore: 'A5', description: 'Tender striploin with rich buttery flavor', inStock: true, origin: 'South Africa',
  }],
  ['wagyu-brisket', {
    id: 'wagyu-brisket', name: 'Wagyu Brisket', category: 'Wagyu', pricePerKg: 1600,
    marbleScore: 'A4', description: 'Perfect for slow smoking with deep Wagyu flavor', inStock: true, origin: 'South Africa',
  }],
  ['wagyu-tenderloin', {
    id: 'wagyu-tenderloin', name: 'Wagyu Tenderloin', category: 'Wagyu', pricePerKg: 3200,
    marbleScore: 'A5', description: 'The most tender cut, melt-in-your-mouth texture', inStock: true, origin: 'South Africa',
  }],
  ['wagyu-short-rib', {
    id: 'wagyu-short-rib', name: 'Wagyu Short Rib', category: 'Wagyu', pricePerKg: 1800,
    marbleScore: 'A4', description: 'Rich marbled short rib ideal for braising or grilling', inStock: true, origin: 'South Africa',
  }],
  ['wagyu-rump', {
    id: 'wagyu-rump', name: 'Wagyu Rump', category: 'Wagyu', pricePerKg: 1400,
    marbleScore: 'A3', description: 'Flavorful rump steak with good marbling', inStock: true, origin: 'South Africa',
  }],
  ['wagyu-sirloin', {
    id: 'wagyu-sirloin', name: 'Wagyu Sirloin', category: 'Wagyu', pricePerKg: 2000,
    marbleScore: 'A4', description: 'Classic sirloin elevated with Wagyu marbling', inStock: true, origin: 'South Africa',
  }],
  ['wagyu-chuck', {
    id: 'wagyu-chuck', name: 'Wagyu Chuck', category: 'Wagyu', pricePerKg: 1200,
    marbleScore: 'A3', description: 'Versatile cut great for burgers and slow cooking', inStock: true, origin: 'South Africa',
  }],
]);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cut = searchParams.get('cut');

  if (cut) {
    const key = cut.toLowerCase().replace(/\s+/g, '-');
    const found = meatCuts.get(key) || Array.from(meatCuts.values()).find(
      (c) => c.name.toLowerCase().includes(cut.toLowerCase()) || c.id.includes(key)
    );
    if (!found) {
      return NextResponse.json({ ok: false, error: `Cut not found: ${cut}` }, { status: 404 });
    }
    return NextResponse.json({ ok: true, cut: found });
  }

  return NextResponse.json({ ok: true, cuts: Array.from(meatCuts.values()), total: meatCuts.size });
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

  try {
    switch (action) {
      case 'update_price': {
        if (!body.cutId || typeof body.pricePerKg !== 'number') {
          return errorResponse('Missing required fields: cutId, pricePerKg (number)', 400);
        }
        const key = String(body.cutId).toLowerCase().replace(/\s+/g, '-');
        const cut = meatCuts.get(key);
        if (!cut) {
          return errorResponse(`Cut not found: ${body.cutId}`, 404);
        }
        const oldPrice = cut.pricePerKg;
        cut.pricePerKg = body.pricePerKg as number;
        meatCuts.set(key, cut);
        return NextResponse.json({ ok: true, cut, oldPrice, newPrice: body.pricePerKg });
      }

      case 'add_cut': {
        if (!body.name || typeof body.pricePerKg !== 'number') {
          return errorResponse('Missing required fields: name, pricePerKg (number)', 400);
        }
        const id = String(body.name).toLowerCase().replace(/\s+/g, '-');
        if (meatCuts.has(id)) {
          return errorResponse(`Cut already exists: ${body.name}`, 409);
        }
        const newCut: MeatCut = {
          id,
          name: String(body.name),
          category: String(body.category || 'Wagyu'),
          pricePerKg: body.pricePerKg as number,
          marbleScore: String(body.marbleScore || 'N/A'),
          description: String(body.description || ''),
          inStock: body.inStock !== false,
          origin: String(body.origin || 'South Africa'),
        };
        meatCuts.set(id, newCut);
        return NextResponse.json({ ok: true, cut: newCut });
      }

      default:
        return errorResponse(`Unknown action: ${action}`, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Meat API request failed';
    console.error(`[meat/${action}] Error:`, err);
    return errorResponse(message);
  }
}
