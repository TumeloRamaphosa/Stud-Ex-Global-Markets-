import express from 'express';
import { randomUUID } from 'crypto';

const app = express();
app.use(express.json());

// Brand voice — prepended to all generation prompts
let brandVoice = {
  voice: 'professional, warm, meat-enthusiast',
  examples: [],
};

function brandVoicePrefix() {
  let prefix = `Brand voice: ${brandVoice.voice}.`;
  if (brandVoice.examples.length) {
    prefix += ` Examples of our tone: ${brandVoice.examples.join(' | ')}`;
  }
  return prefix + '\n\n';
}

// LLM config — swappable at runtime
let llmConfig = {
  provider: process.env.DEFAULT_PROVIDER || 'ollama',
  model: process.env.OLLAMA_MODEL || 'hermes3:8b',
  ollamaUrl: process.env.OLLAMA_URL || 'http://35.196.24.245:11434',
};

const schedule = new Map();

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
  const prompt = brandVoicePrefix() + `Generate a ${platform || 'Instagram'} post for Studex Meat about: ${topic}. Tone: ${tone || 'engaging, meat-lover'}. ${hashtags ? `Include hashtags: ${hashtags}` : 'Include relevant hashtags.'}`;
  const content = await chatCompletion(prompt);
  res.json({ ok: true, content, platform });
});

// Email copy
app.post('/api/hermes/email', async (req, res) => {
  const { topic, audience, type } = req.body;
  const prompt = brandVoicePrefix() + `Write a ${type || 'promotional'} email for Studex Meat:\nTopic: ${topic}\nAudience: ${audience || 'existing customers'}\nInclude: subject line, preview text, body, CTA button text`;
  const content = await chatCompletion(prompt);
  res.json({ ok: true, content });
});

// Video scripts
app.post('/api/hermes/video', async (req, res) => {
  const { topic, duration, style } = req.body;
  const prompt = brandVoicePrefix() + `Write a ${duration || '60-second'} video script for Studex Meat about: ${topic}. Style: ${style || 'professional, appetizing'}. Include: scene descriptions, narration, text overlays, music cues. Format for Wan2 video generation.`;
  const content = await chatCompletion(prompt);
  res.json({ ok: true, content });
});

// Image prompts
app.post('/api/hermes/image', async (req, res) => {
  const { subject, style, purpose } = req.body;
  const prompt = brandVoicePrefix() + `Generate a detailed FLUX image generation prompt for Studex Meat:\nSubject: ${subject}\nStyle: ${style || 'professional food photography'}\nPurpose: ${purpose || 'social media'}\nOutput the prompt only, optimized for FLUX model.`;
  const content = await chatCompletion(prompt);
  res.json({ ok: true, prompt: content });
});

// Content calendar
app.post('/api/hermes/calendar', async (req, res) => {
  const { days, platforms, focus } = req.body;
  const prompt = brandVoicePrefix() + `Create a ${days || 7}-day content calendar for Studex Meat:\nPlatforms: ${(platforms || ['Instagram', 'Facebook', 'WhatsApp']).join(', ')}\nFocus: ${focus || 'product promotion, customer engagement'}\nFor each day include: platform, content type, topic, caption draft, best posting time (SAST)`;
  const content = await chatCompletion(prompt);
  res.json({ ok: true, calendar: content });
});

// A/B test variants
app.post('/api/hermes/ab-test', async (req, res) => {
  const { original, type, variants } = req.body;
  const prompt = brandVoicePrefix() + `Generate ${variants || 3} A/B test variants for this ${type || 'email subject line'}:\nOriginal: "${original}"\nContext: Studex Meat premium wagyu products\nFor each variant: the text, why it might perform better, expected impact`;
  const content = await chatCompletion(prompt);
  res.json({ ok: true, variants: content });
});

// Brand voice config
app.post('/api/hermes/brand-voice', (req, res) => {
  const { action } = req.body;
  if (action === 'set') {
    if (req.body.voice) brandVoice.voice = req.body.voice;
    if (req.body.examples) brandVoice.examples = req.body.examples;
    return res.json({ ok: true, brandVoice });
  }
  if (action === 'get') {
    return res.json({ ok: true, brandVoice });
  }
  res.status(400).json({ error: 'Unknown action. Use "set" or "get".' });
});

// Repurpose content across platforms
app.post('/api/hermes/repurpose', async (req, res) => {
  const { content, from, to } = req.body;
  if (!content || !to || !Array.isArray(to)) {
    return res.status(400).json({ error: 'Provide content, from, and to (array of platforms).' });
  }
  const prompt = brandVoicePrefix() + `You are a social media expert for Studex Meat. Repurpose the following ${from || 'general'} content for each target platform. Return JSON with a key per platform.\n\nOriginal content:\n"${content}"\n\nTarget platforms: ${to.join(', ')}\n\nFor each platform, adapt the tone, length, formatting, hashtags/emojis as appropriate. Return valid JSON: { "platform_name": "adapted content", ... }`;
  const raw = await chatCompletion(prompt);
  let adapted;
  try { adapted = JSON.parse(raw); } catch { adapted = raw; }
  res.json({ ok: true, original: content, from: from || 'general', adapted });
});

// Trend scan
app.post('/api/hermes/trend-scan', async (req, res) => {
  const { industry, region } = req.body;
  const prompt = brandVoicePrefix() + `You are a trend analyst for Studex Meat. Identify 5-8 currently trending topics relevant to the ${industry || 'premium meat'} industry in ${region || 'South Africa'}. For each trend provide: topic name, why it's trending, content angle for a premium meat brand, suggested post idea. Return as JSON array.`;
  const raw = await chatCompletion(prompt);
  let trends;
  try { trends = JSON.parse(raw); } catch { trends = raw; }
  res.json({ ok: true, industry: industry || 'premium meat', region: region || 'South Africa', trends });
});

// Competitor content analysis
app.post('/api/hermes/competitor-content', async (req, res) => {
  const { competitor, url } = req.body;
  if (!competitor) {
    return res.status(400).json({ error: 'Provide competitor name.' });
  }
  const prompt = brandVoicePrefix() + `You are a competitive intelligence analyst for Studex Meat. Analyze the likely content strategy of competitor "${competitor}"${url ? ` (${url})` : ''}.\n\nProvide:\n1. Likely content themes and messaging pillars\n2. Strengths and weaknesses of their approach\n3. Gaps and opportunities for Studex Meat\n4. 3 counter-content ideas that position Studex Meat favourably\n\nReturn as structured JSON with keys: themes, strengths, weaknesses, gaps, counterContent.`;
  const raw = await chatCompletion(prompt);
  let analysis;
  try { analysis = JSON.parse(raw); } catch { analysis = raw; }
  res.json({ ok: true, competitor, analysis });
});

// Batch content generation
app.post('/api/hermes/batch', async (req, res) => {
  const { requests } = req.body;
  if (!requests || !Array.isArray(requests) || requests.length === 0) {
    return res.status(400).json({ error: 'Provide requests array.' });
  }
  const results = await Promise.all(requests.map(async (r, i) => {
    try {
      let prompt;
      switch (r.type) {
        case 'social':
          prompt = brandVoicePrefix() + `Generate a ${r.platform || 'Instagram'} post for Studex Meat about: ${r.topic}. Tone: ${r.tone || 'engaging, meat-lover'}. Include relevant hashtags.`;
          break;
        case 'email':
          prompt = brandVoicePrefix() + `Write a ${r.emailType || 'promotional'} email for Studex Meat about: ${r.topic}. Include subject line, preview text, body, CTA.`;
          break;
        case 'video':
          prompt = brandVoicePrefix() + `Write a ${r.duration || '60-second'} video script for Studex Meat about: ${r.topic}. Style: ${r.style || 'professional, appetizing'}.`;
          break;
        case 'image':
          prompt = brandVoicePrefix() + `Generate a FLUX image prompt for Studex Meat. Subject: ${r.subject || r.topic}. Style: ${r.style || 'professional food photography'}.`;
          break;
        default:
          prompt = brandVoicePrefix() + `Generate content for Studex Meat about: ${r.topic || 'premium meat'}. Type: ${r.type || 'general'}.`;
      }
      const content = await chatCompletion(prompt);
      return { index: i, ok: true, type: r.type, content };
    } catch (err) {
      return { index: i, ok: false, type: r.type, error: err.message };
    }
  }));
  res.json({ ok: true, count: results.length, results });
});

// Schedule content — POST
app.post('/api/hermes/schedule', (req, res) => {
  const { content, platform, publishAt } = req.body;
  if (!content || !platform || !publishAt) {
    return res.status(400).json({ error: 'Provide content, platform, and publishAt.' });
  }
  const id = randomUUID();
  schedule.set(id, { id, content, platform, publishAt, createdAt: new Date().toISOString(), status: 'scheduled' });
  res.json({ ok: true, id, scheduled: schedule.get(id) });
});

// Schedule content — GET (list)
app.get('/api/hermes/schedule', (req, res) => {
  const items = [...schedule.values()].sort((a, b) => new Date(a.publishAt) - new Date(b.publishAt));
  res.json({ ok: true, count: items.length, schedule: items });
});

const PORT = process.env.HERMES_PORT || 3004;
app.listen(PORT, () => console.log(`Hermes Content Agent running on :${PORT}`));
