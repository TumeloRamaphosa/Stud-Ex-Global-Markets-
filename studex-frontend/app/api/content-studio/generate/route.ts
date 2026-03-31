import { NextRequest, NextResponse } from 'next/server';

// POST /api/content-studio/generate
// Proxies generation requests to AI providers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, mode, prompt, apiKey, apiSecret, ...settings } = body;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    let result;

    switch (provider) {
      case 'higgsfield':
        result = await callHiggsfield({ mode, prompt, apiKey, apiSecret, ...settings });
        break;
      case 'kling':
        result = await callKling({ mode, prompt, apiKey, apiSecret, ...settings });
        break;
      default:
        return NextResponse.json(
          { error: `Provider "${provider}" is not yet supported via API proxy. Use client-side SDK.` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}

// --- Higgsfield API Integration ---
async function callHiggsfield(params: {
  mode: string;
  prompt: string;
  apiKey: string;
  apiSecret?: string;
  resolution?: string;
  aspectRatio?: string;
  duration?: number;
  seed?: number;
  cameraFixed?: boolean;
  motionStrength?: number;
  model?: string;
  enhancePrompt?: boolean;
  quality?: string;
  styleId?: string;
  styleStrength?: number;
  sourceImageUrl?: string;
  referenceImageUrls?: string[];
}) {
  const baseUrl = 'https://cloud.higgsfield.ai/api/v1';

  // Build the request based on mode
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${params.apiKey}`,
  };

  if (params.apiSecret) {
    headers['X-API-Secret'] = params.apiSecret;
  }

  let endpoint: string;
  let payload: Record<string, any>;

  switch (params.mode) {
    case 'text-to-video':
      endpoint = `${baseUrl}/generate/video`;
      payload = {
        prompt: params.prompt,
        resolution: params.resolution || '1080p',
        aspect_ratio: params.aspectRatio,
        seed: params.seed,
        model: params.model || 'dop-turbo',
        enhance_prompt: params.enhancePrompt ?? true,
        motion_strength: params.motionStrength,
      };
      break;

    case 'image-to-video':
      endpoint = `${baseUrl}/generate/image-to-video`;
      payload = {
        prompt: params.prompt,
        image_url: params.sourceImageUrl,
        resolution: params.resolution || '1080p',
        camera_fixed: params.cameraFixed ?? false,
        seed: params.seed,
        model: params.model || 'dop-turbo',
        motion_strength: params.motionStrength,
        enhance_prompt: params.enhancePrompt ?? true,
      };
      break;

    case 'soul-mode':
    case 'text-to-image':
      endpoint = `${baseUrl}/generate/soul`;
      payload = {
        prompt: params.prompt,
        reference_image_urls: params.referenceImageUrls,
        style_id: params.styleId || 'Realistic',
        style_strength: params.styleStrength ?? 0.8,
        quality: params.quality || 'high',
        enhance_prompt: params.enhancePrompt ?? true,
        seed: params.seed,
      };
      break;

    default:
      throw new Error(`Unsupported Higgsfield mode: ${params.mode}`);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Higgsfield API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// --- Kling API Integration ---
async function callKling(params: {
  mode: string;
  prompt: string;
  apiKey: string;
  apiSecret?: string;
  resolution?: string;
  aspectRatio?: string;
  duration?: number;
  seed?: number;
  negativePrompt?: string;
  model?: string;
  sourceImageUrl?: string;
  referenceImageUrls?: string[];
}) {
  const baseUrl = 'https://api.klingai.com/v2';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${params.apiKey}`,
  };

  let endpoint: string;
  let payload: Record<string, any>;

  switch (params.mode) {
    case 'text-to-video':
      endpoint = `${baseUrl}/video/generations`;
      payload = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt,
        resolution: params.resolution || '1080p',
        aspect_ratio: params.aspectRatio || '16:9',
        duration: params.duration || 5,
        seed: params.seed,
        model: params.model || 'kling-3.0',
      };
      break;

    case 'image-to-video':
      endpoint = `${baseUrl}/video/image-to-video`;
      payload = {
        prompt: params.prompt,
        image_url: params.sourceImageUrl,
        element_images: params.referenceImageUrls,
        resolution: params.resolution || '1080p',
        duration: params.duration || 5,
        seed: params.seed,
      };
      break;

    case 'video-extend':
      endpoint = `${baseUrl}/video/extend`;
      payload = {
        prompt: params.prompt,
        video_url: params.sourceImageUrl,
        duration: params.duration || 5,
      };
      break;

    default:
      throw new Error(`Unsupported Kling mode: ${params.mode}`);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Kling API error (${response.status}): ${errorText}`);
  }

  return response.json();
}
