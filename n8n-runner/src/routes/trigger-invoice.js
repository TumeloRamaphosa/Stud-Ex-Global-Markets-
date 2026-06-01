import { Router } from 'express';
import fetch from 'node-fetch';
import { customerSearch, createInvoice, sendInvoice, getInvoicePdf } from '../lib/quickbooks.js';
import { markAsProcessed } from '../lib/google-sheets.js';
import { PRICE_TABLE } from './price-lookup.js';

export const triggerInvoiceRouter = Router();

const VAT_RATE = 0.15;
const STUDEX_EMAIL = 'info@studexmeat.com';

function marbleMultiplier(score) {
  if (score == null) return 1.0;
  const s = Number(score);
  if (s >= 9) return 1.5;
  if (s >= 7) return 1.3;
  if (s >= 5) return 1.15;
  return 1.0;
}

function buildLineItems(items) {
  return items.map((item) => {
    const entry = PRICE_TABLE[item.cut.toLowerCase()];
    if (!entry) throw new Error(`Unknown cut: ${item.cut}`);
    const unitPrice = entry.pricePerKg * marbleMultiplier(item.marbleScore);
    const subtotal = unitPrice * Number(item.weight);
    return {
      cut: entry.cut,
      weightKg: Number(item.weight),
      marbleScore: item.marbleScore ?? null,
      unitPricePerKg: Math.round(unitPrice * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
    };
  });
}

triggerInvoiceRouter.post('/trigger-invoice', async (req, res) => {
  const steps = [];

  try {
    const { customerId: inputCustomerId, customerName, email, items, spreadsheetId, sheetRowIndex } = req.body;

    if (!customerName || !email || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'customerName, email, and items[] are required' });
    }

    // Step 1: Trigger n8n webhook (fire-and-forget notification)
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nUrl) {
      try {
        await fetch(n8nUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'invoice_started', customerName, email, itemCount: items.length }),
        });
        steps.push({ step: 'n8n_webhook', status: 'ok' });
      } catch (err) {
        steps.push({ step: 'n8n_webhook', status: 'warning', message: err.message });
      }
    } else {
      steps.push({ step: 'n8n_webhook', status: 'skipped', message: 'N8N_WEBHOOK_URL not set' });
    }

    // Step 2: QuickBooks customer search
    let qbCustomerId = inputCustomerId;
    const customer = await customerSearch(customerName);
    if (customer) {
      qbCustomerId = customer.Id;
      steps.push({ step: 'customer_search', status: 'ok', qbCustomerId: customer.Id, displayName: customer.DisplayName });
    } else {
      steps.push({ step: 'customer_search', status: 'not_found', message: `No QuickBooks customer matching "${customerName}"` });
      if (!qbCustomerId) {
        return res.status(404).json({ error: `Customer "${customerName}" not found in QuickBooks`, steps });
      }
    }

    // Step 3: Build line items and create invoice with 15% VAT
    const lineItems = buildLineItems(items);
    const invoice = await createInvoice({
      customerId: qbCustomerId,
      lineItems,
      customerEmail: email,
    });
    steps.push({ step: 'invoice_create', status: 'ok', invoiceId: invoice.Id, docNumber: invoice.DocNumber });

    // Step 4: Send invoice to customer email
    await sendInvoice(invoice.Id, email);
    steps.push({ step: 'invoice_send_customer', status: 'ok', email });

    // Step 5: Send copy to Studex
    await sendInvoice(invoice.Id, STUDEX_EMAIL);
    steps.push({ step: 'invoice_send_studex', status: 'ok', email: STUDEX_EMAIL });

    // Step 6: Fetch invoice PDF
    const pdfBuffer = await getInvoicePdf(invoice.Id);
    steps.push({ step: 'invoice_pdf', status: 'ok', sizeBytes: pdfBuffer.length });

    // Step 7: Mark Google Sheet row as processed
    if (spreadsheetId && sheetRowIndex) {
      const sheetResult = await markAsProcessed(spreadsheetId, sheetRowIndex);
      steps.push({ step: 'google_sheet_mark', status: 'ok', ...sheetResult });
    } else {
      steps.push({ step: 'google_sheet_mark', status: 'skipped', message: 'No spreadsheetId/sheetRowIndex provided' });
    }

    // Calculate totals for response
    const subtotal = lineItems.reduce((s, li) => s + li.subtotal, 0);
    const vat = Math.round(subtotal * VAT_RATE * 100) / 100;
    const total = Math.round((subtotal + vat) * 100) / 100;

    res.json({
      success: true,
      invoiceId: invoice.Id,
      docNumber: invoice.DocNumber,
      customerName,
      email,
      lineItems,
      subtotal: Math.round(subtotal * 100) / 100,
      vat,
      total,
      currency: 'ZAR',
      steps,
    });
  } catch (err) {
    console.error('trigger-invoice error:', err);
    steps.push({ step: 'error', message: err.message });
    res.status(500).json({ error: err.message, steps });
  }
});
