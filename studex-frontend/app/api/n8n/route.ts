import { NextResponse } from 'next/server';

// ─── StudEx Meat — n8n Workflow Runner API Route ────────────────────────────
// Pattern: Same as Perplexity's Shopify integration (/api/shopify)
// Proxies to the n8n-runner container (Express on port 3003)
// In docker-compose: http://n8n-runner:3003
// On Fly.io: http://studex-n8n-runner.internal:3003
// Local dev: http://localhost:3003
// ────────────────────────────────────────────────────────────────────────────

const N8N_RUNNER = process.env.N8N_RUNNER_URL || 'http://localhost:3003';

async function runnerFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${N8N_RUNNER}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`n8n runner error ${res.status}: ${err}`);
  }
  return res.json();
}

export async function GET() {
  try {
    const health = await runnerFetch('/');
    return NextResponse.json(health);
  } catch (err: any) {
    return NextResponse.json({
      status: 'offline',
      message: 'n8n runner not reachable. Start with: docker compose up n8n-runner',
      error: err.message,
    }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { action } = body;

  try {
    // ─── WORKFLOWS ──────────────────────────────────────────────────────

    if (action === 'list_workflows') {
      const data = await runnerFetch('/workflows');
      return NextResponse.json(data);
    }

    if (action === 'execute_workflow') {
      const { workflowId, payload } = body;
      if (!workflowId) {
        return NextResponse.json({ error: 'workflowId required' }, { status: 400 });
      }
      const data = await runnerFetch(`/workflows/${workflowId}/execute`, {
        method: 'POST',
        body: JSON.stringify(payload || {}),
      });
      return NextResponse.json(data);
    }

    if (action === 'workflow_status') {
      const { workflowId } = body;
      if (!workflowId) {
        return NextResponse.json({ error: 'workflowId required' }, { status: 400 });
      }
      const data = await runnerFetch(`/workflows/${workflowId}/status`);
      return NextResponse.json(data);
    }

    // ─── INVOICES ───────────────────────────────────────────────────────

    if (action === 'calculate_invoice') {
      const data = await runnerFetch('/calculate-invoice', {
        method: 'POST',
        body: JSON.stringify({ items: body.items }),
      });
      return NextResponse.json(data);
    }

    if (action === 'trigger_invoice') {
      const data = await runnerFetch('/trigger-invoice', {
        method: 'POST',
        body: JSON.stringify({
          customer: body.customer,
          items: body.items,
        }),
      });
      return NextResponse.json(data);
    }

    if (action === 'pending_invoices') {
      const data = await runnerFetch('/pending-invoices');
      return NextResponse.json(data);
    }

    // ─── PRICE LOOKUP ───────────────────────────────────────────────────

    if (action === 'price_lookup') {
      const params = new URLSearchParams();
      if (body.cut) params.set('cut', body.cut);
      if (body.marble) params.set('marble', body.marble);
      const data = await runnerFetch(`/price-lookup?${params.toString()}`);
      return NextResponse.json(data);
    }

    return NextResponse.json(
      {
        error: 'Unknown action',
        available: [
          'list_workflows',
          'execute_workflow',
          'workflow_status',
          'calculate_invoice',
          'trigger_invoice',
          'pending_invoices',
          'price_lookup',
        ],
      },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
