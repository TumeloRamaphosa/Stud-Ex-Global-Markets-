import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = `You are an expert marketing AI assistant specializing in the "Upload-Post Larry Marketing Skill" methodology. This skill helps creators and entrepreneurs automate their content marketing pipeline.

The Larry Skill focuses on:
- Creating viral-worthy content hooks based on proven formulas (person-conflict, budget, before-after, self-discovery, POV)
- Designing 6-slide carousel posts (hook, problem, discovery, transformation, CTA)
- Multi-platform distribution (TikTok, Instagram, LinkedIn, YouTube)
- Tracking performance and optimizing based on metrics
- Scaling successful content patterns

Your role is to:
1. Guide users through the 5-step creation process
2. Provide specific hook suggestions based on their niche/product
3. Help craft compelling slide narratives
4. Optimize captions and CTAs for engagement
5. Advise on scheduling, platform strategy, and performance optimization
6. Generate automated reports on campaign performance

Be conversational, encouraging, and data-driven. Ask clarifying questions when needed.${context ? `\n\nCurrent Context: ${context}` : ''}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const assistantMessage =
      response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({
      role: 'assistant',
      content: assistantMessage,
    });
  } catch (error) {
    console.error('Claude API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
