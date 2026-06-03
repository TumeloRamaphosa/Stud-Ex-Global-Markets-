import { NextRequest, NextResponse } from 'next/server';
import { getLLMConfig, setLLMConfig, chatCompletion, type LLMProvider } from '@/lib/llm';
import { sendOrderUpdate } from '@/lib/whatsapp';
import { notifyAll } from '@/lib/notifications';
import { recordAgentEvent } from '@/lib/agent-memory';

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
      case 'llm_config': {
        setLLMConfig({
          provider: body.provider as LLMProvider | undefined,
          model: (body.ollamaModel || body.model) as string | undefined,
          ollamaUrl: body.ollamaUrl as string | undefined,
        });
        return NextResponse.json({ ok: true, config: getLLMConfig() });
      }

      case 'llm_status': {
        return NextResponse.json({ ok: true, config: getLLMConfig() });
      }

      case 'chat': {
        const messages = (body.messages as { role: string; content: string }[]) || [{ role: 'user', content: String(body.prompt || '') }];
        const response = await chatCompletion(messages);
        await recordAgentEvent({
          agent: 'CashClaw',
          action: 'chat',
          status: 'completed',
          summary: String(body.prompt || 'Chat request completed.'),
          source: '/api/agent',
          details: {
            messages: Array.isArray(body.messages) ? body.messages.length : 1,
            responsePreview: String(response).slice(0, 240),
          },
        });
        return NextResponse.json({ ok: true, response });
      }

      case 'whatsapp_order_update': {
        if (!body.to || !body.orderNumber || !body.status) {
          return errorResponse('Missing required fields: to, orderNumber, status', 400);
        }
        const result = await sendOrderUpdate(
          String(body.to),
          String(body.orderNumber),
          String(body.status),
          String(body.details || ''),
        );
        await notifyAll(`Order update sent: #${body.orderNumber} -> ${body.status}`);
        await recordAgentEvent({
          agent: 'CashClaw',
          action: 'whatsapp_order_update',
          status: 'completed',
          summary: `WhatsApp order update sent for order #${body.orderNumber}.`,
          source: '/api/agent',
          details: {
            to: body.to as string,
            orderNumber: body.orderNumber as string,
            status: body.status as string,
          },
        });
        return NextResponse.json({ ok: true, result });
      }

      case 'analyze_revenue': {
        const prompt = `Analyze this revenue data for Studex Meat and provide insights:\n${JSON.stringify(body.data || {})}`;
        const response = await chatCompletion([{ role: 'user', content: prompt }]);
        return NextResponse.json({ ok: true, analysis: response });
      }

      case 'customer_outreach': {
        if (!body.customerName) {
          return errorResponse('Missing required field: customerName', 400);
        }
        const prompt = `Generate a personalized outreach message for this customer:\nName: ${body.customerName}\nHistory: ${JSON.stringify(body.orderHistory || [])}\nTone: Professional, warm, meat-enthusiast`;
        const response = await chatCompletion([{ role: 'user', content: prompt }]);
        return NextResponse.json({ ok: true, message: response });
      }

      case 'daily_report': {
        const prompt = `Generate a daily business report for Studex Meat for ${body.date || 'today'}.\nSales data: ${JSON.stringify(body.salesData || {})}\nOrders: ${JSON.stringify(body.orders || [])}\nInclude: revenue summary, top products, order count, and actionable insights.`;
        const response = await chatCompletion([{ role: 'user', content: prompt }]);
        await recordAgentEvent({
          agent: 'CashClaw',
          action: 'daily_report',
          status: 'completed',
          summary: `Daily business report generated for ${body.date || 'today'}.`,
          source: '/api/agent',
          details: {
            date: (body.date || 'today') as string,
            responsePreview: String(response).slice(0, 240),
          },
        });
        return NextResponse.json({ ok: true, report: response });
      }

      case 'weekly_summary': {
        const prompt = `Generate a weekly performance summary for Studex Meat.\nWeek: ${body.weekStart || 'current'} to ${body.weekEnd || 'now'}\nData: ${JSON.stringify(body.data || {})}\nInclude: week-over-week trends, top customers, best-selling cuts, and recommendations.`;
        const response = await chatCompletion([{ role: 'user', content: prompt }]);
        await recordAgentEvent({
          agent: 'CashClaw',
          action: 'weekly_summary',
          status: 'completed',
          summary: `Weekly business summary generated for ${body.weekStart || 'current'} to ${body.weekEnd || 'now'}.`,
          source: '/api/agent',
          details: {
            weekStart: (body.weekStart || 'current') as string,
            weekEnd: (body.weekEnd || 'now') as string,
            responsePreview: String(response).slice(0, 240),
          },
        });
        return NextResponse.json({ ok: true, summary: response });
      }

      case 'customer_segment': {
        const prompt = `Segment these customers by purchase history and behavior for Studex Meat:\nCustomers: ${JSON.stringify(body.customers || [])}\nCreate segments like: VIP, Regular, At-Risk, New, Dormant. Include recommendations for each segment.`;
        const response = await chatCompletion([{ role: 'user', content: prompt }]);
        return NextResponse.json({ ok: true, segments: response });
      }

      case 'reorder_alert': {
        const prompt = `Analyze these customer order histories and identify customers due for reorder:\nCustomers: ${JSON.stringify(body.customers || [])}\nAverage reorder cycle: ${body.cycleDays || 14} days\nReturn a list of customers to contact with personalized reorder suggestions.`;
        const response = await chatCompletion([{ role: 'user', content: prompt }]);
        await notifyAll('Reorder alert analysis complete');
        return NextResponse.json({ ok: true, alerts: response });
      }

      case 'price_optimize': {
        const prompt = `Suggest price optimizations for Studex Meat products:\nCurrent prices: ${JSON.stringify(body.prices || {})}\nSales volume: ${JSON.stringify(body.salesVolume || {})}\nCost data: ${JSON.stringify(body.costs || {})}\nMarket conditions: ${body.marketNotes || 'standard'}\nProvide specific price adjustment recommendations with expected impact.`;
        const response = await chatCompletion([{ role: 'user', content: prompt }]);
        return NextResponse.json({ ok: true, optimizations: response });
      }

      case 'competitor_scan': {
        const prompt = `Analyze competitor pricing for the premium meat market:\nOur prices: ${JSON.stringify(body.ourPrices || {})}\nCompetitor data: ${JSON.stringify(body.competitorData || {})}\nRegion: ${body.region || 'South Africa'}\nIdentify pricing gaps, opportunities, and threats.`;
        const response = await chatCompletion([{ role: 'user', content: prompt }]);
        return NextResponse.json({ ok: true, analysis: response });
      }

      case 'inventory_alert': {
        const prompt = `Review inventory levels and generate alerts for Studex Meat:\nInventory: ${JSON.stringify(body.inventory || [])}\nThresholds: ${JSON.stringify(body.thresholds || {})}\nFlag low-stock items, suggest reorder quantities, and prioritize by sales velocity.`;
        const response = await chatCompletion([{ role: 'user', content: prompt }]);
        await notifyAll('Inventory alert check complete');
        return NextResponse.json({ ok: true, alerts: response });
      }

      case 'forecast': {
        const prompt = `Generate a sales forecast for Studex Meat:\nHistorical data: ${JSON.stringify(body.historicalData || {})}\nPeriod: ${body.period || 'next 30 days'}\nSeasonality notes: ${body.seasonality || 'none'}\nProvide projected revenue, top cuts forecast, and confidence levels.`;
        const response = await chatCompletion([{ role: 'user', content: prompt }]);
        return NextResponse.json({ ok: true, forecast: response });
      }

      case 'health_check': {
        const config = getLLMConfig();
        const services = {
          llm: { status: 'ok', config },
          whatsapp: { status: process.env.WHATSAPP_ACCESS_TOKEN ? 'configured' : 'not_configured' },
          shopify: { status: process.env.SHOPIFY_ACCESS_TOKEN ? 'configured' : 'not_configured' },
          quickbooks: { status: process.env.QUICKBOOKS_CLIENT_ID ? 'configured' : 'not_configured' },
          n8n: { status: process.env.N8N_RUNNER_URL ? 'configured' : 'not_configured' },
          hermes: { status: process.env.HERMES_URL ? 'configured' : 'not_configured' },
          facebook: { status: (process.env.META_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_TOKEN) ? 'configured' : 'not_configured' },
          memory: {
            status: process.env.OBSIDIAN_VAULT_PATH ? 'configured' : 'not_configured',
            obsidianVault: process.env.OBSIDIAN_VAULT_PATH ? 'set' : 'unset',
            tencent: process.env.TENCENT_MEMORY_URL ? 'configured' : 'not_configured',
            localFirst: process.env.LOCAL_FIRST_LLM === 'true' ? 'enabled' : 'disabled',
            ollama: process.env.OLLAMA_URL ? 'configured' : 'not_configured',
          },
        };
        return NextResponse.json({
          ok: true,
          service: 'CashClaw',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          services,
        });
      }

      default:
        return errorResponse(`Unknown action: ${action}`, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error(`[agent/${action}] Error:`, err);
    return errorResponse(message);
  }
}

export async function GET() {
  return NextResponse.json({ service: 'CashClaw', status: 'running', config: getLLMConfig() });
}
