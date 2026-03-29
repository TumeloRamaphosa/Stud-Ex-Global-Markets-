import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, mkdir } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

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

    // ==================== NANO-BANANA (DEFAULT — LOCAL CLI) ====================
    if (provider === 'nano-banana' || provider === 'gemini' || !provider) {
      // Try nano-banana CLI first (uses Gemini under the hood, cheaper)
      const outputDir = path.join(process.cwd(), 'public', 'generated-slides');
      await mkdir(outputDir, { recursive: true });

      for (let i = 0; i < count; i++) {
        const slidePrompt = `${prompt}. Scene ${i + 1}: ${slideContexts[i]}. ${
          slideTexts?.[i] ? `Context: "${slideTexts[i]}"` : ''
        } iPhone photo, realistic lighting, portrait 9:16, high quality, no text in image.`;

        const outputName = `slide-${Date.now()}-${i}`;
        const outputPath = path.join(outputDir, outputName);

        try {
          // Try nano-banana CLI first
          await execAsync(
            `nano-banana "${slidePrompt.replace(/"/g, '\\"')}" -o "${outputName}" -d "${outputDir}" -a 9:16 -s 1K`,
            { timeout: 60000 }
          );

          // Find the generated file
          const possibleExts = ['.png', '.jpg', '.webp'];
          for (const ext of possibleExts) {
            try {
              const filePath = `${outputPath}${ext}`;
              const fileData = await readFile(filePath);
              const base64 = fileData.toString('base64');
              const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' ? 'image/jpeg' : 'image/webp';
              images.push({
                url: `data:${mimeType};base64,${base64}`,
                index: i,
              });
              break;
            } catch {
              // Try next extension
            }
          }

          // Also check if file was saved with default naming
          if (!images.find(img => img.index === i)) {
            // Serve from public directory
            images.push({
              url: `/generated-slides/${outputName}.png`,
              index: i,
            });
          }
        } catch (cliError) {
          console.log(`nano-banana CLI not available for slide ${i + 1}, falling back to Gemini API`);

          // Fallback to direct Gemini API call
          const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
          if (!apiKey) {
            console.error('No Gemini API key configured');
            continue;
          }

          try {
            const geminiModel = model || 'gemini-2.0-flash-exp';
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: `Generate a photorealistic image: ${slidePrompt}` }] }],
                  generationConfig: {
                    responseModalities: ['IMAGE', 'TEXT'],
                  },
                }),
              }
            );

            if (response.ok) {
              const data = await response.json();
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
            } else {
              // Try Imagen 3 as last resort
              const imagenResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    instances: [{ prompt: slidePrompt }],
                    parameters: { sampleCount: 1, aspectRatio: '9:16' },
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
              }
            }
          } catch (apiErr) {
            console.error(`Gemini API failed for slide ${i + 1}:`, apiErr);
          }
        }
      }
    }

    // ==================== OPENAI (ALTERNATIVE) ====================
    else if (provider === 'openai') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: 'OPENAI_API_KEY not configured.' }, { status: 500 });
      }

      for (let i = 0; i < count; i++) {
        const slidePrompt = `${prompt}. Scene ${i + 1}: ${slideContexts[i]}. iPhone photo, realistic lighting, portrait 9:16.`;
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: model || 'gpt-image-1', prompt: slidePrompt, n: 1, size: '1024x1792' }),
        });

        if (!response.ok) continue;
        const data = await response.json();
        if (data.data?.[0]?.url) images.push({ url: data.data[0].url, index: i });
        else if (data.data?.[0]?.b64_json) images.push({ url: `data:image/png;base64,${data.data[0].b64_json}`, index: i });
      }
    }

    // ==================== STABILITY AI (ALTERNATIVE) ====================
    else if (provider === 'stability') {
      const apiKey = process.env.STABILITY_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: 'STABILITY_API_KEY not configured.' }, { status: 500 });
      }

      for (let i = 0; i < count; i++) {
        const slidePrompt = `${prompt}. ${slideContexts[i]}. Photorealistic, portrait orientation.`;
        const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ text_prompts: [{ text: slidePrompt, weight: 1 }], height: 1536, width: 1024, samples: 1 }),
        });

        if (!response.ok) continue;
        const data = await response.json();
        if (data.artifacts?.[0]?.base64) images.push({ url: `data:image/png;base64,${data.artifacts[0].base64}`, index: i });
      }
    }

    return NextResponse.json({ images, count: images.length });
  } catch (error) {
    console.error('Generate slides error:', error);
    return NextResponse.json({ error: 'Failed to generate slides' }, { status: 500 });
  }
}
