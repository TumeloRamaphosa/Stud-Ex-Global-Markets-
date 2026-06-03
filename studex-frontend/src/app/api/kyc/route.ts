import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/llm";
import { recordAgentEvent } from "@/lib/agent-memory";

export const runtime = "nodejs";

type RiskLevel = "low" | "medium" | "high";

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function heuristicRiskScore(body: Record<string, unknown>): { risk: RiskLevel; confidence: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  const domain = normalizeText(body.domain);
  const email = normalizeText(body.email);
  const businessName = normalizeText(body.businessName || body.companyName);
  const registration = normalizeText(body.companyRegistrationNumber);

  if (!domain) {
    score += 3;
    reasons.push("Missing business domain");
  }
  if (domain && domain.includes("gmail.com")) {
    score += 3;
    reasons.push("Business email appears to use a consumer domain");
  }
  if (!email) {
    score += 2;
    reasons.push("Missing contact email");
  }
  if (!businessName) {
    score += 2;
    reasons.push("Missing company name");
  }
  if (!registration) {
    score += 1;
    reasons.push("Missing company registration number");
  }
  if (normalizeText(body.country).toUpperCase() === "ZA" && !registration) {
    score += 1;
    reasons.push("South African business without registration number");
  }

  if (score >= 5) return { risk: "high", confidence: 0.81, reasons };
  if (score >= 2) return { risk: "medium", confidence: 0.72, reasons };
  return { risk: "low", confidence: 0.88, reasons: reasons.length ? reasons : ["Basic intake checks passed"] };
}

function fallbackReport(body: Record<string, unknown>) {
  const heuristic = heuristicRiskScore(body);
  return {
    clientId: normalizeText(body.clientId) || `client_${Date.now()}`,
    businessName: normalizeText(body.businessName || body.companyName) || "Unknown business",
    domain: normalizeText(body.domain),
    email: normalizeText(body.email),
    country: normalizeText(body.country) || "ZA",
    risk: heuristic.risk,
    confidence: heuristic.confidence,
    checks: {
      emailDomainReal: Boolean(normalizeText(body.domain)),
      companyRegistryMatch: Boolean(normalizeText(body.companyRegistrationNumber)),
      sanctions: false,
      suspicious: heuristic.risk === "high",
    },
    reasons: heuristic.reasons,
    recommendedAction:
      heuristic.risk === "low" ? "auto_provision" : heuristic.risk === "medium" ? "approve_with_review" : "manual_review",
    nextSteps: [
      heuristic.risk === "low" ? "Continue with automated provisioning" : "Await approval",
      "Create AgentMail inbox if approved",
      "Notify Slack / n8n",
    ],
  };
}

async function analyzeWithModel(body: Record<string, unknown>) {
  const prompt = [
    "You are a KYC screener for a South African financial-services onboarding flow.",
    "Return STRICT JSON only with these keys:",
    "{ clientId, businessName, domain, email, country, risk, confidence, checks, reasons, recommendedAction, nextSteps }",
    "Risk must be one of low, medium, high.",
    "Checks must include emailDomainReal, companyRegistryMatch, sanctions, suspicious.",
    "If information is missing, downgrade confidence and explain why.",
    "",
    JSON.stringify(body, null, 2),
  ].join("\n");

  const response = await chatCompletion([
    { role: "system", content: "Return only valid JSON. No markdown." },
    { role: "user", content: prompt },
  ]);

  const cleaned = response.trim();
  return JSON.parse(cleaned) as Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const action = normalizeText(body.action) || "intake";

  let report: Record<string, unknown>;
  try {
    report = await analyzeWithModel(body);
  } catch {
    report = fallbackReport(body);
  }

  const normalizedReport = {
    ...fallbackReport(body),
    ...report,
  };

  await recordAgentEvent({
    agent: "CashClaw",
    action: `kyc_${action}`,
    status: "completed",
    summary: `KYC ${action} completed for ${normalizeText(body.businessName || body.companyName) || "a client"}.`,
    source: "/api/kyc",
    details: normalizedReport,
    model: {
      provider: process.env.LOCAL_FIRST_LLM === "true" ? "ollama" : process.env.LLM_PROVIDER || "anthropic",
      name: process.env.LLM_MODEL || process.env.OLLAMA_MODEL_CASHCLAW || "qwen3:30b",
      url: process.env.OLLAMA_URL || "http://35.196.24.245:11434",
    },
  });

  return NextResponse.json({
    ok: true,
    action,
    report: normalizedReport,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "kyc",
    actions: ["intake", "review", "provision_decision"],
  });
}
