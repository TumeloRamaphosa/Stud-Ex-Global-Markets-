/**
 * AI Analysis API Route
 *
 * Uses Vercel AI SDK with Claude for:
 * - High-value trade validation
 * - Weekly strategy reviews
 * - Complex multi-factor analysis
 *
 * The desktop bot calls this when Ollama isn't sufficient
 * or for tasks that benefit from Claude's larger context window.
 *
 * Setup: Add ANTHROPIC_API_KEY to your Vercel environment variables.
 * Install: npm install ai @ai-sdk/anthropic
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'prompt required' }, { status: 400 });
    }

    // Check if AI SDK is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        analysis: null,
        note: 'ANTHROPIC_API_KEY not configured. Add it in Vercel dashboard → Settings → Environment Variables.',
      });
    }

    // Dynamic import to avoid build errors when not installed
    try {
      const { generateText } = await import('ai');
      const { anthropic } = await import('@ai-sdk/anthropic');

      const fullPrompt = context
        ? `CONTEXT:\n${context}\n\n---\n\n${prompt}`
        : prompt;

      const result = await generateText({
        model: anthropic('claude-sonnet-4-20250514'),
        prompt: fullPrompt,
        maxTokens: 2048,
        temperature: 0.3,
      });

      return NextResponse.json({ analysis: result.text });
    } catch {
      // AI SDK not installed — return helpful message
      return NextResponse.json({
        analysis: null,
        note: 'Install AI SDK: npm install ai @ai-sdk/anthropic',
      });
    }
  } catch (e) {
    return NextResponse.json({ error: 'analysis failed' }, { status: 500 });
  }
}
