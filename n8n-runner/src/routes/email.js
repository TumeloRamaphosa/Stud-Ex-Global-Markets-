import { Router } from 'express';
import { sendEmail, sendInvoiceEmail } from '../lib/gmail.js';
import { getInvoicePdf } from '../lib/quickbooks.js';

export const emailRouter = Router();

emailRouter.post('/email', async (req, res) => {
  try {
    const { action } = req.body;

    switch (action) {
      case 'send': {
        const { to, subject, html } = req.body;
        if (!to || !subject || !html) {
          return res.status(400).json({ error: 'to, subject, and html are required' });
        }

        const result = await sendEmail(to, subject, html);
        return res.json({ success: true, action: 'send', ...result });
      }

      case 'send_invoice': {
        const { to, customerName, invoiceId } = req.body;
        if (!to || !customerName || !invoiceId) {
          return res.status(400).json({ error: 'to, customerName, and invoiceId are required' });
        }

        const pdfBuffer = await getInvoicePdf(invoiceId);
        const result = await sendInvoiceEmail(to, customerName, invoiceId, pdfBuffer);
        return res.json({
          success: true,
          action: 'send_invoice',
          invoiceId,
          pdfSizeBytes: pdfBuffer.length,
          ...result,
        });
      }

      case 'broadcast': {
        const { recipients, subject, html } = req.body;
        if (!Array.isArray(recipients) || recipients.length === 0 || !subject || !html) {
          return res.status(400).json({ error: 'recipients[], subject, and html are required' });
        }

        const results = [];
        for (const to of recipients) {
          try {
            const result = await sendEmail(to, subject, html);
            results.push({ to, status: 'sent', ...result });
          } catch (err) {
            results.push({ to, status: 'failed', error: err.message });
          }
        }

        const sent = results.filter(r => r.status === 'sent').length;
        const failed = results.filter(r => r.status === 'failed').length;

        return res.json({
          success: true,
          action: 'broadcast',
          total: recipients.length,
          sent,
          failed,
          results,
        });
      }

      default:
        return res.status(400).json({
          error: `Unknown action: "${action}"`,
          availableActions: ['send', 'send_invoice', 'broadcast'],
        });
    }
  } catch (err) {
    console.error('email route error:', err);
    res.status(500).json({ error: err.message });
  }
});
