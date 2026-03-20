/**
 * Airtable API Client
 * Content calendar, scheduling, and action tracking
 *
 * Base URL: https://api.airtable.com/v0
 * Auth: Bearer token (Personal Access Token)
 *
 * Tables:
 *   - Content Calendar: Tracks all posts (draft, scheduled, posted)
 *   - Analytics: Daily platform metrics
 *   - Automation Log: Record of all automated actions
 */

import type {
  AirtableContentRecord,
  AirtableAnalyticsRecord,
  AirtableAutomationLog,
} from './types';

const AIRTABLE_BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_URL || 'https://api.airtable.com/v0';

function getBaseId(): string {
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!baseId) throw new Error('AIRTABLE_BASE_ID not configured');
  return baseId;
}

async function airtableFetch(
  tableName: string,
  path: string = '',
  options: RequestInit = {}
): Promise<Response> {
  const pat = process.env.AIRTABLE_PAT;
  if (!pat) throw new Error('AIRTABLE_PAT not configured');

  const baseId = getBaseId();
  const url = `${AIRTABLE_BASE}/${baseId}/${encodeURIComponent(tableName)}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${pat}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Airtable API error (${response.status}): ${JSON.stringify(error)}`);
  }

  return response;
}

// ==================== CONTENT CALENDAR ====================

const CONTENT_TABLE = 'Content Calendar';

export async function listContentRecords(
  filterFormula?: string,
  sort?: { field: string; direction: 'asc' | 'desc' }[]
): Promise<AirtableContentRecord[]> {
  const params = new URLSearchParams();
  if (filterFormula) params.set('filterByFormula', filterFormula);
  if (sort) {
    sort.forEach((s, i) => {
      params.set(`sort[${i}][field]`, s.field);
      params.set(`sort[${i}][direction]`, s.direction);
    });
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await airtableFetch(CONTENT_TABLE, query);
  const data = await res.json();
  return data.records || [];
}

export async function getContentRecord(recordId: string): Promise<AirtableContentRecord> {
  const res = await airtableFetch(CONTENT_TABLE, `/${recordId}`);
  return res.json();
}

export async function createContentRecord(
  fields: AirtableContentRecord['fields']
): Promise<AirtableContentRecord> {
  const res = await airtableFetch(CONTENT_TABLE, '', {
    method: 'POST',
    body: JSON.stringify({ fields }),
  });
  return res.json();
}

export async function updateContentRecord(
  recordId: string,
  fields: Partial<AirtableContentRecord['fields']>
): Promise<AirtableContentRecord> {
  const res = await airtableFetch(CONTENT_TABLE, `/${recordId}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields }),
  });
  return res.json();
}

export async function deleteContentRecord(recordId: string): Promise<void> {
  await airtableFetch(CONTENT_TABLE, `/${recordId}`, { method: 'DELETE' });
}

// Convenience: Get scheduled posts for today
export async function getTodaysScheduledPosts(): Promise<AirtableContentRecord[]> {
  const today = new Date().toISOString().split('T')[0];
  return listContentRecords(
    `AND({Status}='Scheduled', {Scheduled Date}='${today}')`,
    [{ field: 'Scheduled Time', direction: 'asc' }]
  );
}

// Convenience: Get posts by status
export async function getPostsByStatus(
  status: AirtableContentRecord['fields']['Status']
): Promise<AirtableContentRecord[]> {
  return listContentRecords(`{Status}='${status}'`, [
    { field: 'Scheduled Date', direction: 'desc' },
  ]);
}

// ==================== ANALYTICS TABLE ====================

const ANALYTICS_TABLE = 'Analytics';

export async function listAnalytics(
  days: number = 7
): Promise<AirtableAnalyticsRecord[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().split('T')[0];

  return (await airtableFetch(
    ANALYTICS_TABLE,
    `?filterByFormula=IS_AFTER({Date}, '${startStr}')&sort[0][field]=Date&sort[0][direction]=desc`
  ).then((r) => r.json())).records || [];
}

export async function saveAnalyticsSnapshot(
  fields: AirtableAnalyticsRecord['fields']
): Promise<AirtableAnalyticsRecord> {
  const res = await airtableFetch(ANALYTICS_TABLE, '', {
    method: 'POST',
    body: JSON.stringify({ fields }),
  });
  return res.json();
}

// ==================== AUTOMATION LOG ====================

const LOG_TABLE = 'Automation Log';

export async function logAutomation(
  fields: AirtableAutomationLog['fields']
): Promise<AirtableAutomationLog> {
  const res = await airtableFetch(LOG_TABLE, '', {
    method: 'POST',
    body: JSON.stringify({
      fields: {
        ...fields,
        'Triggered At': fields['Triggered At'] || new Date().toISOString(),
      },
    }),
  });
  return res.json();
}

export async function listAutomationLogs(
  limit: number = 50
): Promise<AirtableAutomationLog[]> {
  const res = await airtableFetch(
    LOG_TABLE,
    `?maxRecords=${limit}&sort[0][field]=Triggered At&sort[0][direction]=desc`
  );
  const data = await res.json();
  return data.records || [];
}

// ==================== EXPORT ALL ====================

export const airtableApi = {
  content: {
    list: listContentRecords,
    get: getContentRecord,
    create: createContentRecord,
    update: updateContentRecord,
    delete: deleteContentRecord,
    todaysScheduled: getTodaysScheduledPosts,
    byStatus: getPostsByStatus,
  },
  analytics: {
    list: listAnalytics,
    save: saveAnalyticsSnapshot,
  },
  log: {
    create: logAutomation,
    list: listAutomationLogs,
  },
};
