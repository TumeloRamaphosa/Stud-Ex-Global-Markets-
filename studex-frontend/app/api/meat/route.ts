import { NextRequest, NextResponse } from 'next/server';

const WAGYU_WHOLESALE: Record<string, Record<string, number>> = {
  'Fillet': { '4/5': 950, '6/7': 1500, '8/9': 1550, '10+': 1650 },
  'Rib-eye': { '4/5': 1500, '6/7': 1750, '8/9': 1950, '10+': 2250 },
  'Rump': { '4/5': 750, '6/7': 950, '8/9': 1250, '10+': 1450 },
  'Picanha': { '4/5': 750, '6/7': 850, '8/9': 1250, '10+': 1550 },
  'T-BONE': { '4/5': 0, '6/7': 0, '8/9': 1850, '10+': 2100 },
  'Sirloin': { '4/5': 950, '6/7': 1350, '8/9': 1550, '10+': 1750 },
  'Silverside': { '4/5': 550, '6/7': 650, '8/9': 850, '10+': 950 },
  'Biltong cuts': { '4/5': 450, '6/7': 550, '8/9': 650, '10+': 750 },
  'Chuck eye': { '4/5': 550, '6/7': 750, '8/9': 950, '10+': 1250 },
  'Brisket': { '4/5': 450, '6/7': 750, '8/9': 850, '10+': 950 },
  'Tmx': { '4/5': 250, '6/7': 250, '8/9': 250, '10+': 250 },
  'Denver': { '4/5': 750, '6/7': 950, '8/9': 1250, '10+': 1450 },
  'Bavette': { '4/5': 650, '6/7': 950, '8/9': 1350, '10+': 1550 },
  'Tri-Tip': { '4/5': 650, '6/7': 1100, '8/9': 1350, '10+': 1550 },
  'Flank': { '4/5': 550, '6/7': 650, '8/9': 750, '10+': 950 },
  'Flat Iron': { '4/5': 550, '6/7': 650, '8/9': 850, '10+': 1150 },
  'Patties': { '4/5': 350, '6/7': 350, '8/9': 350, '10+': 450 },
  'Boerewors': { '4/5': 350, '6/7': 350, '8/9': 350, '10+': 350 },
  'Biltong': { '4/5': 550, '6/7': 550, '8/9': 650, '10+': 750 },
  'Droewors': { '4/5': 550, '6/7': 550, '8/9': 650, '10+': 750 },
};

const ANKOLE_WHOLESALE: Record<string, number> = {
  'Fillet': 1050,
  'Rump': 770,
  'Sirloin': 770,
  'Ribeye': 1050,
  'Mince': 250,
  'Boerewors': 250,
  '1kg T-Bone': 1650,
};

const WAGYU_RETAIL = [
  { name: 'Wagyu Fillet /kg', priceExcl: 550, vat: 82.50, priceIncl: 632.50, category: 'steaks' },
  { name: 'Wagyu Rib-eye /kg', priceExcl: 607.83, vat: 91.17, priceIncl: 699.00, category: 'steaks' },
  { name: 'Wagyu Rump /kg', priceExcl: 460.87, vat: 69.13, priceIncl: 530.00, category: 'steaks' },
  { name: 'Wagyu Picanha', priceExcl: 543.48, vat: 81.52, priceIncl: 625.00, category: 'steaks' },
  { name: 'Wagyu T-bone /kg', priceExcl: 550.00, vat: 82.50, priceIncl: 632.50, category: 'steaks' },
  { name: 'Wagyu Sirloin /kg', priceExcl: 607.83, vat: 91.17, priceIncl: 699.00, category: 'steaks' },
  { name: 'Wagyu Mince /kg', priceExcl: 156.51, vat: 23.48, priceIncl: 179.99, category: 'grinds' },
  { name: 'Wagyu Boerewors /kg', priceExcl: 152.17, vat: 22.83, priceIncl: 175.00, category: 'grinds' },
  { name: 'Wagyu Biltong /kg', priceExcl: 434.78, vat: 65.22, priceIncl: 500.00, category: 'speciality' },
  { name: 'Windpomp Wagyu Droewors', priceExcl: 304.35, vat: 45.65, priceIncl: 350.00, category: 'speciality' },
  { name: 'Wagyu Tomahawk /kg', priceExcl: 139.12, vat: 20.87, priceIncl: 159.99, category: 'steaks' },
  { name: 'Wagyu Tomahawk Frenched', priceExcl: 143.47, vat: 21.52, priceIncl: 164.99, category: 'steaks' },
  { name: 'Wagyu Tri-tip', priceExcl: 478.25, vat: 71.74, priceIncl: 549.99, category: 'steaks' },
  { name: 'Wagyu Bavette', priceExcl: 304.34, vat: 45.65, priceIncl: 349.99, category: 'steaks' },
  { name: 'Wagyu Chuckeye /kg', priceExcl: 217.38, vat: 32.61, priceIncl: 249.99, category: 'steaks' },
  { name: 'Wagyu Denver', priceExcl: 300.00, vat: 45.00, priceIncl: 345.00, category: 'steaks' },
  { name: 'Wagyu Patties (2x200g)', priceExcl: 130.43, vat: 19.56, priceIncl: 149.99, category: 'grinds' },
  { name: 'American Tomahawk', priceExcl: 179.00, vat: 26.85, priceIncl: 205.85, category: 'steaks' },
  { name: 'Lamb Rib/Loin Chops', priceExcl: 208.69, vat: 31.30, priceIncl: 239.99, category: 'speciality' },
  { name: 'de Lange Free Range Biltong', priceExcl: 391.30, vat: 58.70, priceIncl: 450.00, category: 'speciality' },
];

const ANKOLE_RETAIL = [
  { name: 'Ankole Fillet', priceExcl: 599.00, vat: 89.85, priceIncl: 688.85, category: 'steaks' },
  { name: 'Ankole Rump', priceExcl: 499.00, vat: 74.85, priceIncl: 573.85, category: 'steaks' },
  { name: 'Ankole Sirloin', priceExcl: 499.00, vat: 74.85, priceIncl: 573.85, category: 'steaks' },
  { name: 'Ankole Ribeye', priceExcl: 599.00, vat: 89.85, priceIncl: 688.85, category: 'steaks' },
  { name: 'Ankole Mince', priceExcl: 179.00, vat: 26.85, priceIncl: 205.85, category: 'grinds' },
  { name: 'Ankole Boerewors', priceExcl: 179.00, vat: 26.85, priceIncl: 205.85, category: 'grinds' },
  { name: 'Ankole Droewors', priceExcl: 429.00, vat: 64.35, priceIncl: 493.35, category: 'speciality' },
  { name: 'Ankole Gourmet Patties (200g)', priceExcl: 189.00, vat: 28.35, priceIncl: 217.35, category: 'grinds' },
  { name: 'Ankole Espetada', priceExcl: 489.00, vat: 73.35, priceIncl: 562.35, category: 'speciality' },
  { name: 'Ankole Biltong', priceExcl: 459.00, vat: 68.85, priceIncl: 527.85, category: 'speciality' },
  { name: 'Ankole 1kg T-Bone', priceExcl: 499.00, vat: 74.85, priceIncl: 573.85, category: 'steaks' },
  { name: 'Ankole 1kg Tomahawk', priceExcl: 499.00, vat: 0, priceIncl: 499.00, category: 'steaks' },
];

const PENDING_INVOICES = [
  {
    id: 1,
    date: '22 Jan 2026',
    customer: 'The Blockman Parkhurst',
    description: '10 x 500g Wagyu Ribeye',
    marbleScore: '4/5',
    weightKg: 5,
    amount: 8250,
    vat: 1237.50,
    final: 9487.50,
    status: 'Pending',
  },
  {
    id: 2,
    date: '7 Feb 2026',
    customer: 'Daruma',
    description: '2kg Ribeye',
    marbleScore: '7',
    weightKg: 3,
    amount: null,
    vat: null,
    final: null,
    status: 'Pending',
  },
  {
    id: 3,
    date: '2 May 2026',
    customer: 'Big Mouth',
    description: '30 x 250g Wagyu Boerewors',
    marbleScore: null,
    weightKg: 7.5,
    amount: null,
    vat: null,
    final: null,
    status: 'Pending',
  },
];

export async function GET() {
  return NextResponse.json({
    wagyuWholesale: WAGYU_WHOLESALE,
    ankoleWholesale: ANKOLE_WHOLESALE,
    wagyuRetail: WAGYU_RETAIL,
    ankoleRetail: ANKOLE_RETAIL,
    pendingInvoices: PENDING_INVOICES,
    integrations: {
      googleSheets: { status: 'active', sheetId: '1tnBDwEA_BKJMLrXJEVr75YeVh5PK8kgoi9lCRz3k1XY' },
      quickbooks: { status: 'active' },
      googleDrive: { status: 'active' },
      gmail: { status: 'active', notifyEmail: 'info@studexmeat.com' },
      n8n: { status: 'active', instance: 'studexgroup.app.n8n.cloud' },
      flyio: { status: 'active', plan: '$5/month', region: 'jnb' },
      metaAds: { status: 'pending' },
      manusVm: { status: 'pending' },
    },
    vatRate: 0.15,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'calculate-invoice') {
    const { items } = body;
    const lineItems = items.map((item: { weight: number; pricePerKg: number; description: string }) => ({
      description: item.description,
      weight: item.weight,
      pricePerKg: item.pricePerKg,
      lineTotal: item.weight * item.pricePerKg,
    }));
    const subtotal = lineItems.reduce((sum: number, item: { lineTotal: number }) => sum + item.lineTotal, 0);
    const vat = subtotal * 0.15;
    const grandTotal = subtotal + vat;

    return NextResponse.json({ lineItems, subtotal, vat, grandTotal });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
