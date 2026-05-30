import { NextRequest, NextResponse } from 'next/server';

// ─── CashClaw Agent — StudEx Meat AI Operations Agent ───────────────────────
// Autonomous agent that controls the meat store operations.
// Connects to: Shopify, QuickBooks, AgentMail, Slack, Discord, n8n
// Reports to: Tumelo via Slack + Discord
// Runs workflows: content creation, email campaigns, revenue optimization
//
// API-driven: call POST /api/agent with an action to trigger agent tasks
//
// ENV VARS:
//   ANTHROPIC_API_KEY     — for Claude AI reasoning
//   SLACK_WEBHOOK_URL     — Slack incoming webhook for reports
//   DISCORD_WEBHOOK_URL   — Discord webhook for reports
//   AGENTMAIL_API_KEY     — for mass email campaigns
//   AGENTMAIL_INBOX_ID    — CashClaw's inbox
// ────────────────────────────────────────────────────────────────────────────

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL || '';
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL || '';
const HERMES_URL = process.env.HERMES_AGENT_URL || 'http://localhost:3004';
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

// Flexible LLM config — switch between cloud API and local Ollama
let LLM_PROVIDER = process.env.LLM_PROVIDER || 'anthropic';
let OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
let OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'hermes3:8b';

const APP_BASE = process.env.NEXT_PUBLIC_APP_URL || '';

async function internalFetch(path: string, body: object) {
  const base = APP_BASE || 'http://localhost:3000';
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function callLLM(systemPrompt: string, userMessage: string, provider?: string, model?: string): Promise<string> {
  const p = provider || LLM_PROVIDER;

  if (p === 'ollama') {
    const m = model || OLLAMA_MODEL;
    try {
      const res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: m, stream: false,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        }),
      });
      const data = await res.json();
      return data.message?.content || '';
    } catch {
      return `[Ollama not reachable at ${OLLAMA_URL} — set LLM_PROVIDER=anthropic or start Ollama]`;
    }
  }

  // Default: Anthropic Claude
  if (!ANTHROPIC_API_KEY) return '[No API key configured — set ANTHROPIC_API_KEY or use LLM_PROVIDER=ollama]';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error: ${err}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

async function sendWhatsApp(to: string, message: string) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) return { skipped: true, reason: 'WhatsApp not configured' };
  const res = await fetch(`https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    }),
  });
  return res.json();
}

async function postToSlack(message: string, blocks?: object[]) {
  if (!SLACK_WEBHOOK) return { skipped: true, reason: 'No Slack webhook configured' };
  const payload: any = { text: message };
  if (blocks) payload.blocks = blocks;
  const res = await fetch(SLACK_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return { sent: res.ok };
}

async function postToDiscord(content: string, embeds?: object[]) {
  if (!DISCORD_WEBHOOK) return { skipped: true, reason: 'No Discord webhook configured' };
  const payload: any = { content };
  if (embeds) payload.embeds = embeds;
  const res = await fetch(DISCORD_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return { sent: res.ok };
}

function mockResponse(action: string) {
  const mocks: Record<string, object> = {
    status: {
      mock: true,
      agent: 'CashClaw',
      status: 'ready',
      connectedServices: {
        shopify: true, quickbooks: true, agentmail: true,
        slack: !!SLACK_WEBHOOK, discord: !!DISCORD_WEBHOOK,
        claude: !!ANTHROPIC_API_KEY,
      },
    },
    daily_report: {
      mock: true,
      report: {
        date: new Date().toISOString().slice(0, 10),
        revenue_mtd: 'R189,000',
        orders_today: 3,
        unpaid_invoices: 2,
        inventory_alerts: ['Wagyu Burger Patties: -248', 'Tomahawk: -209'],
        email_campaign_pending: 'biltong_promo (150 recipients)',
        recommendation: 'Run biltong promo campaign — biltong has 35% margin and low stock turnover needs a push.',
      },
    },
  };
  return mocks[action] || { mock: true, action };
}

export async function GET(req: NextRequest) {
  const test = req.nextUrl.searchParams.get('test');
  if (test === '1') return NextResponse.json(mockResponse('status'));

  return NextResponse.json({
    agent: 'CashClaw',
    version: '1.0.0',
    description: 'StudEx Meat AI Operations Agent — controls store, invoices, email campaigns, and reports',
    status: 'ready',
    capabilities: {
      claude: !!ANTHROPIC_API_KEY,
      slack: !!SLACK_WEBHOOK,
      discord: !!DISCORD_WEBHOOK,
    },
    workflows: [
      'daily_report         — Generate + send daily operations report',
      'generate_content     — Create social/email content from store data',
      'run_email_campaign   — Send mass email using AgentMail template',
      'revenue_analysis     — Analyze revenue and suggest optimizations',
      'inventory_check      — Check stock levels and alert on issues',
      'invoice_pipeline     — Process pending invoices through QuickBooks',
      'customer_outreach    — Identify and email lapsed customers',
      'report_slack         — Post a report to Slack',
      'report_discord       — Post a report to Discord',
      'ask_agent            — Ask CashClaw a question about the business',
    ],
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  const test = req.nextUrl.searchParams.get('test');
  if (test === '1') return NextResponse.json(mockResponse(action));

  try {
    // ─── DAILY REPORT ─────────────────────────────────────────────────

    if (action === 'daily_report') {
      const [shopifyData, qbData, agentmailData] = await Promise.allSettled([
        internalFetch('/api/shopify', { action: 'store_overview' }),
        internalFetch('/api/quickbooks', { action: 'invoices_unpaid' }),
        internalFetch('/api/agentmail', { action: 'get_metrics' }),
      ]);

      const shopify = shopifyData.status === 'fulfilled' ? shopifyData.value : null;
      const qb = qbData.status === 'fulfilled' ? qbData.value : null;
      const mail = agentmailData.status === 'fulfilled' ? agentmailData.value : null;

      const reportData = {
        date: new Date().toISOString().slice(0, 10),
        shopify: shopify || { error: 'Could not reach Shopify' },
        quickbooks: qb || { error: 'Could not reach QuickBooks' },
        agentmail: mail || { error: 'Could not reach AgentMail' },
      };

      const aiAnalysis = await callLLM(
        `You are CashClaw, the AI operations agent for StudEx Meat (studexmeat.com), a premium Wagyu and Ankole beef store in South Africa. Analyze the daily data and provide a concise operations report with 3 key insights and 2 action items. Keep it under 300 words. Use ZAR (R) for currency.`,
        `Today's data:\n${JSON.stringify(reportData, null, 2)}`
      );

      const report = {
        ...reportData,
        aiAnalysis,
        generatedAt: new Date().toISOString(),
      };

      const channels = body.channels || ['slack', 'discord'];
      const notifications: any = {};

      const slackMessage = `🥩 *CashClaw Daily Report — ${report.date}*\n\n${aiAnalysis}`;
      const discordMessage = `**🥩 CashClaw Daily Report — ${report.date}**\n\n${aiAnalysis}`;

      if (channels.includes('slack')) {
        notifications.slack = await postToSlack(slackMessage);
      }
      if (channels.includes('discord')) {
        notifications.discord = await postToDiscord(discordMessage);
      }

      return NextResponse.json({ report, notifications });
    }

    // ─── GENERATE CONTENT ─────────────────────────────────────────────

    if (action === 'generate_content') {
      const { contentType, product, platform } = body;
      const type = contentType || 'social_post';
      const prod = product || 'Wagyu Biltong';
      const plat = platform || 'instagram';

      const [shopifyData, analyticsHint] = await Promise.allSettled([
        internalFetch('/api/shopify', { action: 'products_top_revenue' }),
        internalFetch('/api/meat', {}),
      ]);

      const topProducts = shopifyData.status === 'fulfilled' ? shopifyData.value : {};
      const meatData = analyticsHint.status === 'fulfilled' ? analyticsHint.value : {};

      const content = await callLLM(
        `You are CashClaw, the AI content creator for StudEx Meat (studexmeat.com). Create ${type} content for ${plat}. Brand voice: premium, sophisticated, African heritage pride. Colours: gold (#D4A017) and cream. Always include a call to action. Use South African English.`,
        `Create a ${type} about ${prod}.\n\nTop selling products: ${JSON.stringify(topProducts?.top_products?.slice(0, 5) || [])}\n\nProduct catalog context: ${JSON.stringify(meatData?.wagyuRetail?.slice(0, 5) || [])}\n\nGenerate:\n1. Caption/text (with emojis + hashtags for social)\n2. Image prompt (for AI image generation)\n3. CTA (call to action)\n4. Best time to post\n5. A/B variant caption`
      );

      return NextResponse.json({
        contentType: type,
        product: prod,
        platform: plat,
        content,
        generatedAt: new Date().toISOString(),
      });
    }

    // ─── RUN EMAIL CAMPAIGN ───────────────────────────────────────────

    if (action === 'run_email_campaign') {
      const { template, recipients, listId } = body;
      if (!template) {
        return NextResponse.json({ error: 'template required (biltong_promo, wagyu_box, ankole_intro)' }, { status: 400 });
      }
      if (!recipients?.length && !listId) {
        return NextResponse.json({ error: 'recipients array or listId required' }, { status: 400 });
      }

      const campaignResult = await internalFetch('/api/agentmail', {
        action: 'send_campaign',
        template,
        recipients: recipients || [],
        batchSize: body.batchSize || 10,
        delayMs: body.delayMs || 2000,
      });

      const summary = `📧 Email campaign "${template}" sent to ${campaignResult.campaign?.totalRecipients || 0} recipients. ${campaignResult.campaign?.sent || 0} sent, ${campaignResult.campaign?.failed || 0} failed.`;

      if (body.reportToSlack !== false) await postToSlack(summary);
      if (body.reportToDiscord !== false) await postToDiscord(summary);

      return NextResponse.json({ campaign: campaignResult, reported: true });
    }

    // ─── REVENUE ANALYSIS ─────────────────────────────────────────────

    if (action === 'revenue_analysis') {
      const [shopify, qb] = await Promise.allSettled([
        internalFetch('/api/shopify', { action: 'orders_daily_revenue' }),
        internalFetch('/api/quickbooks', { action: 'revenue_summary' }),
      ]);

      const revenueData = {
        shopifyRevenue: shopify.status === 'fulfilled' ? shopify.value : null,
        quickbooksRevenue: qb.status === 'fulfilled' ? qb.value : null,
      };

      const analysis = await callLLM(
        `You are CashClaw, the revenue analyst for StudEx Meat. Analyze revenue data and provide: 1) Current performance assessment, 2) Top 3 revenue opportunities, 3) Recommended promotions to run this week, 4) Which products to push via email campaign. Be specific with numbers and actionable.`,
        JSON.stringify(revenueData)
      );

      return NextResponse.json({
        revenueData,
        analysis,
        generatedAt: new Date().toISOString(),
      });
    }

    // ─── INVENTORY CHECK ──────────────────────────────────────────────

    if (action === 'inventory_check') {
      const shopify = await internalFetch('/api/shopify', { action: 'products_inventory_alerts' });

      if (shopify.alerts?.length > 0) {
        const alertMsg = `⚠️ *Inventory Alert*\n${shopify.alerts.map((a: any) => `• ${a.product_title} (${a.variant_title}): ${a.quantity} units — ${a.level}`).join('\n')}`;
        await postToSlack(alertMsg);
        await postToDiscord(alertMsg.replace(/\*/g, '**'));
      }

      return NextResponse.json({
        alerts: shopify.alerts || [],
        threshold: shopify.threshold || 10,
        reported: shopify.alerts?.length > 0,
      });
    }

    // ─── INVOICE PIPELINE ─────────────────────────────────────────────

    if (action === 'invoice_pipeline') {
      const pending = await internalFetch('/api/n8n', { action: 'pending_invoices' });
      const results: any[] = [];

      for (const invoice of (pending.pending || [])) {
        if (invoice.status === 'Pending' && invoice.amount) {
          const result = await internalFetch('/api/n8n', {
            action: 'qb_create_invoice',
            customerName: invoice.customer,
            items: [{
              cut: invoice.description,
              marbleScore: invoice.marbleScore,
              weight: invoice.weightKg,
              pricePerKg: invoice.amount / invoice.weightKg,
            }],
          });
          results.push({ invoice: invoice.customer, result });
        }
      }

      if (results.length > 0) {
        const msg = `📄 Processed ${results.length} invoices via QuickBooks`;
        await postToSlack(msg);
      }

      return NextResponse.json({ processed: results.length, results });
    }

    // ─── CUSTOMER OUTREACH ────────────────────────────────────────────

    if (action === 'customer_outreach') {
      const customers = await internalFetch('/api/quickbooks', { action: 'customers_all' });
      const lapsed = (customers.customers || []).filter(
        (c: any) => c.balance === 0 && c.email
      );

      const emails = lapsed.map((c: any) => c.email).filter(Boolean);

      if (emails.length > 0 && body.sendCampaign) {
        const campaign = await internalFetch('/api/agentmail', {
          action: 'send_campaign',
          template: body.template || 'biltong_promo',
          recipients: emails,
          batchSize: 5,
        });
        return NextResponse.json({
          lapsedCustomers: lapsed.length,
          emailsSent: campaign.campaign?.sent || 0,
          campaign,
        });
      }

      return NextResponse.json({
        lapsedCustomers: lapsed.length,
        emails: emails.slice(0, 10),
        note: 'Pass sendCampaign: true to auto-send re-engagement emails',
      });
    }

    // ─── REPORT TO CHANNELS ───────────────────────────────────────────

    if (action === 'report_slack') {
      const result = await postToSlack(body.message || 'CashClaw reporting in.');
      return NextResponse.json(result);
    }

    if (action === 'report_discord') {
      const result = await postToDiscord(body.message || 'CashClaw reporting in.');
      return NextResponse.json(result);
    }

    // ─── ASK AGENT ────────────────────────────────────────────────────

    if (action === 'ask_agent') {
      const { question } = body;
      if (!question) return NextResponse.json({ error: 'question required' }, { status: 400 });

      const [shopify, qb, meat] = await Promise.allSettled([
        internalFetch('/api/shopify', { action: 'store_overview' }),
        internalFetch('/api/quickbooks', { action: 'revenue_summary' }),
        fetch(`${APP_BASE || 'http://localhost:3000'}/api/meat`).then(r => r.json()),
      ]);

      const context = {
        shopify: shopify.status === 'fulfilled' ? shopify.value : null,
        quickbooks: qb.status === 'fulfilled' ? qb.value : null,
        meatPricing: meat.status === 'fulfilled' ? meat.value : null,
      };

      const answer = await callLLM(
        `You are CashClaw, the AI operations agent for StudEx Meat (studexmeat.com). You manage a premium Wagyu and Ankole beef store in South Africa. You have access to Shopify, QuickBooks, email campaigns (AgentMail), and can report to Slack/Discord. Answer questions about the business with specific data and actionable recommendations. Currency: ZAR (R).`,
        `Question: ${question}\n\nCurrent business data:\n${JSON.stringify(context, null, 2)}`
      );

      return NextResponse.json({ question, answer, context: Object.keys(context) });
    }

    // ─── WHATSAPP ──────────────────────────────────────────────────────

    if (action === 'whatsapp_send') {
      const { to, message } = body;
      if (!to || !message) return NextResponse.json({ error: 'to and message required' }, { status: 400 });
      const result = await sendWhatsApp(to, message);
      return NextResponse.json(result);
    }

    if (action === 'whatsapp_order_update') {
      const { to, orderNumber, status: orderStatus, details } = body;
      if (!to) return NextResponse.json({ error: 'to (phone number) required' }, { status: 400 });
      const msg = `🥩 *StudEx Meat — Order Update*\n\nOrder: #${orderNumber || 'N/A'}\nStatus: ${orderStatus || 'Processing'}\n${details || ''}\n\nReply to this message for support.`;
      const result = await sendWhatsApp(to, msg);
      return NextResponse.json(result);
    }

    // ─── HERMES COORDINATION ─────────────────────────────────────────

    if (action === 'ask_hermes') {
      try {
        const res = await fetch(`${HERMES_URL}/ask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: body.question, provider: body.provider, model: body.model }),
        });
        const data = await res.json();
        return NextResponse.json({ from: 'Hermes', ...data });
      } catch (err: any) {
        return NextResponse.json({ error: `Hermes Agent not reachable: ${err.message}` }, { status: 503 });
      }
    }

    if (action === 'hermes_content') {
      try {
        const endpoint = body.contentType === 'video' ? '/video-script'
          : body.contentType === 'image' ? '/image-prompt'
          : body.contentType === 'email' ? '/email-campaign'
          : '/social-post';
        const res = await fetch(`${HERMES_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json({ from: 'Hermes', ...data });
      } catch (err: any) {
        return NextResponse.json({ error: `Hermes Agent not reachable: ${err.message}` }, { status: 503 });
      }
    }

    // ─── LLM CONFIG ──────────────────────────────────────────────────

    if (action === 'llm_config') {
      if (body.provider) LLM_PROVIDER = body.provider;
      if (body.ollamaUrl) OLLAMA_URL = body.ollamaUrl;
      if (body.ollamaModel) OLLAMA_MODEL = body.ollamaModel;
      return NextResponse.json({
        provider: LLM_PROVIDER,
        ollamaUrl: OLLAMA_URL,
        ollamaModel: OLLAMA_MODEL,
        anthropicConfigured: !!ANTHROPIC_API_KEY,
      });
    }

    return NextResponse.json(
      {
        error: 'Unknown action',
        available: [
          'daily_report', 'generate_content', 'run_email_campaign',
          'revenue_analysis', 'inventory_check', 'invoice_pipeline',
          'customer_outreach', 'report_slack', 'report_discord', 'ask_agent',
          'whatsapp_send', 'whatsapp_order_update',
          'ask_hermes', 'hermes_content', 'llm_config',
        ],
      },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
