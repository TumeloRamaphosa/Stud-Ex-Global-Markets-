import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, slideTexts, provider, model, count = 6 } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const images: { url: string; index: number }[] = [];

    // Slide-specific prompts based on Larry's methodology
    const slideContexts = [
      'attention-grabbing hook scene',
      'person experiencing a problem or frustration',
      'moment of discovering a solution',
      'dramatic positive transformation result',
      'reinforcing the transformation with detail',
      'clear call-to-action closing scene',
    ];

    if (provider === 'openai' || !provider) {
      // OpenAI image generation (gpt-image-1.5 recommended)
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: 'OPENAI_API_KEY not configured on server. Add it to your environment variables.' },
          { status: 500 }
        );
      }

      for (let i = 0; i < count; i++) {
        const slidePrompt = `${prompt}. Scene ${i + 1}: ${slideContexts[i]}. ${
          slideTexts?.[i] ? `Context: "${slideTexts[i]}"` : ''
        } Style: iPhone photo, realistic lighting, portrait orientation 9:16.`;

        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model || 'gpt-image-1',
            prompt: slidePrompt,
            n: 1,
            size: '1024x1792',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`OpenAI image gen failed for slide ${i + 1}:`, errorData);
          continue;
        }

        const data = await response.json();
        if (data.data?.[0]?.url) {
          images.push({ url: data.data[0].url, index: i });
        } else if (data.data?.[0]?.b64_json) {
          // Convert base64 to data URL
          images.push({
            url: `data:image/png;base64,${data.data[0].b64_json}`,
            index: i,
          });
        }
      }
    } else if (provider === 'stability') {
      // Stability AI
      const apiKey = process.env.STABILITY_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: 'STABILITY_API_KEY not configured on server.' },
          { status: 500 }
        );
      }

      for (let i = 0; i < count; i++) {
        const slidePrompt = `${prompt}. ${slideContexts[i]}. Photorealistic, portrait orientation.`;

        const response = await fetch(
          'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text_prompts: [{ text: slidePrompt, weight: 1 }],
              height: 1536,
              width: 1024,
              samples: 1,
            }),
          }
        );

        if (!response.ok) continue;

        const data = await response.json();
        if (data.artifacts?.[0]?.base64) {
          images.push({
            url: `data:image/png;base64,${data.artifacts[0].base64}`,
            index: i,
          });
        }
      }
    }

    return NextResponse.json({ images, count: images.length });
  } catch (error) {
    console.error('Generate slides error:', error);
    return NextResponse.json(
      { error: 'Failed to generate slides' },
      { status: 500 }
    );
  }
}
