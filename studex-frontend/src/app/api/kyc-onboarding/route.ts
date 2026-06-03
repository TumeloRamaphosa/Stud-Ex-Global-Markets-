import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/llm';
import { notifyAll } from '@/lib/notifications';

export const runtime = 'nodejs';

type RiskLevel = 'low' | 'medium' | 'high';
type AppStatus = 'pending' | 'screening' | 'approved' | 'flagged' | 'provisioning' | 'active' | 'rejected';

interface Application {
  id: string;
  companyName: string;
  email: string;
  whatsapp: string;
  agentType: string;
  monthlySpend: number;
  status: AppStatus;
  riskLevel: RiskLevel;
  flags: string[];
  checksPassed: string[];
  createdAt: string;
  updatedAt: string;
}

// In-memory store
const applications: Map<string, Application> = new Map();

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

// ── KYC Checks ──────────────────────────────────────────────────────────

async function verifyEmailDomain(email: string): Promise<{ valid: boolean; reason: string }> {
  try {
    const domain = email.split('@')[1];
    if (!domain) return { valid: false, reason: 'No domain in email' };

    // DNS MX lookup via public DNS-over-HTTPS
    const res = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    const hasMX = data.Answer && data.Answer.length > 0;
    return hasMX
      ? { valid: true, reason: `MX records found for ${domain}` }
      : { valid: false, reason: `No MX records for ${domain}` };
  } catch {
    return { valid: false, reason: 'DNS lookup failed' };
  }
}

function validateCompanyName(name: string): { valid: boolean; reason: string } {
  if (!name || name.length < 3) return { valid: false, reason: 'Company name too short' };
  if (/^[0-9]+$/.test(name)) return { valid: false, reason: 'Company name is purely numeric' };
  const suspiciousPatterns = /test|fake|asdf|xxx|sample/i;
  if (suspiciousPatterns.test(name)) return { valid: false, reason: 'Company name contains suspicious pattern' };
  const hasPtyLtd = /\b(pty|ltd|cc|inc|llc|holdings|group)\b/i.test(name);
  return { valid: true, reason: hasPtyLtd ? 'Registered entity format detected' : 'Basic name format accepted' };
}

function computeRiskRating(checks: { emailValid: boolean; nameValid: boolean; spend: number; email: string }): {
  risk: RiskLevel;
  flags: string[];
  checksPassed: string[];
} {
  const flags: string[] = [];
  const checksPassed: string[] = [];
  let score = 0;

  if (checks.emailValid) {
    checksPassed.push('Email domain has valid MX records');
  } else {
    flags.push('Email domain failed MX verification');
    score += 3;
  }

  if (checks.nameValid) {
    checksPassed.push('Company name format valid');
  } else {
    flags.push('Company name failed validation');
    score += 2;
  }

  // Consumer email domains increase risk
  const consumerDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  const domain = checks.email.split('@')[1]?.toLowerCase();
  if (domain && consumerDomains.includes(domain)) {
    flags.push('Using consumer email domain');
    score += 2;
  } else {
    checksPassed.push('Business email domain');
  }

  // Very high spend = higher scrutiny
  if (checks.spend > 100000) {
    flags.push('High monthly spend requires enhanced due diligence');
    score += 2;
  } else if (checks.spend >= 10000) {
    checksPassed.push('Monthly spend within standard range');
  } else if (checks.spend < 1000) {
    flags.push('Unusually low monthly spend');
    score += 1;
  }

  const risk: RiskLevel = score >= 5 ? 'high' : score >= 2 ? 'medium' : 'low';
  return { risk, flags, checksPassed };
}

async function runLLMAnalysis(app: Omit<Application, 'id' | 'status' | 'riskLevel' | 'flags' | 'checksPassed' | 'createdAt' | 'updatedAt'>): Promise<{ risk: RiskLevel; flags: string[]; summary: string } | null> {
  try {
    const prompt = `You are a KYC analyst for stud.exchange (South African fintech platform).
Analyze this client application and return ONLY valid JSON:
{
  "risk": "low" | "medium" | "high",
  "flags": ["string array of concerns"],
  "summary": "one-line assessment"
}

Application:
- Company: ${app.companyName}
- Email: ${app.email}
- WhatsApp: ${app.whatsapp}
- Agent Type: ${app.agentType}
- Monthly Spend: R ${app.monthlySpend}

Consider: email domain legitimacy, company name patterns, spend amount relative to agent type, South African business norms.`;

    const response = await chatCompletion([
      { role: 'user', content: prompt },
    ]);

    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

// ── Provisioning (calls n8n) ────────────────────────────────────────────

async function triggerProvisioning(app: Application): Promise<void> {
  const n8nUrl = process.env.N8N_WEBHOOK_URL || process.env.N8N_URL;
  if (n8nUrl) {
    try {
      await fetch(`${n8nUrl}/webhook/kyc-provision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: app.id,
          companyName: app.companyName,
          email: app.email,
          whatsapp: app.whatsapp,
          agentType: app.agentType,
          monthlySpend: app.monthlySpend,
          tasks: [
            'provision_vm', 'create_agentmail_inbox', 'inject_northstar_data',
            'send_welcome_email', 'post_slack_new_commissions',
            'setup_monitoring', 'configure_dns', 'deploy_agent_instance',
            'create_billing_profile', 'setup_whatsapp_integration',
            'initialize_analytics', 'configure_webhooks',
            'setup_backup_schedule', 'create_support_ticket',
            'register_domain_alias', 'sync_crm_record',
          ],
        }),
      });
    } catch (err) {
      console.error('[kyc-onboarding] n8n provisioning webhook failed:', err);
    }
  }
}

// ── Route Handler ───────────────────────────────────────────────────────

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
      // ── Submit new application ──
      case 'submit_application': {
        const companyName = String(body.companyName || '').trim();
        const email = String(body.email || '').trim();
        const whatsapp = String(body.whatsapp || '').trim();
        const agentType = String(body.agentType || 'RetailBot');
        const monthlySpend = Number(body.monthlySpend) || 0;

        if (!companyName) return errorResponse('Missing company name', 400);
        if (!email) return errorResponse('Missing email', 400);
        if (!whatsapp) return errorResponse('Missing WhatsApp number', 400);

        const id = `kyc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        // Run KYC checks in parallel
        const [emailCheck, nameCheck] = await Promise.all([
          verifyEmailDomain(email),
          Promise.resolve(validateCompanyName(companyName)),
        ]);

        const rating = computeRiskRating({
          emailValid: emailCheck.valid,
          nameValid: nameCheck.valid,
          spend: monthlySpend,
          email,
        });

        // Optional LLM analysis to augment
        const llmResult = await runLLMAnalysis({ companyName, email, whatsapp, agentType, monthlySpend });
        if (llmResult) {
          // Merge LLM flags
          for (const flag of llmResult.flags) {
            if (!rating.flags.includes(flag)) rating.flags.push(flag);
          }
          // Use higher risk if LLM disagrees upward
          const riskOrder: RiskLevel[] = ['low', 'medium', 'high'];
          if (riskOrder.indexOf(llmResult.risk) > riskOrder.indexOf(rating.risk)) {
            rating.risk = llmResult.risk;
          }
        }

        const now = new Date().toISOString();
        const application: Application = {
          id,
          companyName,
          email,
          whatsapp,
          agentType,
          monthlySpend,
          status: rating.risk === 'low' ? 'approved' : rating.risk === 'medium' ? 'flagged' : 'flagged',
          riskLevel: rating.risk,
          flags: rating.flags,
          checksPassed: rating.checksPassed,
          createdAt: now,
          updatedAt: now,
        };

        applications.set(id, application);

        // Notifications based on risk
        if (rating.risk === 'low') {
          await notifyAll(`[KYC Auto-Approved] ${companyName} (${agentType}) - R${monthlySpend}/mo - Low risk`);
          // Auto-provision for low risk
          application.status = 'provisioning';
          application.updatedAt = new Date().toISOString();
          await triggerProvisioning(application);
          application.status = 'active';
          application.updatedAt = new Date().toISOString();
        } else if (rating.risk === 'medium') {
          await notifyAll(`[KYC Review Needed] ${companyName} - Medium risk - Flags: ${rating.flags.join(', ')}`);
        } else {
          await notifyAll(`[KYC HIGH RISK] ${companyName} - Manual review required - Flags: ${rating.flags.join(', ')}`);
        }

        return NextResponse.json({
          ok: true,
          application,
          kycReport: {
            risk_level: rating.risk,
            checks_passed: rating.checksPassed,
            flags: rating.flags,
            email_check: emailCheck,
            name_check: nameCheck,
            llm_analysis: llmResult,
          },
        });
      }

      // ── List applications ──
      case 'get_applications': {
        const apps = Array.from(applications.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return NextResponse.json({ ok: true, applications: apps });
      }

      // ── Approve ──
      case 'approve': {
        const appId = String(body.applicationId || '');
        const app = applications.get(appId);
        if (!app) return errorResponse('Application not found', 404);
        app.status = 'approved';
        app.updatedAt = new Date().toISOString();
        await notifyAll(`[KYC Approved] ${app.companyName} manually approved`);
        return NextResponse.json({ ok: true, application: app });
      }

      // ── Reject ──
      case 'reject': {
        const appId = String(body.applicationId || '');
        const app = applications.get(appId);
        if (!app) return errorResponse('Application not found', 404);
        app.status = 'rejected';
        app.updatedAt = new Date().toISOString();
        await notifyAll(`[KYC Rejected] ${app.companyName} rejected`);
        return NextResponse.json({ ok: true, application: app });
      }

      // ── Provision ──
      case 'provision': {
        const appId = String(body.applicationId || '');
        const app = applications.get(appId);
        if (!app) return errorResponse('Application not found', 404);
        if (app.status !== 'approved') return errorResponse('Application must be approved before provisioning', 400);
        app.status = 'provisioning';
        app.updatedAt = new Date().toISOString();
        await triggerProvisioning(app);
        app.status = 'active';
        app.updatedAt = new Date().toISOString();
        await notifyAll(`[Provisioned] ${app.companyName} is now active - ${app.agentType} deployed`);
        return NextResponse.json({ ok: true, application: app });
      }

      // ── Stats ──
      case 'get_stats': {
        const all = Array.from(applications.values());
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const activeThisMonth = all.filter(
          (a) => a.status === 'active' && new Date(a.updatedAt) >= monthStart
        ).length;
        const pendingReviews = all.filter(
          (a) => a.status === 'flagged' || a.status === 'pending' || a.status === 'screening'
        ).length;
        const revenueMRR = all
          .filter((a) => a.status === 'active')
          .reduce((sum, a) => sum + a.monthlySpend, 0);

        return NextResponse.json({
          ok: true,
          stats: {
            totalClients: all.length,
            pendingReviews,
            activeThisMonth,
            revenueMRR,
          },
        });
      }

      default:
        return errorResponse(`Unknown action: ${action}`, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'KYC onboarding request failed';
    console.error(`[kyc-onboarding/${action}] Error:`, err);
    return errorResponse(message);
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'kyc-onboarding',
    actions: ['submit_application', 'get_applications', 'approve', 'reject', 'provision', 'get_stats'],
    totalApplications: applications.size,
  });
}
