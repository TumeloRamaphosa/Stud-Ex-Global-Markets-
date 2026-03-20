import { NextResponse } from 'next/server';
import { n8nApi } from '@/lib/n8n';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const workflowId = searchParams.get('workflowId');

  try {
    if (action === 'executions') {
      const executions = await n8nApi.executions.list(workflowId || undefined);
      return NextResponse.json({ executions });
    }

    if (action === 'workflow' && workflowId) {
      const workflow = await n8nApi.workflows.get(workflowId);
      return NextResponse.json(workflow);
    }

    const workflows = await n8nApi.workflows.list();
    return NextResponse.json({ workflows });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch n8n data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, workflowId, webhookPath, payload } = body;

    if (action === 'activate' && workflowId) {
      await n8nApi.workflows.activate(workflowId);
      return NextResponse.json({ success: true, message: 'Workflow activated' });
    }

    if (action === 'deactivate' && workflowId) {
      await n8nApi.workflows.deactivate(workflowId);
      return NextResponse.json({ success: true, message: 'Workflow deactivated' });
    }

    if (action === 'trigger' && workflowId) {
      const execution = await n8nApi.executions.trigger(workflowId, payload);
      return NextResponse.json(execution);
    }

    if (action === 'webhook' && webhookPath) {
      const result = await n8nApi.webhook(webhookPath, payload || {});
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'n8n action failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
