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
      return NextResponse.json({ error: `Cut not found: ${cut}` }, { status: 404 });
    }
    return NextResponse.json({ ok: true, cut: found });
  }

  return NextResponse.json({ ok: true, cuts: Array.from(meatCuts.values()), total: meatCuts.size });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  switch (action) {
    case 'update_price': {
      const key = body.cutId?.toLowerCase().replace(/\s+/g, '-');
      const cut = meatCuts.get(key);
      if (!cut) {
        return NextResponse.json({ error: `Cut not found: ${body.cutId}` }, { status: 404 });
      }
      const oldPrice = cut.pricePerKg;
      cut.pricePerKg = body.pricePerKg;
      meatCuts.set(key, cut);
      return NextResponse.json({ ok: true, cut, oldPrice, newPrice: body.pricePerKg });
    }

    case 'add_cut': {
      const id = body.name.toLowerCase().replace(/\s+/g, '-');
      if (meatCuts.has(id)) {
        return NextResponse.json({ error: `Cut already exists: ${body.name}` }, { status: 409 });
      }
      const newCut: MeatCut = {
        id,
        name: body.name,
        category: body.category || 'Wagyu',
        pricePerKg: body.pricePerKg,
        marbleScore: body.marbleScore || 'N/A',
        description: body.description || '',
        inStock: body.inStock ?? true,
        origin: body.origin || 'South Africa',
      };
      meatCuts.set(id, newCut);
      return NextResponse.json({ ok: true, cut: newCut });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
