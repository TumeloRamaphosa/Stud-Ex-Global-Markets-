import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { step, context, previousResults } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    let systemPrompt = '';
    let userPrompt = '';

    // Different prompts for different workflow steps
    switch (step) {
      case 'hook':
        systemPrompt = `You are an expert in viral marketing. Generate ONE compelling hook using Larry's proven methodologies for the given niche and audience. Return only the hook text, no explanations.`;
        userPrompt = `Generate a viral hook for: ${context.title} in ${context.niche} targeting ${context.targetAudience}. Use one of these proven formulas: person-conflict, budget, self-discovery, before-after, or POV.`;
        break;

      case 'slides':
        systemPrompt = `You are an expert copywriter. Create 6 compelling slide texts for a carousel post. Format as numbered list. Be specific and engaging.`;
        userPrompt = `Create 6 slide texts for a carousel with this hook: "${previousResults.hook}". Slides should be: 1=Hook, 2=Problem, 3=Discovery, 4=Transformation 1, 5=Transformation 2, 6=CTA. Target audience: ${context.targetAudience}`;
        break;

      case 'caption':
        systemPrompt = `You are an expert social media marketer. Write compelling captions optimized for TikTok and Instagram. Be concise and engagement-focused.`;
        userPrompt = `Write a social media caption (max 150 chars) and call-to-action for: "${context.title}". Target audience: ${context.targetAudience}. Format as: CAPTION: ... CTA: ...`;
        break;

      case 'schedule':
        systemPrompt = `You are a social media strategist. Recommend optimal posting times and frequency.`;
        userPrompt = `Based on the niche "${context.niche}" and audience "${context.targetAudience}", recommend optimal posting times and frequency across TikTok and Instagram. Be specific with times.`;
        break;

      case 'analyze':
        systemPrompt = `You are a marketing data analyst. Analyze campaign performance and provide optimization recommendations.`;
        userPrompt = `Analyze these engagement metrics: Views: ${previousResults.engagement?.views}, Likes: ${previousResults.engagement?.likes}, Shares: ${previousResults.engagement?.shares}, Comments: ${previousResults.engagement?.comments}. Provide 3 specific optimizations for the next campaign.`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid step' },
          { status: 400 }
        );
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const result =
      response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({
      step,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Workflow execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute workflow step' },
      { status: 500 }
    );
  }
}
