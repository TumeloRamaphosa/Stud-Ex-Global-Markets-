import { NextRequest, NextResponse } from 'next/server';

// ─── StudEx Meat — AgentMail API Route ──────────────────────────────────────
// Uses: agentmail SDK (npm: agentmail ^0.5.2, already installed)
// Purpose: Mass email campaigns for biltong & meat sales
// Account: agentmail.to (Tumelo's account)
//
// ENV VARS:
//   AGENTMAIL_API_KEY    — API key from agentmail.to dashboard
//   AGENTMAIL_DOMAIN     — custom domain or agentmail.to
//   AGENTMAIL_INBOX_ID   — primary inbox ID for CashClaw agent
// ────────────────────────────────────────────────────────────────────────────

const AGENTMAIL_API_KEY = process.env.AGENTMAIL_API_KEY || '';
const AGENTMAIL_DOMAIN = process.env.AGENTMAIL_DOMAIN || 'agentmail.to';
const AGENTMAIL_INBOX_ID = process.env.AGENTMAIL_INBOX_ID || '';

async function agentmailFetch(path: string, options?: RequestInit) {
  const res = await fetch(`https://api.agentmail.to/v1${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${AGENTMAIL_API_KEY}`,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AgentMail API error ${res.status}: ${err}`);
  }
  return res.json();
}

// ── Email Templates ───────────────────────────────────────────────────
const TEMPLATES: Record<string, { subject: string; body: string }> = {
  biltong_promo: {
    subject: 'Premium Wagyu Biltong — Direct to Your Door 🥩',
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #FFF8F0; padding: 40px 30px;">
<div style="text-align: center; margin-bottom: 30px;">
  <h1 style="color: #1a1a1a; font-size: 28px; margin: 0; letter-spacing: 2px;">STUDEX MEAT</h1>
  <div style="width: 40px; height: 2px; background: #D4A017; margin: 10px auto;"></div>
  <p style="color: #8B6914; font-size: 12px; letter-spacing: 3px;">PREMIUM WAGYU & ANKOLE</p>
</div>
<h2 style="color: #1a1a1a; font-size: 22px;">Premium Biltong. Made Different.</h2>
<p style="color: #555; line-height: 1.6;">Our Wagyu biltong is hand-cut from premium marble-grade beef, air-dried to perfection. Each batch is crafted with care — no shortcuts, no fillers.</p>
<div style="background: white; border: 1px solid #E8DCC8; border-radius: 12px; padding: 20px; margin: 20px 0;">
  <p style="color: #1a1a1a; font-weight: bold; margin: 0 0 8px;">This Week's Specials:</p>
  <p style="color: #555; margin: 4px 0;">• Wagyu Biltong — R500/kg (normally R550)</p>
  <p style="color: #555; margin: 4px 0;">• Wagyu Droewors — R350/kg</p>
  <p style="color: #555; margin: 4px 0;">• de Lange Free Range Biltong — R450/kg</p>
  <p style="color: #555; margin: 4px 0;">• Windpomp Wagyu Droewors — R350/kg</p>
</div>
<div style="text-align: center; margin: 30px 0;">
  <a href="https://studexmeat.com/store" style="background: #D4A017; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; letter-spacing: 1px;">SHOP NOW</a>
</div>
<p style="color: #999; font-size: 11px; text-align: center; margin-top: 30px;">StudEx Meat — Premium Wagyu & Ankole — South Africa<br/>Reply to this email to place an order directly.</p>
</div>`,
  },
  wagyu_box: {
    subject: 'Your Wagyu Box Awaits — Premium Cuts, Delivered',
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #FFF8F0; padding: 40px 30px;">
<div style="text-align: center; margin-bottom: 30px;">
  <h1 style="color: #1a1a1a; font-size: 28px; margin: 0; letter-spacing: 2px;">STUDEX MEAT</h1>
  <div style="width: 40px; height: 2px; background: #D4A017; margin: 10px auto;"></div>
</div>
<h2 style="color: #1a1a1a;">The Ultimate Wagyu Experience</h2>
<p style="color: #555; line-height: 1.6;">Curated boxes of premium Wagyu beef — from ribeye to fillet, each cut graded for marble score and hand-selected by our team.</p>
<div style="background: white; border: 1px solid #E8DCC8; border-radius: 12px; padding: 20px; margin: 20px 0;">
  <p style="font-weight: bold; color: #1a1a1a;">Popular Cuts:</p>
  <p style="color: #555;">• Wagyu Ribeye — R699/kg</p>
  <p style="color: #555;">• Wagyu Fillet — R632.50/kg</p>
  <p style="color: #555;">• Wagyu Rump — R530/kg</p>
  <p style="color: #555;">• Wagyu Sirloin — R699/kg</p>
</div>
<div style="text-align: center; margin: 30px 0;">
  <a href="https://studexmeat.com/store" style="background: #D4A017; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold;">ORDER YOUR BOX</a>
</div>
<p style="color: #999; font-size: 11px; text-align: center;">Free delivery on orders over R2,000 in Johannesburg</p>
</div>`,
  },
  ankole_intro: {
    subject: 'Discover Ankole — Africa\'s Heritage Beef',
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #FFF8F0; padding: 40px 30px;">
<div style="text-align: center; margin-bottom: 30px;">
  <h1 style="color: #1a1a1a; font-size: 28px; margin: 0; letter-spacing: 2px;">STUDEX MEAT</h1>
  <div style="width: 40px; height: 2px; background: #D4A017; margin: 10px auto;"></div>
</div>
<h2 style="color: #1a1a1a;">Royal Ankole Beef — From Africa, With Pride</h2>
<p style="color: #555; line-height: 1.6;">Ankole cattle are one of Africa's oldest heritage breeds. Their beef is leaner, richer in flavour, and raised on open pastures — the way nature intended.</p>
<div style="background: white; border: 1px solid #E8DCC8; border-radius: 12px; padding: 20px; margin: 20px 0;">
  <p style="font-weight: bold; color: #1a1a1a;">Ankole Range:</p>
  <p style="color: #555;">• Ankole Ribeye — R688.85/kg</p>
  <p style="color: #555;">• Ankole Fillet — R688.85/kg</p>
  <p style="color: #555;">• Ankole Rump — R573.85/kg</p>
  <p style="color: #555;">• Ankole Biltong — R527.85/kg</p>
  <p style="color: #555;">• Ankole Boerewors — R205.85/kg</p>
</div>
<div style="text-align: center; margin: 30px 0;">
  <a href="https://studexmeat.com/store" style="background: #D4A017; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold;">EXPLORE ANKOLE</a>
</div>
</div>`,
  },
};

function mockResponse(action: string) {
  return {
    mock: true,
    action,
    message: 'AgentMail route ready — set AGENTMAIL_API_KEY to go live',
    templates: Object.keys(TEMPLATES),
  };
}

export async function GET(req: NextRequest) {
  const test = req.nextUrl.searchParams.get('test');
  if (test === '1') return NextResponse.json(mockResponse('health'));

  return NextResponse.json({
    service: 'StudEx Meat — AgentMail Mass Email',
    version: '1.0.0',
    configured: !!AGENTMAIL_API_KEY,
    domain: AGENTMAIL_DOMAIN,
    inboxId: AGENTMAIL_INBOX_ID || 'NOT SET',
    templates: Object.keys(TEMPLATES),
    actions: [
      'list_inboxes', 'create_inbox',
      'send_email', 'send_campaign',
      'list_threads', 'get_metrics',
      'list_lists', 'create_list', 'add_to_list',
      'get_templates',
    ],
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  const test = req.nextUrl.searchParams.get('test');
  if (test === '1') return NextResponse.json(mockResponse(action));

  if (!AGENTMAIL_API_KEY) {
    return NextResponse.json(
      { error: 'AGENTMAIL_API_KEY not configured' },
      { status: 400 }
    );
  }

  try {
    // ─── INBOXES ──────────────────────────────────────────────────────

    if (action === 'list_inboxes') {
      const data = await agentmailFetch('/inboxes');
      return NextResponse.json(data);
    }

    if (action === 'create_inbox') {
      const { displayName, username } = body;
      const data = await agentmailFetch('/inboxes', {
        method: 'POST',
        body: JSON.stringify({
          display_name: displayName || 'CashClaw Agent',
          username: username || 'cashclaw',
          domain: AGENTMAIL_DOMAIN,
        }),
      });
      return NextResponse.json(data);
    }

    // ─── SEND EMAIL ───────────────────────────────────────────────────

    if (action === 'send_email') {
      const { to, subject, htmlBody, textBody, template, inboxId } = body;
      const inbox = inboxId || AGENTMAIL_INBOX_ID;
      if (!inbox) return NextResponse.json({ error: 'inboxId required' }, { status: 400 });

      let emailSubject = subject;
      let emailBody = htmlBody || textBody;

      if (template && TEMPLATES[template]) {
        emailSubject = emailSubject || TEMPLATES[template].subject;
        emailBody = emailBody || TEMPLATES[template].body;
      }

      if (!to || !emailSubject) {
        return NextResponse.json({ error: 'to and subject required' }, { status: 400 });
      }

      const data = await agentmailFetch(`/inboxes/${inbox}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          to: Array.isArray(to) ? to : [to],
          subject: emailSubject,
          html_body: emailBody,
          text_body: textBody,
        }),
      });
      return NextResponse.json({ success: true, message: data });
    }

    // ─── MASS CAMPAIGN ────────────────────────────────────────────────

    if (action === 'send_campaign') {
      const { recipients, template, subject, htmlBody, inboxId, batchSize, delayMs } = body;
      const inbox = inboxId || AGENTMAIL_INBOX_ID;

      if (!inbox) return NextResponse.json({ error: 'inboxId required' }, { status: 400 });
      if (!recipients?.length) return NextResponse.json({ error: 'recipients array required' }, { status: 400 });

      const emailTemplate = template ? TEMPLATES[template] : null;
      const emailSubject = subject || emailTemplate?.subject || 'StudEx Meat — Special Offer';
      const emailHtml = htmlBody || emailTemplate?.body || '';

      const batch = batchSize || 10;
      const delay = delayMs || 1000;
      const results: { email: string; status: string; error?: string }[] = [];

      for (let i = 0; i < recipients.length; i += batch) {
        const chunk = recipients.slice(i, i + batch);
        const promises = chunk.map(async (email: string) => {
          try {
            await agentmailFetch(`/inboxes/${inbox}/messages`, {
              method: 'POST',
              body: JSON.stringify({
                to: [email],
                subject: emailSubject,
                html_body: emailHtml,
              }),
            });
            return { email, status: 'sent' };
          } catch (err: any) {
            return { email, status: 'failed', error: err.message };
          }
        });
        const batchResults = await Promise.all(promises);
        results.push(...batchResults);

        if (i + batch < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      const sent = results.filter(r => r.status === 'sent').length;
      const failed = results.filter(r => r.status === 'failed').length;

      return NextResponse.json({
        campaign: {
          template: template || 'custom',
          totalRecipients: recipients.length,
          sent,
          failed,
          batchSize: batch,
        },
        results,
      });
    }

    // ─── THREADS ──────────────────────────────────────────────────────

    if (action === 'list_threads') {
      const inbox = body.inboxId || AGENTMAIL_INBOX_ID;
      if (!inbox) return NextResponse.json({ error: 'inboxId required' }, { status: 400 });
      const data = await agentmailFetch(`/inboxes/${inbox}/threads`);
      return NextResponse.json(data);
    }

    // ─── METRICS ──────────────────────────────────────────────────────

    if (action === 'get_metrics') {
      const inbox = body.inboxId || AGENTMAIL_INBOX_ID;
      if (!inbox) return NextResponse.json({ error: 'inboxId required' }, { status: 400 });
      const data = await agentmailFetch(`/inboxes/${inbox}/metrics`);
      return NextResponse.json(data);
    }

    // ─── LISTS ────────────────────────────────────────────────────────

    if (action === 'list_lists') {
      const data = await agentmailFetch('/lists');
      return NextResponse.json(data);
    }

    if (action === 'create_list') {
      const { name, description } = body;
      const data = await agentmailFetch('/lists', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      });
      return NextResponse.json(data);
    }

    if (action === 'add_to_list') {
      const { listId, emails } = body;
      if (!listId || !emails?.length) {
        return NextResponse.json({ error: 'listId and emails required' }, { status: 400 });
      }
      const data = await agentmailFetch(`/lists/${listId}/contacts`, {
        method: 'POST',
        body: JSON.stringify({ emails }),
      });
      return NextResponse.json(data);
    }

    // ─── TEMPLATES ────────────────────────────────────────────────────

    if (action === 'get_templates') {
      return NextResponse.json({
        templates: Object.entries(TEMPLATES).map(([key, val]) => ({
          id: key,
          subject: val.subject,
          preview: val.body.slice(0, 200) + '...',
        })),
      });
    }

    return NextResponse.json(
      {
        error: 'Unknown action',
        available: [
          'list_inboxes', 'create_inbox',
          'send_email', 'send_campaign',
          'list_threads', 'get_metrics',
          'list_lists', 'create_list', 'add_to_list',
          'get_templates',
        ],
      },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
