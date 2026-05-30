const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// n8n Cloud instance
const N8N_BASE = process.env.N8N_BASE_URL || 'https://studexgroup.app.n8n.cloud';
const N8N_API_KEY = process.env.N8N_API_KEY || '';

// Google Sheets config
const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1tnBDwEA_BKJMLrXJEVr75YeVh5PK8kgoi9lCRz3k1XY';

// QuickBooks config
const QB_COMPANY_ID = process.env.QUICKBOOKS_COMPANY_ID || '';
const QB_ACCESS_TOKEN = process.env.QUICKBOOKS_ACCESS_TOKEN || '';

const VAT_RATE = 0.15;

// Wagyu wholesale lookup by marble grade
const WAGYU_PRICES = {
  'Fillet':       { '4/5': 950, '6/7': 1500, '8/9': 1550, '10+': 1650 },
  'Rib-eye':      { '4/5': 1500, '6/7': 1750, '8/9': 1950, '10+': 2250 },
  'Rump':         { '4/5': 750, '6/7': 950, '8/9': 1250, '10+': 1450 },
  'Picanha':      { '4/5': 750, '6/7': 850, '8/9': 1250, '10+': 1550 },
  'T-BONE':       { '4/5': 0, '6/7': 0, '8/9': 1850, '10+': 2100 },
  'Sirloin':      { '4/5': 950, '6/7': 1350, '8/9': 1550, '10+': 1750 },
  'Silverside':   { '4/5': 550, '6/7': 650, '8/9': 850, '10+': 950 },
  'Biltong cuts': { '4/5': 450, '6/7': 550, '8/9': 650, '10+': 750 },
  'Chuck eye':    { '4/5': 550, '6/7': 750, '8/9': 950, '10+': 1250 },
  'Brisket':      { '4/5': 450, '6/7': 750, '8/9': 850, '10+': 950 },
  'Tmx':          { '4/5': 250, '6/7': 250, '8/9': 250, '10+': 250 },
  'Denver':       { '4/5': 750, '6/7': 950, '8/9': 1250, '10+': 1450 },
  'Bavette':      { '4/5': 650, '6/7': 950, '8/9': 1350, '10+': 1550 },
  'Tri-Tip':      { '4/5': 650, '6/7': 1100, '8/9': 1350, '10+': 1550 },
  'Flank':        { '4/5': 550, '6/7': 650, '8/9': 750, '10+': 950 },
  'Flat Iron':    { '4/5': 550, '6/7': 650, '8/9': 850, '10+': 1150 },
  'Patties':      { '4/5': 350, '6/7': 350, '8/9': 350, '10+': 450 },
  'Boerewors':    { '4/5': 350, '6/7': 350, '8/9': 350, '10+': 350 },
  'Biltong':      { '4/5': 550, '6/7': 550, '8/9': 650, '10+': 750 },
  'Droewors':     { '4/5': 550, '6/7': 550, '8/9': 650, '10+': 750 },
};

// Helper: call n8n API
async function n8nAPI(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${N8N_BASE}/api/v1${path}`, opts);
  return res.json();
}

// ===== HEALTH =====
app.get('/', (req, res) => {
  res.json({
    name: 'StudEx Meat — n8n Workflow Runner',
    version: '1.0.0',
    n8nInstance: N8N_BASE,
    n8nConnected: !!N8N_API_KEY,
    quickbooksConnected: !!QB_ACCESS_TOKEN,
    googleSheetId: SHEET_ID,
    endpoints: [
      'GET  /                      — health check',
      'GET  /workflows             — list all n8n workflows',
      'POST /workflows/:id/execute — trigger a workflow',
      'GET  /workflows/:id/status  — last execution status',
      'POST /calculate-invoice     — calculate line items + VAT',
      'POST /trigger-invoice       — trigger full invoice pipeline',
      'GET  /pending-invoices      — get pending invoice rows',
      'GET  /price-lookup          — lookup wholesale price by cut + marble',
    ],
  });
});

// ===== n8n WORKFLOW MANAGEMENT =====

// List all workflows
app.get('/workflows', async (req, res) => {
  try {
    const data = await n8nAPI('/workflows');
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Trigger a specific workflow
app.post('/workflows/:id/execute', async (req, res) => {
  try {
    const data = await n8nAPI(`/workflows/${req.params.id}/execute`, 'POST', req.body || {});
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get workflow execution status
app.get('/workflows/:id/status', async (req, res) => {
  try {
    const data = await n8nAPI(`/executions?workflowId=${req.params.id}&limit=1`);
    const latest = data.data?.[0];
    res.json({
      workflowId: req.params.id,
      lastExecution: latest ? {
        id: latest.id,
        status: latest.status,
        startedAt: latest.startedAt,
        stoppedAt: latest.stoppedAt,
        mode: latest.mode,
      } : null,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== INVOICE CALCULATION =====

// Calculate invoice totals
app.post('/calculate-invoice', (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'items array required' });
  }

  const lineItems = items.map(item => {
    const cut = item.cut || item.description || '';
    const marble = item.marbleScore || '4/5';
    const weight = parseFloat(item.weight) || 0;

    // Try to lookup wholesale price
    let pricePerKg = parseFloat(item.pricePerKg) || 0;
    if (!pricePerKg && WAGYU_PRICES[cut]) {
      pricePerKg = WAGYU_PRICES[cut][marble] || 0;
    }

    const lineTotal = weight * pricePerKg;
    return {
      cut,
      marbleScore: marble,
      weight,
      pricePerKg,
      lineTotal: Math.round(lineTotal * 100) / 100,
    };
  });

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const vat = Math.round(subtotal * VAT_RATE * 100) / 100;
  const grandTotal = Math.round((subtotal + vat) * 100) / 100;

  res.json({
    lineItems,
    subtotal: Math.round(subtotal * 100) / 100,
    vat,
    vatRate: `${VAT_RATE * 100}%`,
    grandTotal,
  });
});

// Trigger the full invoice automation pipeline
app.post('/trigger-invoice', async (req, res) => {
  try {
    const { customer, items } = req.body;
    if (!customer || !items) {
      return res.status(400).json({ error: 'customer and items required' });
    }

    // Step 1: Calculate totals
    const lineItems = items.map(item => {
      const weight = parseFloat(item.weight) || 0;
      let pricePerKg = parseFloat(item.pricePerKg) || 0;
      if (!pricePerKg && WAGYU_PRICES[item.cut]) {
        pricePerKg = WAGYU_PRICES[item.cut][item.marbleScore || '4/5'] || 0;
      }
      return {
        ...item,
        weight,
        pricePerKg,
        lineTotal: Math.round(weight * pricePerKg * 100) / 100,
      };
    });

    const subtotal = lineItems.reduce((sum, i) => sum + i.lineTotal, 0);
    const vat = Math.round(subtotal * VAT_RATE * 100) / 100;
    const grandTotal = Math.round((subtotal + vat) * 100) / 100;

    // Step 2: Trigger n8n workflow with calculated data
    const invoiceData = {
      customer,
      lineItems,
      subtotal,
      vat,
      grandTotal,
      notifyEmail: 'info@studexmeat.com',
      generatedAt: new Date().toISOString(),
    };

    // Find the invoice automation workflow
    const workflows = await n8nAPI('/workflows');
    const invoiceWorkflow = (workflows.data || []).find(
      w => w.name && w.name.toLowerCase().includes('invoice')
    );

    if (invoiceWorkflow) {
      const execution = await n8nAPI(
        `/workflows/${invoiceWorkflow.id}/execute`,
        'POST',
        invoiceData
      );
      res.json({
        success: true,
        invoiceData,
        execution,
        workflowId: invoiceWorkflow.id,
      });
    } else {
      // No n8n workflow found — return calculated data for manual processing
      res.json({
        success: false,
        message: 'Invoice calculated but n8n workflow not found. Import 12-studex-meat-invoice-automation.json into n8n.',
        invoiceData,
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending invoices (would connect to Google Sheets in production)
app.get('/pending-invoices', (req, res) => {
  res.json({
    sheetId: SHEET_ID,
    pending: [
      {
        id: 1, date: '2026-01-22', customer: 'The Blockman Parkhurst',
        description: '10 x 500g Wagyu Ribeye', marbleScore: '4/5',
        weightKg: 5, amount: 8250, vat: 1237.50, final: 9487.50, status: 'Pending',
      },
      {
        id: 2, date: '2026-02-07', customer: 'Daruma',
        description: '2kg Ribeye', marbleScore: '7',
        weightKg: 3, amount: null, vat: null, final: null, status: 'Pending',
      },
      {
        id: 3, date: '2026-05-02', customer: 'Big Mouth',
        description: '30 x 250g Wagyu Boerewors', marbleScore: null,
        weightKg: 7.5, amount: null, vat: null, final: null, status: 'Pending',
      },
    ],
  });
});

// Price lookup by cut + marble score
app.get('/price-lookup', (req, res) => {
  const { cut, marble } = req.query;
  if (!cut) return res.status(400).json({ error: 'cut parameter required' });

  const prices = WAGYU_PRICES[cut];
  if (!prices) {
    return res.json({
      cut,
      found: false,
      available: Object.keys(WAGYU_PRICES),
    });
  }

  if (marble) {
    const price = prices[marble];
    return res.json({ cut, marble, pricePerKg: price || 0, found: !!price });
  }

  res.json({ cut, found: true, prices });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`StudEx n8n Workflow Runner on port ${PORT}`);
  console.log(`n8n instance: ${N8N_BASE}`);
  console.log(`n8n API key: ${N8N_API_KEY ? 'configured' : 'NOT SET'}`);
  console.log(`QuickBooks: ${QB_ACCESS_TOKEN ? 'configured' : 'NOT SET'}`);
});
