import { Router } from 'express';
import fetch from 'node-fetch';

export const whatsappRouter = Router();

const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0';

function env(key) {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

async function sendWhatsAppMessage(to, body) {
  const accessToken = env('WHATSAPP_ACCESS_TOKEN');
  const phoneNumberId = env('WHATSAPP_PHONE_NUMBER_ID');

  const url = `${GRAPH_API_BASE}/${phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WhatsApp API error (${res.status}): ${text}`);
  }

  return res.json();
}

async function sendWhatsAppTemplate(to, templateName, parameters) {
  const accessToken = env('WHATSAPP_ACCESS_TOKEN');
  const phoneNumberId = env('WHATSAPP_PHONE_NUMBER_ID');

  const url = `${GRAPH_API_BASE}/${phoneNumberId}/messages`;

  const components = [];
  if (parameters && parameters.length > 0) {
    components.push({
      type: 'body',
      parameters: parameters.map(p => ({ type: 'text', text: String(p) })),
    });
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WhatsApp API error (${res.status}): ${text}`);
  }

  return res.json();
}

whatsappRouter.post('/whatsapp', async (req, res) => {
  try {
    const { action } = req.body;

    switch (action) {
      case 'send': {
        const { to, message } = req.body;
        if (!to || !message) {
          return res.status(400).json({ error: 'to and message are required' });
        }

        const result = await sendWhatsAppMessage(to, message);
        return res.json({ success: true, action: 'send', ...result });
      }

      case 'order_update': {
        const { to, customerName, orderId, status, estimatedDelivery } = req.body;
        if (!to || !customerName || !orderId || !status) {
          return res.status(400).json({ error: 'to, customerName, orderId, and status are required' });
        }

        let message = `Hi ${customerName}, your Studex Meat order #${orderId} is now: ${status}.`;
        if (estimatedDelivery) {
          message += ` Estimated delivery: ${estimatedDelivery}.`;
        }
        message += '\n\nReply to this message if you have any questions.';

        const result = await sendWhatsAppMessage(to, message);
        return res.json({
          success: true,
          action: 'order_update',
          orderId,
          status,
          ...result,
        });
      }

      default:
        return res.status(400).json({
          error: `Unknown action: "${action}"`,
          availableActions: ['send', 'order_update'],
        });
    }
  } catch (err) {
    console.error('whatsapp route error:', err);
    res.status(500).json({ error: err.message });
  }
});
