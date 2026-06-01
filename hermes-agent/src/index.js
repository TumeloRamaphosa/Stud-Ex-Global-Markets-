import express from 'express';

const app = express();
app.use(express.json());

// LLM config — swappable at runtime
let llmConfig = {
  provider: process.env.DEFAULT_PROVIDER || 'ollama',
  model: process.env.OLLAMA_MODEL || 'hermes3:8b',
  ollamaUrl: process.env.OLLAMA_URL || 'http://35.196.24.245:11434',
};

async function chatCompletion(prompt) {
  const { provider, model, ollamaUrl } = llmConfig;

  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || '';
  }

  // Ollama (default — Manus VM or local)
  const res = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'hermes3:8b',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    }),
  });
  const data = await res.json();
  return data.message?.content || '';
}

// Status
app.get('/api/hermes', (req, res) => {
  res.json({ service: 'Hermes Content Agent', status: 'running', config: llmConfig });
});

// Config
app.post('/api/hermes', (req, res) => {
  const { action } = req.body;
  if (action === 'config_set') {
    if (req.body.provider) llmConfig.provider = req.body.provider;
    if (req.body.model) llmConfig.model = req.body.model;
    if (req.body.ollamaUrl) llmConfig.ollamaUrl = req.body.ollamaUrl;
    return res.json({ ok: true, config: llmConfig });
  }
  res.status(400).json({ error: 'Unknown action' });
});

// Social posts
app.post('/api/hermes/social', async (req, res) => {
  const { platform, topic, tone, hashtags } = req.body;
  const prompt = `Generate a ${platform || 'Instagram'} post for Studex Meat about: ${topic}. Tone: ${tone || 'engaging, meat-lover'}. ${hashtags ? `Include hashtags: ${hashtags}` : 'Include relevant hashtags.'}`;
  const content = await chatCompletion(prompt);
  res.json({ ok: true, content, platform });
});

// Email copy
app.post('/api/hermes/email', async (req, res) => {
  const { topic, audience, type } = req.body;
  const prompt = `Write a ${type || 'promotional'} email for Studex Meat:\nTopic: ${topic}\nAudience: ${audience || 'existing customers'}\nInclude: subject line, preview text, body, CTA button text`;
  const content = await chatCompletion(prompt);
  res.json({ ok: true, content });
});

// Video scripts
app.post('/api/hermes/video', async (req, res) => {
  const { topic, duration, style } = req.body;
  const prompt = `Write a ${duration || '60-second'} video script for Studex Meat about: ${topic}. Style: ${style || 'professional, appetizing'}. Include: scene descriptions, narration, text overlays, music cues. Format for Wan2 video generation.`;
  const content = await chatCompletion(prompt);
  res.json({ ok: true, content });
});

// Image prompts
app.post('/api/hermes/image', async (req, res) => {
  const { subject, style, purpose } = req.body;
  const prompt = `Generate a detailed FLUX image generation prompt for Studex Meat:\nSubject: ${subject}\nStyle: ${style || 'professional food photography'}\nPurpose: ${purpose || 'social media'}\nOutput the prompt only, optimized for FLUX model.`;
  const content = await chatCompletion(prompt);
  res.json({ ok: true, prompt: content });
});

// Content calendar
app.post('/api/hermes/calendar', async (req, res) => {
  const { days, platforms, focus } = req.body;
  const prompt = `Create a ${days || 7}-day content calendar for Studex Meat:\nPlatforms: ${(platforms || ['Instagram', 'Facebook', 'WhatsApp']).join(', ')}\nFocus: ${focus || 'product promotion, customer engagement'}\nFor each day include: platform, content type, topic, caption draft, best posting time (SAST)`;
  const content = await chatCompletion(prompt);
  res.json({ ok: true, calendar: content });
});

// A/B test variants
app.post('/api/hermes/ab-test', async (req, res) => {
  const { original, type, variants } = req.body;
  const prompt = `Generate ${variants || 3} A/B test variants for this ${type || 'email subject line'}:\nOriginal: "${original}"\nContext: Studex Meat premium wagyu products\nFor each variant: the text, why it might perform better, expected impact`;
  const content = await chatCompletion(prompt);
  res.json({ ok: true, variants: content });
});

const PORT = process.env.HERMES_PORT || 3004;
app.listen(PORT, () => console.log(`Hermes Content Agent running on :${PORT}`));
