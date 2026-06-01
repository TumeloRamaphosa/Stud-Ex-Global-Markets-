import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { workflow, data } = body;

  // Proxy to n8n Runner service on :3003
  const n8nRunnerUrl = process.env.N8N_RUNNER_URL || 'http://localhost:3003';
  const n8nApiUrl = process.env.N8N_API_URL || 'http://localhost:5678/api/v1';
  const n8nApiKey = process.env.N8N_API_KEY || '';

  async function n8nApiFetch(endpoint: string, options?: RequestInit) {
    const res = await fetch(`${n8nApiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': n8nApiKey,
        ...options?.headers,
      },
    });
    return res.json();
  }

  switch (workflow) {
    case 'trigger-invoice': {
      const res = await fetch(`${n8nRunnerUrl}/trigger-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return NextResponse.json(await res.json());
    }

    case 'calculate': {
      const res = await fetch(`${n8nRunnerUrl}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return NextResponse.json(await res.json());
    }

    case 'price-lookup': {
      const res = await fetch(`${n8nRunnerUrl}/price-lookup?cut=${data.cut}`);
      return NextResponse.json(await res.json());
    }

    // Direct n8n Cloud webhook trigger
    case 'webhook': {
      const webhookUrl = process.env.N8N_WEBHOOK_URL;
      if (!webhookUrl) return NextResponse.json({ error: 'N8N_WEBHOOK_URL not set' }, { status: 500 });
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return NextResponse.json(await res.json());
    }

    // Messaging triggers
    case 'trigger-email': {
      const res = await fetch(`${n8nRunnerUrl}/trigger-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return NextResponse.json(await res.json());
    }

    case 'trigger-whatsapp': {
      const res = await fetch(`${n8nRunnerUrl}/trigger-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return NextResponse.json(await res.json());
    }

    case 'trigger-sms': {
      const res = await fetch(`${n8nRunnerUrl}/trigger-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return NextResponse.json(await res.json());
    }

    // Workflow management via n8n API
    case 'workflow_list': {
      const result = await n8nApiFetch('/workflows');
      return NextResponse.json({ ok: true, workflows: result.data || result });
    }

    case 'workflow_status': {
      const result = await n8nApiFetch(`/workflows/${data.workflowId}`);
      return NextResponse.json({ ok: true, workflow: result });
    }

    case 'workflow_execute': {
      const result = await n8nApiFetch(`/workflows/${data.workflowId}/execute`, {
        method: 'POST',
        body: JSON.stringify({ data: data.payload }),
      });
      return NextResponse.json({ ok: true, execution: result });
    }

    // Automation management
    case 'automation_create': {
      const result = await n8nApiFetch('/workflows', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          nodes: data.nodes || [],
          connections: data.connections || {},
          settings: data.settings || {},
          active: data.active ?? false,
        }),
      });
      return NextResponse.json({ ok: true, workflow: result });
    }

    case 'automation_log': {
      const params = new URLSearchParams();
      if (data.workflowId) params.set('workflowId', data.workflowId);
      if (data.limit) params.set('limit', String(data.limit));
      if (data.status) params.set('status', data.status);
      const result = await n8nApiFetch(`/executions?${params.toString()}`);
      return NextResponse.json({ ok: true, executions: result.data || result });
    }

    default:
      return NextResponse.json({ error: `Unknown workflow: ${workflow}` }, { status: 400 });
  }
}
