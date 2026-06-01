import { Router } from 'express';
import { randomUUID } from 'crypto';

export const workflowsRouter = Router();

// In-memory workflow registry and run history
const workflows = new Map();
const workflowRuns = new Map();

// Seed built-in automation workflows
const BUILT_IN_WORKFLOWS = [
  {
    id: 'wf-invoice-pipeline',
    name: 'invoice_pipeline',
    description: 'Full invoice pipeline: calculate prices, create QuickBooks invoice, email PDF to customer',
    steps: ['price_lookup', 'calculate_totals', 'create_invoice', 'send_email'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wf-order-notification',
    name: 'order_notification',
    description: 'Send order status update via WhatsApp and email',
    steps: ['compose_message', 'send_whatsapp', 'send_email'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wf-sheet-sync',
    name: 'sheet_sync',
    description: 'Read pending rows from Google Sheets and process each as an invoice',
    steps: ['read_sheet', 'filter_pending', 'trigger_invoices', 'mark_processed'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wf-backup-invoices',
    name: 'backup_invoices',
    description: 'Download invoice PDFs from QuickBooks and upload to Google Drive',
    steps: ['fetch_pdf', 'upload_drive'],
    createdAt: new Date().toISOString(),
  },
];

for (const wf of BUILT_IN_WORKFLOWS) {
  workflows.set(wf.id, wf);
}

// GET /workflows — list available workflows
workflowsRouter.get('/workflows', (_req, res) => {
  const list = Array.from(workflows.values()).map(wf => ({
    id: wf.id,
    name: wf.name,
    description: wf.description,
    steps: wf.steps,
    createdAt: wf.createdAt,
  }));

  res.json({ workflows: list, total: list.length });
});

// POST /workflows/execute — execute a workflow by name
workflowsRouter.post('/workflows/execute', async (req, res) => {
  try {
    const { name, params } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const workflow = Array.from(workflows.values()).find(wf => wf.name === name);
    if (!workflow) {
      return res.status(404).json({
        error: `Workflow "${name}" not found`,
        available: Array.from(workflows.values()).map(wf => wf.name),
      });
    }

    const runId = `run-${randomUUID()}`;
    const run = {
      id: runId,
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: 'running',
      params: params || {},
      steps: [],
      startedAt: new Date().toISOString(),
      completedAt: null,
    };

    workflowRuns.set(runId, run);

    // Simulate step execution asynchronously
    (async () => {
      try {
        for (const step of workflow.steps) {
          run.steps.push({
            name: step,
            status: 'completed',
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
          });
        }
        run.status = 'completed';
        run.completedAt = new Date().toISOString();
      } catch (err) {
        run.status = 'failed';
        run.error = err.message;
        run.completedAt = new Date().toISOString();
      }
    })();

    res.json({
      success: true,
      runId,
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: run.status,
    });
  } catch (err) {
    console.error('workflow execute error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /workflows/:id/status — get workflow run status
workflowsRouter.get('/workflows/:id/status', (req, res) => {
  const { id } = req.params;

  const run = workflowRuns.get(id);
  if (!run) {
    return res.status(404).json({ error: `Workflow run "${id}" not found` });
  }

  res.json({
    id: run.id,
    workflowId: run.workflowId,
    workflowName: run.workflowName,
    status: run.status,
    params: run.params,
    steps: run.steps,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    error: run.error || null,
  });
});

// POST /workflows/create — create a new automation workflow
workflowsRouter.post('/workflows/create', (req, res) => {
  try {
    const { name, description, steps } = req.body;

    if (!name || !description || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({ error: 'name, description, and steps[] are required' });
    }

    const existing = Array.from(workflows.values()).find(wf => wf.name === name);
    if (existing) {
      return res.status(409).json({ error: `Workflow with name "${name}" already exists`, id: existing.id });
    }

    const id = `wf-${randomUUID()}`;
    const workflow = {
      id,
      name,
      description,
      steps,
      createdAt: new Date().toISOString(),
    };

    workflows.set(id, workflow);

    res.status(201).json({ success: true, workflow });
  } catch (err) {
    console.error('workflow create error:', err);
    res.status(500).json({ error: err.message });
  }
});
