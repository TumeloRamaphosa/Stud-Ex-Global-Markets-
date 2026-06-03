import { NextRequest, NextResponse } from 'next/server';

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

  const { workflow, data } = body as { workflow?: string; data?: Record<string, unknown> };
  if (!workflow || typeof workflow !== 'string') {
    return errorResponse('Missing or invalid "workflow" field', 400);
  }

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
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`n8n API error ${res.status}: ${errorText}`);
    }
    return res.json();
  }

  async function n8nRunnerFetch(endpoint: string, options?: RequestInit) {
    const res = await fetch(`${n8nRunnerUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`n8n runner error ${res.status}: ${errorText}`);
    }
    return res.json();
  }

  try {
    switch (workflow) {
      case 'trigger-invoice': {
        const result = await n8nRunnerFetch('/trigger-invoice', {
          method: 'POST',
          body: JSON.stringify(data || {}),
        });
        return NextResponse.json(result);
      }

      case 'calculate': {
        const result = await n8nRunnerFetch('/calculate', {
          method: 'POST',
          body: JSON.stringify(data || {}),
        });
        return NextResponse.json(result);
      }

      case 'price-lookup': {
        const cut = (data as Record<string, unknown> | undefined)?.cut;
        if (!cut) return errorResponse('Missing data.cut for price-lookup', 400);
        const result = await n8nRunnerFetch(`/price-lookup?cut=${encodeURIComponent(String(cut))}`);
        return NextResponse.json(result);
      }

      case 'webhook': {
        const webhookUrl = process.env.N8N_WEBHOOK_URL;
        if (!webhookUrl) return errorResponse('N8N_WEBHOOK_URL not set', 500);
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data || {}),
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`n8n webhook error ${res.status}: ${errorText}`);
        }
        return NextResponse.json(await res.json());
      }

      case 'trigger-email': {
        const result = await n8nRunnerFetch('/trigger-email', {
          method: 'POST',
          body: JSON.stringify(data || {}),
        });
        return NextResponse.json(result);
      }

      case 'trigger-whatsapp': {
        const result = await n8nRunnerFetch('/trigger-whatsapp', {
          method: 'POST',
          body: JSON.stringify(data || {}),
        });
        return NextResponse.json(result);
      }

      case 'trigger-sms': {
        const result = await n8nRunnerFetch('/trigger-sms', {
          method: 'POST',
          body: JSON.stringify(data || {}),
        });
        return NextResponse.json(result);
      }

      case 'workflow_list': {
        const result = await n8nApiFetch('/workflows');
        return NextResponse.json({ ok: true, workflows: result.data || result });
      }

      case 'workflow_status': {
        const workflowData = data as Record<string, unknown> | undefined;
        if (!workflowData?.workflowId) return errorResponse('Missing data.workflowId', 400);
        const result = await n8nApiFetch(`/workflows/${workflowData.workflowId}`);
        return NextResponse.json({ ok: true, workflow: result });
      }

      case 'workflow_execute': {
        const workflowData = data as Record<string, unknown> | undefined;
        if (!workflowData?.workflowId) return errorResponse('Missing data.workflowId', 400);
        const result = await n8nApiFetch(`/workflows/${workflowData.workflowId}/execute`, {
          method: 'POST',
          body: JSON.stringify({ data: workflowData.payload }),
        });
        return NextResponse.json({ ok: true, execution: result });
      }

      case 'automation_create': {
        const workflowData = data as Record<string, unknown> | undefined;
        if (!workflowData?.name) return errorResponse('Missing data.name for automation', 400);
        const result = await n8nApiFetch('/workflows', {
          method: 'POST',
          body: JSON.stringify({
            name: workflowData.name,
            nodes: workflowData.nodes || [],
            connections: workflowData.connections || {},
            settings: workflowData.settings || {},
            active: workflowData.active ?? false,
          }),
        });
        return NextResponse.json({ ok: true, workflow: result });
      }

      case 'automation_log': {
        const workflowData = data as Record<string, unknown> | undefined;
        const params = new URLSearchParams();
        if (workflowData?.workflowId) params.set('workflowId', String(workflowData.workflowId));
        if (workflowData?.limit) params.set('limit', String(workflowData.limit));
        if (workflowData?.status) params.set('status', String(workflowData.status));
        const result = await n8nApiFetch(`/executions?${params.toString()}`);
        return NextResponse.json({ ok: true, executions: result.data || result });
      }

      default:
        return errorResponse(`Unknown workflow: ${workflow}`, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'n8n request failed';
    console.error(`[n8n/${workflow}] Error:`, err);
    return errorResponse(message);
  }
}
