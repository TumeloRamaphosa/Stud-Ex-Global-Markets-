/**
 * Vercel Cron Job — RALF Weekly Report
 *
 * Runs every Saturday at 06:00 UTC (08:00 SAST) via Vercel Cron.
 *
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/trading/cron",
 *     "schedule": "0 6 * * 6"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { tradingStore } from '@/lib/trading-db';

export async function GET(req: NextRequest) {
  // Verify this is a Vercel cron call (or allow in dev)
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const stats = tradingStore.getTradeStats();
    const ralfData = tradingStore.getAllRALF();

    // Generate weekly summary
    const summary = {
      generated_at: new Date().toISOString(),
      period: 'weekly',
      trade_stats: stats,
      ralf_summaries: ralfData.slice(-7), // Last 7 feedback entries
      overall_health: determineOverallHealth(ralfData),
    };

    // If Claude API is configured, generate AI weekly review
    if (process.env.ANTHROPIC_API_KEY && stats.total_trades > 0) {
      try {
        const { generateText } = await import('ai');
        const { anthropic } = await import('@ai-sdk/anthropic');

        const result = await generateText({
          model: anthropic('claude-sonnet-4-20250514'),
          prompt: `Generate a concise weekly trading bot performance review for a South African trader.

STATS: ${JSON.stringify(stats)}
RALF DATA: ${JSON.stringify(ralfData.slice(-3))}

Cover: 1) Overall health 2) Strategy-by-strategy 3) Key adjustments needed 4) Next week priorities.
Under 300 words. Direct and actionable.`,
          maxTokens: 1024,
        });

        return NextResponse.json({
          ...summary,
          ai_review: result.text,
        });
      } catch {
        // AI not available, return summary without review
      }
    }

    return NextResponse.json(summary);
  } catch (e) {
    return NextResponse.json({ error: 'cron failed' }, { status: 500 });
  }
}

function determineOverallHealth(ralfData: any[]): string {
  if (ralfData.length === 0) return 'NO_DATA';
  const recent = ralfData.slice(-3);
  const critical = recent.filter(r => r.health === 'CRITICAL').length;
  const warning = recent.filter(r => r.health === 'WARNING').length;
  if (critical > 0) return 'CRITICAL';
  if (warning > 1) return 'WARNING';
  return 'HEALTHY';
}
