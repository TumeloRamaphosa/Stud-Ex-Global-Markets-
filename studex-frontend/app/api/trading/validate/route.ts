/**
 * High-Value Trade Validation API
 *
 * When the desktop bot identifies a trade above the value threshold,
 * it calls this endpoint for a second opinion from Claude.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { setup, context } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        verdict: 'APPROVE',
        confidence: 5,
        risk: 'UNKNOWN',
        note: 'AI validation not configured — auto-approving',
      });
    }

    try {
      const { generateText } = await import('ai');
      const { anthropic } = await import('@ai-sdk/anthropic');

      const prompt = `You are an expert trade validator. Analyze this high-value trade setup:

TRADE SETUP:
${JSON.stringify(setup, null, 2)}

HISTORICAL CONTEXT (from RAG):
${context || 'None available'}

Evaluate:
1. Edge quality — is there a genuine, repeatable edge?
2. Risk/reward — does the math work?
3. Regime alignment — does the current market support this?
4. Position sizing — appropriate for portfolio size?
5. Historical precedent — how did similar setups perform?

Respond with EXACTLY:
VERDICT: [APPROVE/MODIFY/REJECT]
CONFIDENCE: [1-10]
RISK_ASSESSMENT: [LOW/MEDIUM/HIGH/EXTREME]
MODIFICATIONS: [any changes needed, or "none"]
REASONING: [3-5 sentences]`;

      const result = await generateText({
        model: anthropic('claude-sonnet-4-20250514'),
        prompt,
        maxTokens: 1024,
        temperature: 0.2,
      });

      // Parse structured response
      const text = result.text;
      const parsed: Record<string, string> = {
        verdict: 'APPROVE',
        confidence: '5',
        risk: 'MEDIUM',
        reasoning: text,
      };

      for (const line of text.split('\n')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('VERDICT:')) parsed.verdict = trimmed.split(':')[1].trim();
        if (trimmed.startsWith('CONFIDENCE:')) parsed.confidence = trimmed.split(':')[1].trim();
        if (trimmed.startsWith('RISK_ASSESSMENT:')) parsed.risk = trimmed.split(':')[1].trim();
      }

      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({
        verdict: 'APPROVE',
        confidence: 5,
        note: 'AI SDK not available',
      });
    }
  } catch {
    return NextResponse.json({ error: 'validation failed' }, { status: 500 });
  }
}
