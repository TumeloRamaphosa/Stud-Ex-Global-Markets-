import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

// Internal fetch helper — calls our Next.js API routes
const BASE_URL = process.env.STUDEX_API_URL || 'https://datanetics-app.fly.dev';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://35.196.24.245:11434';

// Hoist (Polsia) domain/deploy MCP — https://hoist-g8do.polsia.app
// Public API: search + guest-checkout require no auth; authenticated ops need HOIST_API_KEY
const HOIST_BASE = process.env.HOIST_API_URL || 'https://hoist-g8do.polsia.app/api';
async function hoistApi(path, { method = 'GET', body = null, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const key = process.env.HOIST_API_KEY;
    if (!key) return { error: 'HOIST_API_KEY not set — required for authenticated Hoist endpoints', ok: false };
    headers['Authorization'] = `Bearer ${key}`;
  }
  let res;
  try {
    res = await fetch(`${HOIST_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    return { error: `Hoist network error: ${err.message}`, ok: false };
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: `Hoist non-JSON response (${res.status}): ${text.slice(0, 500)}`, ok: false };
  }
}

async function api(path, body) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    return { error: `Network error: ${err.message}`, ok: false };
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: `Non-JSON response (${res.status}): ${text.slice(0, 500)}`, ok: false };
  }
}

// Facebook Graph API direct calls
const GRAPH_API = 'https://graph.facebook.com/v21.0';
async function fbApi(endpoint, method = 'GET', body = null) {
  const token = process.env.FACEBOOK_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;
  if (!token) return { error: 'No Facebook/Meta access token configured', ok: false };
  const sep = endpoint.includes('?') ? '&' : '?';
  const url = `${GRAPH_API}${endpoint}${sep}access_token=${token}`;
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  let res;
  try {
    res = await fetch(url, opts);
  } catch (err) {
    return { error: `Facebook API network error: ${err.message}`, ok: false };
  }
  const data = await res.json();
  if (data.error) return { error: data.error.message || JSON.stringify(data.error), code: data.error.code, ok: false };
  return data;
}

export function createStudexServer() {
  const server = new McpServer({
    name: 'Studex Meat',
    version: '1.0.0',
  });

  // ═══════════════════════════════════════════
  // SHOPIFY
  // ═══════════════════════════════════════════

  server.tool('studex_shopify_orders', 'Get recent Shopify orders', {
    limit: z.number().optional().describe('Number of orders (default 50)'),
    status: z.string().optional().describe('Order status: any, open, closed, cancelled'),
  }, async ({ limit, status }) => {
    const data = await api(`/api/shopify?resource=orders&limit=${limit || 50}&status=${status || 'any'}`);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('studex_shopify_products', 'Get Shopify products', {
    limit: z.number().optional(),
  }, async ({ limit }) => {
    const data = await api(`/api/shopify?resource=products&limit=${limit || 50}`);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('studex_shopify_customers', 'Get Shopify customers', {
    limit: z.number().optional().describe('Number of customers (default 50)'),
    query: z.string().optional().describe('Search query (name or email)'),
  }, async ({ limit, query }) => {
    let url = `/api/shopify?resource=customers&limit=${limit || 50}`;
    if (query) url += `&query=${encodeURIComponent(query)}`;
    const data = await api(url);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('studex_shopify_create_product', 'Create a Shopify product', {
    title: z.string(),
    body_html: z.string().optional(),
    vendor: z.string().optional(),
    product_type: z.string().optional(),
    price: z.string().describe('Price in ZAR'),
  }, async (args) => {
    const data = await api('/api/shopify', {
      resource: 'create_product',
      data: { title: args.title, body_html: args.body_html, vendor: args.vendor || 'Studex Meat', product_type: args.product_type, variants: [{ price: args.price }] },
    });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  // ═══════════════════════════════════════════
  // QUICKBOOKS / INVOICING
  // ═══════════════════════════════════════════

  server.tool('studex_create_invoice', 'Create a QuickBooks invoice with 15% VAT', {
    customerName: z.string(),
    email: z.string(),
    items: z.array(z.object({
      cut: z.string(),
      weight: z.number(),
      marbleScore: z.string().optional(),
      description: z.string().optional(),
    })),
  }, async ({ customerName, email, items }) => {
    // Search/create customer
    const search = await api('/api/quickbooks', { action: 'customer_search', customerName, email, autoCreate: true });
    const customerId = search.customers?.[0]?.Id || search.customer?.Id;
    // Create invoice
    const invoice = await api('/api/quickbooks', { action: 'invoice_create', customerId, customerName, email, items });
    // Send to customer + info@studexmeat.com
    if (invoice.ok && invoice.invoice?.Id) {
      await api('/api/quickbooks', { action: 'invoice_send', invoiceId: invoice.invoice.Id, email });
      await api('/api/quickbooks', { action: 'invoice_send', invoiceId: invoice.invoice.Id, email: 'info@studexmeat.com' });
    }
    return { content: [{ type: 'text', text: JSON.stringify(invoice, null, 2) }] };
  });

  server.tool('studex_list_invoices', 'List recent QuickBooks invoices', {}, async () => {
    const data = await api('/api/quickbooks', { action: 'invoice_list' });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('studex_revenue_report', 'Get profit & loss report', {
    startDate: z.string().optional().describe('YYYY-MM-DD'),
    endDate: z.string().optional().describe('YYYY-MM-DD'),
  }, async ({ startDate, endDate }) => {
    const data = await api('/api/quickbooks', { action: 'report_profit_loss', startDate, endDate });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  // ═══════════════════════════════════════════
  // FACEBOOK / INSTAGRAM (direct Graph API)
  // ═══════════════════════════════════════════

  server.tool('studex_facebook_post', 'Post to Facebook page', {
    message: z.string().describe('Post text'),
    link: z.string().optional().describe('URL to share'),
  }, async ({ message, link }) => {
    const pageId = process.env.FACEBOOK_PAGE_ID || process.env.META_PAGE_ID;
    const body = { message };
    if (link) body.link = link;
    const data = await fbApi(`/${pageId}/feed`, 'POST', body);
    return { content: [{ type: 'text', text: data.id ? `Posted! ID: ${data.id}` : JSON.stringify(data) }] };
  });

  server.tool('studex_facebook_page_insights', 'Get Facebook page insights', {
    metric: z.string().optional().describe('e.g. page_impressions, page_engaged_users'),
    period: z.string().optional().describe('day, week, days_28'),
  }, async ({ metric, period }) => {
    const pageId = process.env.FACEBOOK_PAGE_ID || process.env.META_PAGE_ID;
    const m = metric || 'page_impressions,page_engaged_users,page_fans';
    const p = period || 'day';
    const data = await fbApi(`/${pageId}/insights?metric=${m}&period=${p}`);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('studex_instagram_post', 'Post to Instagram', {
    caption: z.string(),
    imageUrl: z.string().describe('Public URL of image'),
  }, async ({ caption, imageUrl }) => {
    const igId = process.env.META_INSTAGRAM_ACCOUNT_ID;
    if (!igId) return { content: [{ type: 'text', text: 'Error: META_INSTAGRAM_ACCOUNT_ID not configured' }] };
    // Step 1: Create media container
    const container = await fbApi(`/${igId}/media`, 'POST', { image_url: imageUrl, caption });
    if (!container.id) return { content: [{ type: 'text', text: `Error creating container: ${JSON.stringify(container)}` }] };
    // Step 2: Poll until container is ready (IG processes async)
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      const status = await fbApi(`/${container.id}?fields=status_code`);
      if (status.status_code === 'FINISHED') break;
      if (status.status_code === 'ERROR') return { content: [{ type: 'text', text: `Container processing failed: ${JSON.stringify(status)}` }] };
      await new Promise(r => setTimeout(r, 2000));
    }
    // Step 3: Publish
    const publish = await fbApi(`/${igId}/media_publish`, 'POST', { creation_id: container.id });
    return { content: [{ type: 'text', text: publish.id ? `Instagram posted! ID: ${publish.id}` : JSON.stringify(publish) }] };
  });

  server.tool('studex_instagram_insights', 'Get Instagram account insights', {}, async () => {
    const igId = process.env.META_INSTAGRAM_ACCOUNT_ID;
    const data = await fbApi(`/${igId}?fields=followers_count,media_count,name,biography`);
    const insights = await fbApi(`/${igId}/insights?metric=impressions,reach,profile_views&period=day`);
    return { content: [{ type: 'text', text: JSON.stringify({ profile: data, insights: insights.data }, null, 2) }] };
  });

  server.tool('studex_meta_ads_campaigns', 'List Meta ad campaigns with performance', {}, async () => {
    const adAccountId = process.env.META_AD_ACCOUNT_ID;
    const data = await fbApi(`/act_${adAccountId}/campaigns?fields=id,name,status,objective,daily_budget,insights{spend,impressions,clicks,ctr,conversions}`);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('studex_meta_create_campaign', 'Create a Meta/Facebook ad campaign', {
    name: z.string(),
    objective: z.string().describe('LINK_CLICKS, CONVERSIONS, REACH, etc.'),
    dailyBudget: z.number().describe('Daily budget in ZAR'),
  }, async ({ name, objective, dailyBudget }) => {
    const adAccountId = process.env.META_AD_ACCOUNT_ID;
    const data = await fbApi(`/act_${adAccountId}/campaigns`, 'POST', {
      name, objective, status: 'PAUSED', daily_budget: dailyBudget * 100, special_ad_categories: [],
    });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  // ═══════════════════════════════════════════
  // WHATSAPP
  // ═══════════════════════════════════════════

  server.tool('studex_whatsapp_send', 'Send a WhatsApp message to a customer', {
    to: z.string().describe('Phone number with country code, e.g. 27821234567'),
    message: z.string(),
  }, async ({ to, message }) => {
    const data = await api('/api/whatsapp', { action: 'send', to, message });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('studex_whatsapp_order_update', 'Send order status update via WhatsApp', {
    to: z.string(),
    orderNumber: z.string(),
    status: z.string().describe('e.g. Confirmed, Processing, Shipped, Delivered'),
    details: z.string(),
  }, async ({ to, orderNumber, status, details }) => {
    const data = await api('/api/whatsapp', { action: 'order_update', to, orderNumber, status, details });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  // ═══════════════════════════════════════════
  // HERMES (Content Agent)
  // ═══════════════════════════════════════════

  server.tool('studex_hermes_social', 'Generate a social media post with Hermes', {
    platform: z.string().describe('instagram, facebook, twitter, whatsapp'),
    topic: z.string(),
    tone: z.string().optional(),
  }, async ({ platform, topic, tone }) => {
    const data = await api('/api/hermes', { action: 'social', platform, topic, tone });
    return { content: [{ type: 'text', text: data.content || JSON.stringify(data) }] };
  });

  server.tool('studex_hermes_email', 'Generate email copy with Hermes', {
    topic: z.string(),
    audience: z.string().optional(),
    type: z.string().optional().describe('promotional, newsletter, follow-up'),
  }, async ({ topic, audience, type }) => {
    const data = await api('/api/hermes', { action: 'email', topic, audience, type });
    return { content: [{ type: 'text', text: data.content || JSON.stringify(data) }] };
  });

  server.tool('studex_hermes_content_calendar', 'Generate a content calendar', {
    days: z.number().optional(),
    platforms: z.array(z.string()).optional(),
    focus: z.string().optional(),
  }, async ({ days, platforms, focus }) => {
    const data = await api('/api/hermes', { action: 'calendar', days, platforms, focus });
    return { content: [{ type: 'text', text: data.calendar || JSON.stringify(data) }] };
  });

  server.tool('studex_hermes_image_prompt', 'Generate FLUX image prompt with Hermes', {
    subject: z.string(),
    style: z.string().optional(),
    purpose: z.string().optional(),
  }, async ({ subject, style, purpose }) => {
    const data = await api('/api/hermes', { action: 'image', subject, style, purpose });
    return { content: [{ type: 'text', text: data.prompt || JSON.stringify(data) }] };
  });

  // ═══════════════════════════════════════════
  // CASHCLAW AGENT
  // ═══════════════════════════════════════════

  server.tool('studex_agent_chat', 'Chat with CashClaw AI agent', {
    message: z.string(),
  }, async ({ message }) => {
    const data = await api('/api/agent', { action: 'chat', messages: [{ role: 'user', content: message }] });
    return { content: [{ type: 'text', text: data.response || JSON.stringify(data) }] };
  });

  server.tool('studex_switch_llm', 'Switch LLM provider for CashClaw or Hermes', {
    agent: z.enum(['cashclaw', 'hermes']),
    provider: z.enum(['anthropic', 'openrouter', 'google', 'ollama', 'lmstudio']),
    model: z.string().optional(),
    ollamaUrl: z.string().optional(),
  }, async ({ agent, provider, model, ollamaUrl }) => {
    const path = agent === 'hermes' ? '/api/hermes' : '/api/agent';
    const action = agent === 'hermes' ? 'config_set' : 'llm_config';
    const body = { action, provider, model, ollamaUrl: ollamaUrl || (provider === 'ollama' ? OLLAMA_URL : undefined) };
    if (agent === 'hermes' && provider === 'ollama' && !model) body.model = 'hermes3:8b';
    if (agent === 'cashclaw' && provider === 'ollama' && !model) body.ollamaModel = 'qwen3:30b';
    const data = await api(path, body);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('studex_daily_report', 'Generate daily business report', {}, async () => {
    const data = await api('/api/agent', { action: 'daily_report' });
    return { content: [{ type: 'text', text: data.report || JSON.stringify(data) }] };
  });

  server.tool('studex_health_check', 'Check all service health', {}, async () => {
    const data = await api('/api/agent', { action: 'health_check' });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  // ═══════════════════════════════════════════
  // MEAT PRODUCTS
  // ═══════════════════════════════════════════

  server.tool('studex_meat_prices', 'Get current meat product prices', {
    cut: z.string().optional().describe('Specific cut name, or omit for all'),
  }, async ({ cut }) => {
    const url = cut ? `/api/meat?cut=${encodeURIComponent(cut)}` : '/api/meat';
    const data = await api(url);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  // ═══════════════════════════════════════════
  // EMAIL CAMPAIGNS
  // ═══════════════════════════════════════════

  server.tool('studex_send_campaign', 'Create and send an email campaign', {
    name: z.string(),
    subject: z.string(),
    content: z.string().describe('HTML email body'),
    recipients: z.array(z.string()).describe('Email addresses'),
  }, async ({ name, subject, content, recipients }) => {
    const create = await api('/api/agentmail', { action: 'create_campaign', name, subject, content, recipients });
    if (create.ok) {
      const send = await api('/api/agentmail', { action: 'send_campaign', campaignId: create.campaign?.id });
      return { content: [{ type: 'text', text: JSON.stringify(send, null, 2) }] };
    }
    return { content: [{ type: 'text', text: JSON.stringify(create, null, 2) }] };
  });

  // ═══════════════════════════════════════════
  // N8N WORKFLOWS
  // ═══════════════════════════════════════════

  server.tool('studex_trigger_invoice', 'Trigger full invoice pipeline', {
    customerName: z.string(),
    email: z.string(),
    items: z.array(z.object({ cut: z.string(), weight: z.number(), description: z.string().optional() })),
  }, async ({ customerName, email, items }) => {
    const data = await api('/api/n8n', { workflow: 'trigger-invoice', data: { customerName, email, items } });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('studex_price_calculator', 'Calculate price with VAT for meat order', {
    items: z.array(z.object({ cut: z.string(), weight: z.number(), marbleScore: z.string().optional() })),
  }, async ({ items }) => {
    const data = await api('/api/n8n', { workflow: 'calculate', data: { items } });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  // ═══════════════════════════════════════════
  // HOIST (Polsia) — Domain registration & deploys
  //   Vendor: hoist-g8do.polsia.app
  //   Free for search; HOIST_API_KEY required for authenticated registration
  // ═══════════════════════════════════════════

  server.tool('hoist_search_domain', 'Search available domains across 14 TLDs (.com, .io, .dev, .ai, .app, .xyz, .site, .org, .net, .co, .me, .sh, .tech, .cc). No auth required.', {
    name: z.string().describe('Domain name without TLD (e.g. "naledi-meat")'),
  }, async ({ name }) => {
    const data = await hoistApi('/domains/search', { method: 'POST', body: { name } });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('hoist_pricing', 'Get live pricing for all supported TLDs.', {}, async () => {
    const data = await hoistApi('/pricing');
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('hoist_list_tlds', 'List all supported TLDs with prices.', {}, async () => {
    const data = await hoistApi('/domains/tlds');
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('hoist_guest_checkout', 'Register a domain via guest checkout (no account required). Returns a Stripe payment URL the caller must complete.', {
    domain: z.string().describe('Full domain to register, e.g. "naledi-meat.com"'),
    email: z.string().describe('Contact email for the registration'),
  }, async ({ domain, email }) => {
    const data = await hoistApi('/domains/checkout', { method: 'POST', body: { domain, email } });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('hoist_register_domain', 'Register a domain for an authenticated Hoist account. Requires HOIST_API_KEY env var.', {
    domain: z.string().describe('Full domain to register, e.g. "naledi-meat.com"'),
  }, async ({ domain }) => {
    const data = await hoistApi('/domains/register', { method: 'POST', body: { domain }, auth: true });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  server.tool('hoist_deploy', 'Deploy a site from a public source URL (e.g. GitHub repo). Returns a temporary slug.hoist-g8do.polsia.app URL.', {
    source_url: z.string().describe('Public source URL — typically a GitHub repository'),
  }, async ({ source_url }) => {
    const data = await hoistApi('/deploy', { method: 'POST', body: { source_url } });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  return server;
}
