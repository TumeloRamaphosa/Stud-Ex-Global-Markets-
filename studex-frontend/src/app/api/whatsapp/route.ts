import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage, sendOrderUpdate } from '@/lib/whatsapp';

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
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
      case 'send': {
        if (!body.to || !body.message) {
          return errorResponse('Missing required fields: to, message', 400);
        }
        const result = await sendWhatsAppMessage(String(body.to), String(body.message));
        return NextResponse.json({ ok: true, result });
      }

      case 'order_update': {
        if (!body.to || !body.orderNumber || !body.status) {
          return errorResponse('Missing required fields: to, orderNumber, status', 400);
        }
        const result = await sendOrderUpdate(
          String(body.to),
          String(body.orderNumber),
          String(body.status),
          String(body.details || ''),
        );
        return NextResponse.json({ ok: true, result });
      }

      case 'broadcast': {
        if (!body.recipients || !Array.isArray(body.recipients) || body.recipients.length === 0) {
          return errorResponse('Missing or empty "recipients" array', 400);
        }
        if (!body.message) return errorResponse('Missing required field: message', 400);
        const results = await Promise.allSettled(
          (body.recipients as string[]).map((to: string) => sendWhatsAppMessage(to, String(body.message)))
        );
        return NextResponse.json({
          ok: true,
          sent: results.filter(r => r.status === 'fulfilled').length,
          failed: results.filter(r => r.status === 'rejected').length,
          total: results.length,
        });
      }

      default:
        return errorResponse(`Unknown action: ${action}`, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'WhatsApp request failed';
    console.error(`[whatsapp/${action}] Error:`, err);
    return errorResponse(message);
  }
}
