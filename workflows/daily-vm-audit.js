#!/usr/bin/env node

/**
 * Daily VM Audit Workflow
 * Checks Docker containers, Supabase Northstars, Fly.io apps, and Manus VM health.
 * Posts report to Slack, Discord, and stdout.
 */

const { execSync } = require('child_process');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const FLY_API_TOKEN = process.env.FLY_API_TOKEN;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const MANUS_VM_IP = '35.196.24.245';

// ── Helpers ──────────────────────────────────────────────────────────────────

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', timeout: 30_000 }).trim();
  } catch (err) {
    return null;
  }
}

async function httpGet(url, headers = {}) {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(10_000) });
    return { ok: res.ok, status: res.status, body: await res.text() };
  } catch (err) {
    return { ok: false, status: 0, body: err.message };
  }
}

async function httpPost(url, body, headers = {}) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: 0 };
  }
}

function timestamp() {
  return new Date().toISOString();
}

// ── Checks ───────────────────────────────────────────────────────────────────

function checkDockerContainers() {
  const raw = run('docker ps -a --format "{{json .}}"');
  if (!raw) return { containers: [], error: 'docker not available or no containers' };

  const containers = raw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean);

  const unhealthy = containers.filter((c) => {
    const state = (c.State || '').toLowerCase();
    const status = (c.Status || '').toLowerCase();
    const restartMatch = status.match(/restarting/i);
    const highRestarts = /restart/i.test(status);
    return state !== 'running' || restartMatch || highRestarts;
  });

  return { containers, unhealthy };
}

async function checkSupabaseNorthstars() {
  if (!SUPABASE_ACCESS_TOKEN) return { count: null, error: 'SUPABASE_ACCESS_TOKEN not set' };

  const url = `${SUPABASE_URL}/rest/v1/northstars?select=id&status=neq.complete`;
  const res = await httpGet(url, {
    apikey: SUPABASE_ACCESS_TOKEN,
    Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
    Prefer: 'count=exact',
  });

  if (!res.ok) return { count: null, error: `Supabase responded ${res.status}` };

  try {
    const data = JSON.parse(res.body);
    return { count: Array.isArray(data) ? data.length : 0 };
  } catch {
    return { count: null, error: 'Failed to parse Supabase response' };
  }
}

async function checkFlyApps() {
  if (!FLY_API_TOKEN) return { apps: [], error: 'FLY_API_TOKEN not set' };

  // Try flyctl first
  const raw = run(`FLY_API_TOKEN=${FLY_API_TOKEN} flyctl apps list --json 2>/dev/null`);
  if (raw) {
    try {
      const apps = JSON.parse(raw);
      return { apps };
    } catch {}
  }

  // Fall back to Fly GraphQL API
  const res = await httpPost(
    'https://api.fly.io/graphql',
    { query: '{ apps { nodes { id name status hostname } } }' },
    { Authorization: `Bearer ${FLY_API_TOKEN}` },
  );

  if (res.ok) {
    try {
      const data = JSON.parse(res.body || '{}');
      return { apps: data?.data?.apps?.nodes || [] };
    } catch {}
  }

  return { apps: [], error: 'Could not reach Fly.io API' };
}

async function checkManusVM() {
  const [port3004, port11434] = await Promise.all([
    httpGet(`http://${MANUS_VM_IP}:3004/health`),
    httpGet(`http://${MANUS_VM_IP}:11434/api/tags`),
  ]);

  let ollamaModels = [];
  if (port11434.ok) {
    try {
      const data = JSON.parse(port11434.body);
      ollamaModels = (data.models || []).map((m) => m.name || m.model || 'unknown');
    } catch {}
  }

  return {
    port3004: port3004.ok ? 'healthy' : `unreachable (${port3004.status || port3004.body})`,
    port11434: port11434.ok ? 'healthy' : `unreachable (${port11434.status || port11434.body})`,
    ollamaModels,
  };
}

// ── Report ───────────────────────────────────────────────────────────────────

function buildReport({ docker, northstars, fly, manus }) {
  const lines = [
    `=== Daily VM Audit Report ===`,
    `Timestamp: ${timestamp()}`,
    '',
    '── Docker Containers ──',
  ];

  if (docker.error) {
    lines.push(`  Error: ${docker.error}`);
  } else {
    lines.push(`  Total containers: ${docker.containers.length}`);
    lines.push(`  Running: ${docker.containers.filter((c) => (c.State || '').toLowerCase() === 'running').length}`);
    lines.push(`  Unhealthy / problematic: ${docker.unhealthy.length}`);
    if (docker.unhealthy.length > 0) {
      lines.push('  Unhealthy agents:');
      docker.unhealthy.forEach((c) => {
        lines.push(`    - ${c.Names || c.ID}: state=${c.State}, status=${c.Status}`);
      });
    }
  }

  lines.push('');
  lines.push('── Incomplete Northstars ──');
  if (northstars.error) {
    lines.push(`  Error: ${northstars.error}`);
  } else {
    lines.push(`  Count: ${northstars.count}`);
  }

  lines.push('');
  lines.push('── Fly.io Apps ──');
  if (fly.error) {
    lines.push(`  Error: ${fly.error}`);
  } else {
    lines.push(`  Total apps: ${fly.apps.length}`);
    fly.apps.forEach((a) => {
      lines.push(`    - ${a.name || a.Name || a.id}: ${a.status || a.Status || 'unknown'}`);
    });
  }

  lines.push('');
  lines.push(`── Manus VM (${MANUS_VM_IP}) ──`);
  lines.push(`  Port 3004 (app):    ${manus.port3004}`);
  lines.push(`  Port 11434 (ollama): ${manus.port11434}`);
  if (manus.ollamaModels.length > 0) {
    lines.push(`  Ollama models loaded: ${manus.ollamaModels.join(', ')}`);
  } else {
    lines.push('  Ollama models loaded: none / unavailable');
  }

  lines.push('');
  lines.push('=== End of Report ===');
  return lines.join('\n');
}

// ── Notify ───────────────────────────────────────────────────────────────────

async function postToSlack(report) {
  if (!SLACK_WEBHOOK_URL) return;
  await httpPost(SLACK_WEBHOOK_URL, { text: '```\n' + report + '\n```' });
}

async function postToDiscord(report) {
  if (!DISCORD_WEBHOOK_URL) return;
  await httpPost(DISCORD_WEBHOOK_URL, { content: '```\n' + report + '\n```' });
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Starting daily VM audit...\n');

  const [docker, northstars, fly, manus] = await Promise.all([
    Promise.resolve(checkDockerContainers()),
    checkSupabaseNorthstars(),
    checkFlyApps(),
    checkManusVM(),
  ]);

  const report = buildReport({ docker, northstars, fly, manus });
  console.log(report);

  await Promise.all([postToSlack(report), postToDiscord(report)]);

  console.log('\nAudit complete. Notifications sent (if webhooks configured).');
}

main().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
