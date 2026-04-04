/**
 * AI Trading Assistant Chat API
 *
 * Provides an interactive chat at the bottom of the dashboard.
 * Users can ask questions about their portfolio, strategies, market conditions,
 * or give commands like "pause crypto_momentum" or "what's my win rate?"
 *
 * Uses Vercel AI SDK with Claude for responses.
 * Falls back to a helpful static response when API key isn't configured.
 */

import { NextRequest, NextResponse } from 'next/server';
import { tradingStore } from '@/lib/trading-db';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'message required' }, { status: 400 });
    }

    // Build context from current trading data
    const portfolio = tradingStore.getLatestPortfolio();
    const stats = tradingStore.getTradeStats();
    const signals = tradingStore.getRecentSignals(5);
    const ralfData = tradingStore.getAllRALF();

    const context = `CURRENT PORTFOLIO: ${JSON.stringify(portfolio || { note: 'No data yet — bot not connected' })}
TRADE STATS: ${JSON.stringify(stats)}
RECENT SIGNALS: ${JSON.stringify(signals.slice(0, 3))}
RALF STATUS: ${JSON.stringify(ralfData.slice(-2))}`;

    // Try Claude via Vercel AI SDK
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const { generateText } = await import('ai');
        const { anthropic } = await import('@ai-sdk/anthropic');

        const result = await generateText({
          model: anthropic('claude-sonnet-4-20250514'),
          system: `You are the Studex Trading Bot AI assistant. You help a South African trader understand their automated trading system.

You have access to:
- Portfolio data (equity, cash, positions, P&L)
- Trade statistics (win rate, profit factor, trade count)
- RALF feedback (self-learning loop status)
- Recent signals from strategies

Be concise, direct, and actionable. Use ZAR currency. Reference specific numbers from the context.
If the user asks to take an action (pause strategy, close position), explain that they need to use the dashboard controls or the bot's API — you can advise but not execute.`,
          prompt: `${context}\n\nUser: ${message}`,
          maxTokens: 512,
          temperature: 0.3,
        });

        return NextResponse.json({ response: result.text });
      } catch {
        // AI SDK not available, fall through to rule-based response
      }
    }

    // Rule-based fallback when no API key
    const response = generateFallbackResponse(message, portfolio, stats);
    return NextResponse.json({ response });

  } catch {
    return NextResponse.json({ error: 'chat failed' }, { status: 500 });
  }
}

function generateFallbackResponse(message: string, portfolio: any, stats: any): string {
  const msg = message.toLowerCase();

  if (msg.includes('portfolio') || msg.includes('equity') || msg.includes('balance')) {
    if (!portfolio) return 'No portfolio data yet. Make sure the trading bot is running on your desktop and connected to Vercel.';
    return `Portfolio: R${(portfolio.total_equity || 0).toLocaleString()} total equity, R${(portfolio.cash || 0).toLocaleString()} cash, ${portfolio.position_count || 0} open positions. Daily P&L: R${(portfolio.daily_pnl || 0).toLocaleString()}.`;
  }

  if (msg.includes('win rate') || msg.includes('performance') || msg.includes('stats')) {
    if (!stats || !stats.total_trades) return 'No trades recorded yet. The bot needs to complete some trades before stats are available.';
    return `${stats.total_trades} trades total. Win rate: ${stats.win_rate?.toFixed(1)}%. Total P&L: R${(stats.total_pnl || 0).toLocaleString()}. Avg win: R${(stats.avg_win || 0).toLocaleString()}, Avg loss: R${(stats.avg_loss || 0).toLocaleString()}.`;
  }

  if (msg.includes('ralf') || msg.includes('learning') || msg.includes('feedback')) {
    return 'The RALF loop runs daily at 5PM SAST. It analyzes win rates, stop-out rates, and regime performance, then recommends parameter adjustments. Check the Analytics page for the latest RALF feedback.';
  }

  if (msg.includes('strategy') || msg.includes('strategies')) {
    return '4 strategies active: Crypto Momentum (multi-TF trend), JSE Value+VCP (SA stocks), Pair Trading (stat arb), Sentiment Swarm (50 AI agents). Plus CloddsBot\'s 119 skills when connected. Check the Strategies page for details.';
  }

  if (msg.includes('help') || msg.includes('what can')) {
    return 'I can help with: portfolio status, trade stats, strategy info, RALF learning status, market regime, risk limits, and general trading questions. Try: "What\'s my win rate?" or "How is crypto_momentum performing?"';
  }

  return 'I\'m your trading assistant. Ask me about your portfolio, strategies, win rate, RALF feedback, or any trading question. For full AI responses, add your ANTHROPIC_API_KEY in Vercel environment variables.';
}
