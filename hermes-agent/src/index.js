const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// ─── LLM Configuration ──────────────────────────────────────────────
// Hermes Agent supports multiple backends:
// 1. Cloud APIs: Anthropic, OpenRouter, Google AI, Perplexity
// 2. Local: Ollama (any model), LM Studio
// Configurable at runtime via /config or env vars

let LLM_CONFIG = {
  provider: process.env.LLM_PROVIDER || 'ollama',
  // Cloud API keys
  anthropicKey: process.env.ANTHROPIC_API_KEY || '',
  openrouterKey: process.env.OPENROUTER_API_KEY || '',
  googleKey: process.env.GOOGLE_AI_API_KEY || '',
  perplexityKey: process.env.PERPLEXITY_API_KEY || '',
  // Local endpoints
  ollamaUrl: process.env.OLLAMA_URL || 'http://host.docker.internal:11434',
  lmStudioUrl: process.env.LM_STUDIO_URL || 'http://host.docker.internal:1234',
  // Default models per provider
  models: {
    ollama: process.env.OLLAMA_MODEL || 'hermes3:8b',
    anthropic: 'claude-sonnet-4-6',
    openrouter: 'nousresearch/hermes-3-llama-3.1-405b',
    google: 'gemini-2.5-flash',
    perplexity: 'sonar-pro',
    lmstudio: process.env.LM_STUDIO_MODEL || 'hermes-3-llama-3.1-8b',
  },
};

// Reporting channels
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL || '';
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL || '';
const CASHCLAW_URL = process.env.CASHCLAW_URL || 'http://localhost:3000/api/agent';

// ─── LLM Abstraction ────────────────────────────────────────────────
async function callLLM(system, prompt, provider = null, model = null) {
  const p = provider || LLM_CONFIG.provider;
  const m = model || LLM_CONFIG.models[p] || LLM_CONFIG.models.ollama;

  if (p === 'ollama') {
    const res = await fetch(`${LLM_CONFIG.ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: m,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
        stream: false,
      }),
    });
    const data = await res.json();
    return data.message?.content || '';
  }

  if (p === 'lmstudio') {
    const res = await fetch(`${LLM_CONFIG.lmStudioUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: m,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  if (p === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': LLM_CONFIG.anthropicKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: m, max_tokens: 4096,
        system, messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || '';
  }

  if (p === 'openrouter') {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LLM_CONFIG.openrouterKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: m,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  if (p === 'google') {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${LLM_CONFIG.googleKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${system}\n\n${prompt}` }] }],
        }),
      }
    );
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  throw new Error(`Unknown LLM provider: ${p}`);
}

async function postToSlack(msg) {
  if (!SLACK_WEBHOOK) return { skipped: true };
  await fetch(SLACK_WEBHOOK, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: msg }),
  });
  return { sent: true };
}

async function postToDiscord(msg) {
  if (!DISCORD_WEBHOOK) return { skipped: true };
  await fetch(DISCORD_WEBHOOK, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: msg }),
  });
  return { sent: true };
}

const HERMES_SYSTEM = `You are Hermes, the AI content creator for StudEx Meat (studexmeat.com). You create premium content for a luxury Wagyu and Ankole beef brand in South Africa. Brand voice: sophisticated, African heritage pride, premium quality. Brand colours: gold (#D4A017) on cream (#FFF8F0). You work alongside CashClaw (the store operations agent). You focus on content — social media, email campaigns, video scripts, image prompts. Always use South African English.`;

// ===== HEALTH =====
app.get('/', (req, res) => {
  res.json({
    agent: 'Hermes',
    role: 'Content Creation Agent',
    version: '1.0.0',
    llm: {
      provider: LLM_CONFIG.provider,
      model: LLM_CONFIG.models[LLM_CONFIG.provider],
      ollamaUrl: LLM_CONFIG.ollamaUrl,
      ollamaConnected: null, // checked on demand
    },
    partner: 'CashClaw (store ops)',
    channels: { slack: !!SLACK_WEBHOOK, discord: !!DISCORD_WEBHOOK },
    actions: [
      'POST /config           — update LLM provider/model/keys',
      'POST /generate          — generate content (social, email, video, image prompt)',
      'POST /social-post       — create social media post',
      'POST /email-campaign    — create email campaign copy',
      'POST /video-script      — create video script for Wan2/LTX',
      'POST /image-prompt      — create image generation prompt',
      'POST /content-calendar  — generate week of content',
      'POST /ab-test           — generate A/B test variants',
      'POST /ask               — ask Hermes anything about content',
      'POST /report            — post update to Slack/Discord',
      'POST /coordinate        — send task to CashClaw partner agent',
    ],
  });
});

// ===== CONFIG — Hot-swap LLM provider =====
app.get('/config', (req, res) => {
  res.json({
    provider: LLM_CONFIG.provider,
    model: LLM_CONFIG.models[LLM_CONFIG.provider],
    allModels: LLM_CONFIG.models,
    ollamaUrl: LLM_CONFIG.ollamaUrl,
    lmStudioUrl: LLM_CONFIG.lmStudioUrl,
    apiKeysConfigured: {
      anthropic: !!LLM_CONFIG.anthropicKey,
      openrouter: !!LLM_CONFIG.openrouterKey,
      google: !!LLM_CONFIG.googleKey,
      perplexity: !!LLM_CONFIG.perplexityKey,
    },
  });
});

app.post('/config', (req, res) => {
  const { provider, model, ollamaUrl, lmStudioUrl, anthropicKey, openrouterKey, googleKey, perplexityKey } = req.body;
  if (provider) LLM_CONFIG.provider = provider;
  if (model) LLM_CONFIG.models[LLM_CONFIG.provider] = model;
  if (ollamaUrl) LLM_CONFIG.ollamaUrl = ollamaUrl;
  if (lmStudioUrl) LLM_CONFIG.lmStudioUrl = lmStudioUrl;
  if (anthropicKey) LLM_CONFIG.anthropicKey = anthropicKey;
  if (openrouterKey) LLM_CONFIG.openrouterKey = openrouterKey;
  if (googleKey) LLM_CONFIG.googleKey = googleKey;
  if (perplexityKey) LLM_CONFIG.perplexityKey = perplexityKey;
  res.json({ success: true, provider: LLM_CONFIG.provider, model: LLM_CONFIG.models[LLM_CONFIG.provider] });
});

// ===== SOCIAL POST =====
app.post('/social-post', async (req, res) => {
  try {
    const { platform, product, theme, tone } = req.body;
    const content = await callLLM(
      HERMES_SYSTEM,
      `Create a ${platform || 'instagram'} post about ${product || 'Wagyu Biltong'}. Theme: ${theme || 'premium quality'}. Tone: ${tone || 'sophisticated'}.\n\nGenerate:\n1. Caption with emojis and 20-25 hashtags\n2. Image description for photographer/AI generation\n3. Best time to post (SAST)\n4. Engagement hook (first line)\n5. Call to action`,
      req.body.provider, req.body.model
    );
    res.json({ platform: platform || 'instagram', product: product || 'Wagyu Biltong', content, generatedAt: new Date().toISOString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== EMAIL CAMPAIGN =====
app.post('/email-campaign', async (req, res) => {
  try {
    const { campaign, product, audience, goal } = req.body;
    const content = await callLLM(
      HERMES_SYSTEM,
      `Create an email campaign for ${campaign || 'biltong promotion'}.\nProduct: ${product || 'Wagyu Biltong R500/kg'}\nAudience: ${audience || 'existing customers in Johannesburg'}\nGoal: ${goal || 'drive repeat purchases'}\n\nGenerate:\n1. Subject line (+ 2 A/B variants)\n2. Preview text\n3. Email body (HTML-ready with sections)\n4. CTA button text\n5. Send time recommendation\n6. Follow-up email subject (for non-openers)`,
      req.body.provider, req.body.model
    );
    res.json({ campaign, content, generatedAt: new Date().toISOString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== VIDEO SCRIPT =====
app.post('/video-script', async (req, res) => {
  try {
    const { product, duration, style, model: videoModel } = req.body;
    const content = await callLLM(
      HERMES_SYSTEM,
      `Create a video script for a ${duration || '30-second'} ${style || 'luxury product'} video about ${product || 'Wagyu Ribeye'}.\nTarget video model: ${videoModel || 'Wan2.1 / LTX Video'}\n\nGenerate:\n1. Scene-by-scene breakdown (with timing)\n2. Voiceover script\n3. Music/mood direction\n4. Text overlays\n5. Wan2.1 video prompt (technical prompt for AI video generation)\n6. LTX Video prompt (alternative format)\n7. Thumbnail image prompt`,
      req.body.provider, req.body.model
    );
    res.json({ product, duration, style, content, generatedAt: new Date().toISOString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== IMAGE PROMPT =====
app.post('/image-prompt', async (req, res) => {
  try {
    const { product, style, aspect, targetModel } = req.body;
    const content = await callLLM(
      HERMES_SYSTEM,
      `Create image generation prompts for ${product || 'premium Wagyu steak'}.\nStyle: ${style || 'luxury food photography, Japanese minimal'}\nAspect: ${aspect || '1:1 (Instagram square)'}\nTarget model: ${targetModel || 'FLUX / Stable Diffusion'}\n\nGenerate:\n1. FLUX prompt (detailed, technical)\n2. Stable Diffusion prompt (with negative prompt)\n3. ComfyUI workflow description\n4. Midjourney-style prompt\n5. Photography direction (for real shoots)`,
      req.body.provider, req.body.model
    );
    res.json({ product, style, content, generatedAt: new Date().toISOString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== CONTENT CALENDAR =====
app.post('/content-calendar', async (req, res) => {
  try {
    const { days, platforms, focus } = req.body;
    const content = await callLLM(
      HERMES_SYSTEM,
      `Create a ${days || 7}-day content calendar for StudEx Meat.\nPlatforms: ${(platforms || ['instagram', 'facebook']).join(', ')}\nFocus: ${focus || 'biltong + wagyu boxes'}\n\nFor each day generate:\n1. Platform\n2. Content type (reel, post, story, carousel)\n3. Theme/topic\n4. Caption preview (first line)\n5. Image prompt\n6. Best posting time (SAST)\n7. Hashtag set\n\nFormat as a structured calendar.`,
      req.body.provider, req.body.model
    );
    res.json({ days: days || 7, content, generatedAt: new Date().toISOString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== A/B TEST =====
app.post('/ab-test', async (req, res) => {
  try {
    const { original, type } = req.body;
    const content = await callLLM(
      HERMES_SYSTEM,
      `Generate 3 A/B test variants for this ${type || 'caption'}:\n\nOriginal: ${original || 'Premium Wagyu Biltong — handcrafted, air-dried perfection.'}\n\nFor each variant:\n1. The variant text\n2. What was changed (hook, tone, CTA, length)\n3. Expected impact\n4. Best audience for this variant`,
      req.body.provider, req.body.model
    );
    res.json({ original, variants: content, generatedAt: new Date().toISOString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== GENERAL CONTENT =====
app.post('/generate', async (req, res) => {
  try {
    const { type, prompt: userPrompt, context } = req.body;
    const content = await callLLM(
      HERMES_SYSTEM,
      `Content type: ${type || 'general'}\n\n${userPrompt || 'Create content for StudEx Meat'}\n\nContext: ${JSON.stringify(context || {})}`,
      req.body.provider, req.body.model
    );
    res.json({ type, content, generatedAt: new Date().toISOString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== ASK HERMES =====
app.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'question required' });
    const answer = await callLLM(HERMES_SYSTEM, question, req.body.provider, req.body.model);
    res.json({ question, answer, generatedAt: new Date().toISOString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== REPORT TO CHANNELS =====
app.post('/report', async (req, res) => {
  try {
    const { message, channels } = req.body;
    const results = {};
    if (!channels || channels.includes('slack')) results.slack = await postToSlack(`🎨 *Hermes Content Agent:* ${message}`);
    if (!channels || channels.includes('discord')) results.discord = await postToDiscord(`**🎨 Hermes Content Agent:** ${message}`);
    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== COORDINATE WITH CASHCLAW =====
app.post('/coordinate', async (req, res) => {
  try {
    const { task, data } = req.body;
    const result = await fetch(CASHCLAW_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: task, ...data }),
    });
    const json = await result.json();
    res.json({ sentTo: 'CashClaw', task, response: json });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Hermes Content Agent on port ${PORT}`);
  console.log(`LLM: ${LLM_CONFIG.provider} / ${LLM_CONFIG.models[LLM_CONFIG.provider]}`);
  console.log(`Ollama: ${LLM_CONFIG.ollamaUrl}`);
  console.log(`Slack: ${SLACK_WEBHOOK ? 'configured' : 'NOT SET'}`);
  console.log(`Discord: ${DISCORD_WEBHOOK ? 'configured' : 'NOT SET'}`);
  console.log(`CashClaw partner: ${CASHCLAW_URL}`);
});
