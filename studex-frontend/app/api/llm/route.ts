import { NextResponse } from 'next/server';

interface LLMConfig {
  provider: string;
  baseUrl: string;
  apiKey?: string;
  model: string;
}

const PROVIDERS: Record<string, (config: LLMConfig, prompt: string, systemPrompt: string, options: any) => Promise<any>> = {
  ollama: async (config, prompt, systemPrompt, options) => {
    const res = await fetch(`${config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        stream: false,
        options: { temperature: options.temperature || 0.7 },
      }),
    });
    const data = await res.json();
    return { text: data.message?.content || data.response || '', model: config.model, provider: 'ollama', tokensUsed: data.eval_count || 0 };
  },

  lmstudio: async (config, prompt, systemPrompt, options) => {
    const res = await fetch(`${config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
      }),
    });
    const data = await res.json();
    return { text: data.choices?.[0]?.message?.content || '', model: config.model, provider: 'lmstudio', tokensUsed: data.usage?.total_tokens || 0 };
  },

  claude: async (config, prompt, systemPrompt, options) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey || process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model || 'claude-sonnet-4-20250514',
        max_tokens: options.maxTokens || 2000,
        system: systemPrompt || undefined,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    return { text: data.content?.[0]?.text || '', model: config.model, provider: 'claude', tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0) };
  },

  openai: async (config, prompt, systemPrompt, options) => {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey || process.env.OPENAI_API_KEY || ''}`,
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4o',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
      }),
    });
    const data = await res.json();
    return { text: data.choices?.[0]?.message?.content || '', model: config.model, provider: 'openai', tokensUsed: data.usage?.total_tokens || 0 };
  },

  gemma: async (config, prompt, systemPrompt, options) => {
    const key = config.apiKey || process.env.GOOGLE_AI_API_KEY || '';
    const model = config.model || 'gemma-3-27b-it';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: (systemPrompt ? systemPrompt + '\n\n' : '') + prompt }] }],
        generationConfig: { temperature: options.temperature || 0.7, maxOutputTokens: options.maxTokens || 2000 },
      }),
    });
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { text, model, provider: 'gemma', tokensUsed: data.usageMetadata?.totalTokenCount || 0 };
  },

  stable_diffusion: async (config, prompt, _systemPrompt, options) => {
    const res = await fetch(`${config.baseUrl}/sdapi/v1/txt2img`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        negative_prompt: options.negativePrompt || '',
        steps: options.steps || 30,
        cfg_scale: options.cfgScale || 7,
        width: options.width || 1024,
        height: options.height || 1024,
        sampler_name: options.sampler || 'DPM++ 2M Karras',
      }),
    });
    const data = await res.json();
    return { images: data.images || [], model: 'stable-diffusion', provider: 'stable_diffusion', info: data.info || '' };
  },

  comfyui: async (config, prompt, _systemPrompt, options) => {
    const workflow = options.workflow || { prompt: { '3': { inputs: { text: prompt } } } };
    const res = await fetch(`${config.baseUrl}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow }),
    });
    const data = await res.json();
    return { promptId: data.prompt_id, provider: 'comfyui', model: 'comfyui-workflow' };
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { provider, baseUrl, apiKey, model, prompt, systemPrompt, temperature, maxTokens, ...extraOptions } = body;

    if (!provider || !prompt) {
      return NextResponse.json({ error: 'provider and prompt are required' }, { status: 400 });
    }

    const handler = PROVIDERS[provider];
    if (!handler) {
      return NextResponse.json({ error: `Unknown provider: ${provider}. Available: ${Object.keys(PROVIDERS).join(', ')}` }, { status: 400 });
    }

    const config: LLMConfig = { provider, baseUrl: baseUrl || '', apiKey, model: model || '' };
    const start = Date.now();
    const result = await handler(config, prompt, systemPrompt || '', { temperature, maxTokens, ...extraOptions });
    const latencyMs = Date.now() - start;

    return NextResponse.json({ ...result, latencyMs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    providers: Object.keys(PROVIDERS),
    usage: 'POST with { provider, prompt, model, baseUrl?, apiKey?, systemPrompt?, temperature?, maxTokens? }',
    examples: {
      ollama: { provider: 'ollama', baseUrl: 'http://localhost:11434', model: 'llama3', prompt: 'Hello' },
      lmstudio: { provider: 'lmstudio', baseUrl: 'http://192.168.1.100:1234', model: 'local-model', prompt: 'Hello' },
      claude: { provider: 'claude', model: 'claude-sonnet-4-20250514', prompt: 'Hello' },
      gemma: { provider: 'gemma', model: 'gemma-3-27b-it', prompt: 'Hello' },
      stable_diffusion: { provider: 'stable_diffusion', baseUrl: 'http://192.168.1.100:7860', prompt: 'a cat in space' },
    },
  });
}
