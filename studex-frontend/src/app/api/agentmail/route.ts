import { NextRequest, NextResponse } from 'next/server';

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

async function agentmailFetch(endpoint: string, options?: RequestInit) {
  const agentmailUrl = process.env.AGENTMAIL_URL || 'http://localhost:3006';
  const apiKey = process.env.AGENTMAIL_API_KEY || '';

  const res = await fetch(`${agentmailUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`AgentMail error ${res.status}: ${errorText}`);
  }
  return res.json();
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
      case 'create_campaign': {
        if (!body.name || !body.subject) {
          return errorResponse('Missing required fields: name, subject', 400);
        }
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
        if (!body.campaignId) return errorResponse('Missing required field: campaignId', 400);
        const result = await agentmailFetch(`/api/campaigns/${body.campaignId}/send`, {
          method: 'POST',
        });
        return NextResponse.json({ ok: true, result });
      }

      case 'schedule_campaign': {
        if (!body.campaignId || !body.sendAt) {
          return errorResponse('Missing required fields: campaignId, sendAt', 400);
        }
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
        if (!body.name || !body.subject) {
          return errorResponse('Missing required fields: name, subject', 400);
        }
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
        if (!body.contacts || !Array.isArray(body.contacts)) {
          return errorResponse('Missing required field: contacts (array)', 400);
        }
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
        if (!body.csv) return errorResponse('Missing required field: csv', 400);
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
        if (!body.name || !body.conditions) {
          return errorResponse('Missing required fields: name, conditions', 400);
        }
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
        if (!body.email) return errorResponse('Missing required field: email', 400);
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

      case 'create_inbox': {
        if (!body.username || !body.domain) {
          return errorResponse('Missing required fields: username, domain', 400);
        }
        const result = await agentmailFetch('/api/inboxes', {
          method: 'POST',
          body: JSON.stringify({
            username: body.username,
            domain: body.domain,
            description: body.description,
            labels: body.labels,
            metadata: body.metadata,
          }),
        });
        return NextResponse.json({ ok: true, inbox: result });
      }

      default:
        return errorResponse(`Unknown action: ${action}`, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AgentMail request failed';
    console.error(`[agentmail/${action}] Error:`, err);
    return errorResponse(message);
  }
}
