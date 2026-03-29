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

    // ==================== GEMINI (DEFAULT — FREE TIER) ====================
    if (provider === 'gemini' || !provider) {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: 'GOOGLE_GEMINI_API_KEY not configured. Get one free at https://aistudio.google.com/apikey' },
          { status: 500 }
        );
      }

      for (let i = 0; i < count; i++) {
        const slidePrompt = `Generate a photorealistic image: ${prompt}. Scene ${i + 1} of 6: ${slideContexts[i]}. ${
          slideTexts?.[i] ? `The text overlay will say: "${slideTexts[i]}"` : ''
        } Style: iPhone photo, warm realistic lighting, portrait orientation 9:16, high quality, no text in the image.`;

        try {
          // Gemini 2.0 Flash with image generation
          const geminiModel = model || 'gemini-2.0-flash-exp';
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: slidePrompt }] }],
                generationConfig: {
                  responseModalities: ['IMAGE', 'TEXT'],
                  imageDimensions: { width: 1024, height: 1536 },
                },
              }),
            }
          );

          if (!response.ok) {
            // Fallback: try Imagen 3 via Gemini API
            const imagenResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  instances: [{ prompt: slidePrompt }],
                  parameters: {
                    sampleCount: 1,
                    aspectRatio: '9:16',
                    personGeneration: 'allow_adult',
                  },
                }),
              }
            );

            if (imagenResponse.ok) {
              const imagenData = await imagenResponse.json();
              if (imagenData.predictions?.[0]?.bytesBase64Encoded) {
                images.push({
                  url: `data:image/png;base64,${imagenData.predictions[0].bytesBase64Encoded}`,
                  index: i,
                });
              }
            } else {
              console.error(`Gemini image gen failed for slide ${i + 1}`);
            }
            continue;
          }

          const data = await response.json();
          // Extract inline image from Gemini response
          const parts = data.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
            if (part.inlineData?.mimeType?.startsWith('image/')) {
              images.push({
                url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                index: i,
              });
              break;
            }
          }
        } catch (err) {
          console.error(`Gemini slide ${i + 1} error:`, err);
          continue;
        }
      }
    }

    // ==================== OPENAI (FALLBACK) ====================
    else if (provider === 'openai') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: 'OPENAI_API_KEY not configured on server.' },
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

        if (!response.ok) continue;

        const data = await response.json();
        if (data.data?.[0]?.url) {
          images.push({ url: data.data[0].url, index: i });
        } else if (data.data?.[0]?.b64_json) {
          images.push({
            url: `data:image/png;base64,${data.data[0].b64_json}`,
            index: i,
          });
        }
      }
    }

    // ==================== STABILITY AI (FALLBACK) ====================
    else if (provider === 'stability') {
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
