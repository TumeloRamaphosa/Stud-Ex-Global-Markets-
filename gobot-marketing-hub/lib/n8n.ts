/**
 * n8n Integration Client
 * Connects to n8n instance for workflow automation
 *
 * Workflows:
 *   1. Scheduled Posting — Posts content at scheduled times via Blotato
 *   2. Analytics Collection — Daily analytics snapshot from Blotato → Airtable
 *   3. Daily Report — Generate diagnostic report at 7 AM
 *   4. Content Queue Processor — Process queued posts from Airtable
 */

import type { N8nWorkflow, N8nExecution } from './types';

const N8N_BASE = process.env.N8N_BASE_URL;

async function n8nFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!N8N_BASE) throw new Error('N8N_BASE_URL not configured');

  const apiKey = process.env.N8N_API_KEY;

  const response = await fetch(`${N8N_BASE}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'X-N8N-API-KEY': apiKey } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`n8n API error (${response.status}): ${JSON.stringify(error)}`);
  }

  return response;
}

// ==================== WORKFLOWS ====================

export async function listWorkflows(): Promise<N8nWorkflow[]> {
  const res = await n8nFetch('/workflows');
  const data = await res.json();
  return data.data || [];
}

export async function getWorkflow(workflowId: string): Promise<N8nWorkflow> {
  const res = await n8nFetch(`/workflows/${workflowId}`);
  return res.json();
}

export async function activateWorkflow(workflowId: string): Promise<void> {
  await n8nFetch(`/workflows/${workflowId}/activate`, { method: 'POST' });
}

export async function deactivateWorkflow(workflowId: string): Promise<void> {
  await n8nFetch(`/workflows/${workflowId}/deactivate`, { method: 'POST' });
}

// ==================== EXECUTIONS ====================

export async function triggerWorkflow(
  workflowId: string,
  data?: Record<string, unknown>
): Promise<N8nExecution> {
  const res = await n8nFetch(`/workflows/${workflowId}/run`, {
    method: 'POST',
    body: JSON.stringify(data || {}),
  });
  return res.json();
}

export async function getExecution(executionId: string): Promise<N8nExecution> {
  const res = await n8nFetch(`/executions/${executionId}`);
  return res.json();
}

export async function listExecutions(
  workflowId?: string,
  limit: number = 20
): Promise<N8nExecution[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (workflowId) params.set('workflowId', workflowId);

  const res = await n8nFetch(`/executions?${params.toString()}`);
  const data = await res.json();
  return data.data || [];
}

// ==================== WEBHOOK TRIGGERS ====================

/**
 * Trigger a webhook-based n8n workflow.
 * Use this for custom triggers from the app (e.g., "Post Now" button).
 */
export async function triggerWebhook(
  webhookPath: string,
  payload: Record<string, unknown>
): Promise<unknown> {
  if (!N8N_BASE) throw new Error('N8N_BASE_URL not configured');

  const res = await fetch(`${N8N_BASE}/webhook/${webhookPath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return res.json();
}

// ==================== EXPORT ====================

export const n8nApi = {
  workflows: {
    list: listWorkflows,
    get: getWorkflow,
    activate: activateWorkflow,
    deactivate: deactivateWorkflow,
  },
  executions: {
    trigger: triggerWorkflow,
    get: getExecution,
    list: listExecutions,
  },
  webhook: triggerWebhook,
};
