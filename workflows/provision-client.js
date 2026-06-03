#!/usr/bin/env node

/**
 * Client Provisioning Workflow
 * Receives client details and runs the full onboarding pipeline.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3004';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// ── Helpers ──────────────────────────────────────────────────────────────────

async function post(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

function log(step, msg) {
  console.log(`[Step ${step}] ${msg}`);
}

function generateDockerCompose(client) {
  return `# Auto-generated for ${client.companyName}
version: "3.9"
services:
  agent-${client.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}:
    image: paperclip/agent:latest
    restart: unless-stopped
    environment:
      COMPANY_NAME: "${client.companyName}"
      AGENT_TYPE: "${client.agentType}"
      CONTACT_EMAIL: "${client.email}"
      RISK_LEVEL: "${client.riskLevel}"
    ports:
      - "3010:3000"
    labels:
      managed-by: "paperclip-provisioner"
      client: "${client.companyName}"
`;
}

// ── Provisioning Steps ───────────────────────────────────────────────────────

async function createAgentMailInbox(client) {
  log(1, `Creating AgentMail inbox for ${client.email}...`);
  const res = await post(`${BASE_URL}/api/agentmail`, {
    email: client.email,
    company: client.companyName,
  });
  if (!res.ok) throw new Error(`AgentMail creation failed (${res.status})`);
  log(1, `Inbox created: ${JSON.stringify(res.data)}`);
  return res.data;
}

async function provisionAgentVM(client) {
  log(2, `Generating agent VM config for ${client.companyName}...`);
  const compose = generateDockerCompose(client);
  log(2, `Docker-compose config:\n${compose}`);
  return { dockerCompose: compose };
}

async function injectNorthstarData(client) {
  log(3, `Injecting Northstar data into Supabase...`);
  if (!SUPABASE_ACCESS_TOKEN) {
    log(3, 'SUPABASE_ACCESS_TOKEN not set — skipping Supabase insert.');
    return { skipped: true };
  }
  const res = await post(
    `${SUPABASE_URL}/rest/v1/northstars`,
    {
      company_name: client.companyName,
      contact_email: client.email,
      agent_type: client.agentType,
      monthly_spend: client.monthlySpend,
      risk_level: client.riskLevel,
      status: 'pending',
      created_at: new Date().toISOString(),
    },
    {
      apikey: SUPABASE_ACCESS_TOKEN,
      Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      Prefer: 'return=representation',
    },
  );
  if (!res.ok) throw new Error(`Supabase insert failed (${res.status}): ${JSON.stringify(res.data)}`);
  log(3, `Northstar record created: ${JSON.stringify(res.data)}`);
  return res.data;
}

async function sendWelcomeEmail(client) {
  log(4, `Sending welcome email to ${client.email}...`);
  const res = await post(`${BASE_URL}/api/n8n`, {
    workflow: 'trigger-email',
    payload: {
      to: client.email,
      company: client.companyName,
      whatsapp: client.whatsapp,
      agentType: client.agentType,
    },
  });
  if (!res.ok) log(4, `Warning: welcome email trigger returned ${res.status}`);
  else log(4, 'Welcome email triggered.');
  return res.data;
}

async function postToSlackCommissions(client) {
  log(5, `Posting to Slack #new-commissions...`);
  if (!SLACK_WEBHOOK_URL) {
    log(5, 'SLACK_WEBHOOK_URL not set — skipping.');
    return { skipped: true };
  }
  const text = [
    `:tada: *New Client Provisioned*`,
    `• Company: ${client.companyName}`,
    `• Email: ${client.email}`,
    `• WhatsApp: ${client.whatsapp || 'N/A'}`,
    `• Agent Type: ${client.agentType}`,
    `• Monthly Spend: $${client.monthlySpend}`,
    `• Risk Level: ${client.riskLevel}`,
  ].join('\n');

  const res = await post(SLACK_WEBHOOK_URL, { text });
  if (!res.ok) log(5, `Warning: Slack post returned ${res.status}`);
  else log(5, 'Slack notification sent.');
  return res.data;
}

async function updateKYCStatus(client) {
  log(6, `Updating KYC status to "active" for ${client.companyName}...`);
  if (!SUPABASE_ACCESS_TOKEN) {
    log(6, 'SUPABASE_ACCESS_TOKEN not set — skipping.');
    return { skipped: true };
  }
  const res = await post(
    `${SUPABASE_URL}/rest/v1/rpc/update_kyc_status`,
    { p_email: client.email, p_status: 'active' },
    {
      apikey: SUPABASE_ACCESS_TOKEN,
      Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
    },
  );
  if (!res.ok) log(6, `Warning: KYC update returned ${res.status}. You may need to update manually.`);
  else log(6, 'KYC status set to active.');
  return res.data;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function provision(client) {
  console.log(`\n=== Provisioning Client: ${client.companyName} ===\n`);

  const report = { client: client.companyName, steps: {} };

  try {
    report.steps.agentMail = await createAgentMailInbox(client);
  } catch (err) {
    report.steps.agentMail = { error: err.message };
  }

  try {
    report.steps.vmConfig = await provisionAgentVM(client);
  } catch (err) {
    report.steps.vmConfig = { error: err.message };
  }

  try {
    report.steps.northstar = await injectNorthstarData(client);
  } catch (err) {
    report.steps.northstar = { error: err.message };
  }

  try {
    report.steps.welcomeEmail = await sendWelcomeEmail(client);
  } catch (err) {
    report.steps.welcomeEmail = { error: err.message };
  }

  try {
    report.steps.slackNotification = await postToSlackCommissions(client);
  } catch (err) {
    report.steps.slackNotification = { error: err.message };
  }

  try {
    report.steps.kycStatus = await updateKYCStatus(client);
  } catch (err) {
    report.steps.kycStatus = { error: err.message };
  }

  console.log('\n=== Provisioning Report ===');
  console.log(JSON.stringify(report, null, 2));
  console.log('=== Done ===\n');

  return report;
}

// ── CLI Entry ────────────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: ./provision-client.js \'{"companyName":"Acme","email":"a@b.com","whatsapp":"+1234","agentType":"sales","monthlySpend":500,"riskLevel":"low"}\'');
    console.log('\nOr pipe JSON via stdin.');
    process.exit(0);
  }

  let client;
  try {
    client = JSON.parse(args[0]);
  } catch {
    console.error('Error: Invalid JSON argument.');
    process.exit(1);
  }

  const required = ['companyName', 'email', 'agentType', 'monthlySpend', 'riskLevel'];
  const missing = required.filter((k) => !client[k]);
  if (missing.length > 0) {
    console.error(`Error: Missing required fields: ${missing.join(', ')}`);
    process.exit(1);
  }

  provision(client).catch((err) => {
    console.error('Provisioning failed:', err);
    process.exit(1);
  });
}

module.exports = { provision };
