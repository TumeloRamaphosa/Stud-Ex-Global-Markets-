import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage, sendOrderUpdate } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  switch (action) {
    case 'send': {
      const result = await sendWhatsAppMessage(body.to, body.message);
      return NextResponse.json({ ok: true, result });
    }

    case 'order_update': {
      const result = await sendOrderUpdate(body.to, body.orderNumber, body.status, body.details);
      return NextResponse.json({ ok: true, result });
    }

    case 'broadcast': {
      const results = await Promise.allSettled(
        body.recipients.map((to: string) => sendWhatsAppMessage(to, body.message))
      );
      return NextResponse.json({ ok: true, sent: results.filter(r => r.status === 'fulfilled').length, total: results.length });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
