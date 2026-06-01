import { NextRequest, NextResponse } from 'next/server';

const AGENTMAIL_URL = process.env.AGENTMAIL_URL || 'http://localhost:3006';
const AGENTMAIL_API_KEY = process.env.AGENTMAIL_API_KEY || '';

async function agentmailFetch(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${AGENTMAIL_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AGENTMAIL_API_KEY}`,
      ...options?.headers,
    },
  });
  return res.json();
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  switch (action) {
    case 'create_campaign': {
      const result = await agentmailFetch('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          name: body.name,
          subject: body.subject,
          templateId: body.templateId,
          segmentId: body.segmentId,
          fromName: body.fromName || 'Studex Meat',
          fromEmail: body.fromEmail || 'orders@studexmeat.com',
        }),
      });
      return NextResponse.json({ ok: true, campaign: result });
    }

    case 'send_campaign': {
      const result = await agentmailFetch(`/api/campaigns/${body.campaignId}/send`, {
        method: 'POST',
      });
      return NextResponse.json({ ok: true, result });
    }

    case 'schedule_campaign': {
      const result = await agentmailFetch(`/api/campaigns/${body.campaignId}/schedule`, {
        method: 'POST',
        body: JSON.stringify({
          sendAt: body.sendAt,
          timezone: body.timezone || 'Africa/Johannesburg',
        }),
      });
      return NextResponse.json({ ok: true, result });
    }

    case 'create_template': {
      const result = await agentmailFetch('/api/templates', {
        method: 'POST',
        body: JSON.stringify({
          name: body.name,
          subject: body.subject,
          html: body.html,
          text: body.text,
        }),
      });
      return NextResponse.json({ ok: true, template: result });
    }

    case 'list_templates': {
      const result = await agentmailFetch('/api/templates');
      return NextResponse.json({ ok: true, templates: result });
    }

    case 'add_contacts': {
      const result = await agentmailFetch('/api/contacts', {
        method: 'POST',
        body: JSON.stringify({
          contacts: body.contacts,
          listId: body.listId,
        }),
      });
      return NextResponse.json({ ok: true, result });
    }

    case 'import_contacts': {
      const result = await agentmailFetch('/api/contacts/import', {
        method: 'POST',
        body: JSON.stringify({
          csv: body.csv,
          listId: body.listId,
          mapping: body.mapping,
        }),
      });
      return NextResponse.json({ ok: true, result });
    }

    case 'segment_contacts': {
      const result = await agentmailFetch('/api/segments', {
        method: 'POST',
        body: JSON.stringify({
          name: body.name,
          conditions: body.conditions,
          listId: body.listId,
        }),
      });
      return NextResponse.json({ ok: true, segment: result });
    }

    case 'get_analytics': {
      const campaignId = body.campaignId ? `/${body.campaignId}` : '';
      const result = await agentmailFetch(`/api/analytics${campaignId}`);
      return NextResponse.json({ ok: true, analytics: result });
    }

    case 'unsubscribe': {
      const result = await agentmailFetch('/api/contacts/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({
          email: body.email,
          listId: body.listId,
          reason: body.reason,
        }),
      });
      return NextResponse.json({ ok: true, result });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
