import { NextRequest, NextResponse } from 'next/server';
import { getLLMConfig, setLLMConfig, chatCompletion } from '@/lib/llm';
import { sendOrderUpdate } from '@/lib/whatsapp';
import { notifyAll } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  switch (action) {
    case 'llm_config': {
      setLLMConfig({
        provider: body.provider,
        model: body.ollamaModel || body.model,
        ollamaUrl: body.ollamaUrl,
      });
      return NextResponse.json({ ok: true, config: getLLMConfig() });
    }

    case 'llm_status': {
      return NextResponse.json({ ok: true, config: getLLMConfig() });
    }

    case 'chat': {
      const response = await chatCompletion(body.messages || [{ role: 'user', content: body.prompt }]);
      return NextResponse.json({ ok: true, response });
    }

    case 'whatsapp_order_update': {
      const result = await sendOrderUpdate(body.to, body.orderNumber, body.status, body.details);
      await notifyAll(`📦 WhatsApp order update sent: #${body.orderNumber} → ${body.status}`);
      return NextResponse.json({ ok: true, result });
    }

    case 'analyze_revenue': {
      const prompt = `Analyze this revenue data for Studex Meat and provide insights:\n${JSON.stringify(body.data)}`;
      const response = await chatCompletion([{ role: 'user', content: prompt }]);
      return NextResponse.json({ ok: true, analysis: response });
    }

    case 'customer_outreach': {
      const prompt = `Generate a personalized outreach message for this customer:\nName: ${body.customerName}\nHistory: ${JSON.stringify(body.orderHistory)}\nTone: Professional, warm, meat-enthusiast`;
      const response = await chatCompletion([{ role: 'user', content: prompt }]);
      return NextResponse.json({ ok: true, message: response });
    }

    case 'daily_report': {
      const prompt = `Generate a daily business report for Studex Meat for ${body.date || 'today'}.\nSales data: ${JSON.stringify(body.salesData || {})}\nOrders: ${JSON.stringify(body.orders || [])}\nInclude: revenue summary, top products, order count, and actionable insights.`;
      const response = await chatCompletion([{ role: 'user', content: prompt }]);
      return NextResponse.json({ ok: true, report: response });
    }

    case 'weekly_summary': {
      const prompt = `Generate a weekly performance summary for Studex Meat.\nWeek: ${body.weekStart || 'current'} to ${body.weekEnd || 'now'}\nData: ${JSON.stringify(body.data || {})}\nInclude: week-over-week trends, top customers, best-selling cuts, and recommendations.`;
      const response = await chatCompletion([{ role: 'user', content: prompt }]);
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
      await notifyAll('🔔 Reorder alert analysis complete');
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
      await notifyAll('📦 Inventory alert check complete');
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
        whatsapp: { status: process.env.WHATSAPP_TOKEN ? 'configured' : 'not_configured' },
        shopify: { status: process.env.SHOPIFY_ACCESS_TOKEN ? 'configured' : 'not_configured' },
        quickbooks: { status: process.env.QUICKBOOKS_CLIENT_ID ? 'configured' : 'not_configured' },
        n8n: { status: process.env.N8N_RUNNER_URL ? 'configured' : 'not_configured' },
        hermes: { status: process.env.HERMES_URL ? 'configured' : 'not_configured' },
        facebook: { status: process.env.FACEBOOK_PAGE_TOKEN ? 'configured' : 'not_configured' },
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
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ service: 'CashClaw', status: 'running', config: getLLMConfig() });
}
