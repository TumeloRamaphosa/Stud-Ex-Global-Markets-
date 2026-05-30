import { NextRequest, NextResponse } from 'next/server';

// ─── StudEx Meat — QuickBooks Online API Route ──────────────────────────────
// Pattern: Same as Perplexity's Shopify integration (/api/shopify)
// Orchestrated by: Perplexity Computer
// Built by: Claude Code (branch: claude/instagram-analytics-prd-qSt5w)
//
// QuickBooks Online REST API v3
// Base: https://quickbooks.api.intuit.com/v3/company/{companyId}
// Auth: OAuth2 Bearer token
//
// ENV VARS REQUIRED:
//   QUICKBOOKS_ACCESS_TOKEN   — OAuth2 access token (refresh via Intuit Developer)
//   QUICKBOOKS_REFRESH_TOKEN  — OAuth2 refresh token (for auto-refresh)
//   QUICKBOOKS_COMPANY_ID     — Company/Realm ID (from qbo.intuit.com URL)
//   QUICKBOOKS_CLIENT_ID      — OAuth2 app client ID
//   QUICKBOOKS_CLIENT_SECRET  — OAuth2 app client secret
//   QUICKBOOKS_ENVIRONMENT    — "production" or "sandbox" (default: production)
// ────────────────────────────────────────────────────────────────────────────

const QB_ENVIRONMENT = process.env.QUICKBOOKS_ENVIRONMENT || 'production';
const QB_BASE = QB_ENVIRONMENT === 'sandbox'
  ? 'https://sandbox-quickbooks.api.intuit.com/v3/company'
  : 'https://quickbooks.api.intuit.com/v3/company';
const COMPANY_ID = process.env.QUICKBOOKS_COMPANY_ID || '';
let ACCESS_TOKEN = process.env.QUICKBOOKS_ACCESS_TOKEN || '';
const REFRESH_TOKEN = process.env.QUICKBOOKS_REFRESH_TOKEN || '';
const CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID || '';
const CLIENT_SECRET = process.env.QUICKBOOKS_CLIENT_SECRET || '';
const VAT_RATE = 15;

const qbHeaders = () => ({
  'Authorization': `Bearer ${ACCESS_TOKEN}`,
  'Accept': 'application/json',
  'Content-Type': 'application/json',
});

async function qbFetch(path: string, options?: RequestInit) {
  const url = `${QB_BASE}/${COMPANY_ID}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...qbHeaders(), ...(options?.headers || {}) },
  });

  if (res.status === 401 && REFRESH_TOKEN) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const retry = await fetch(url, {
        ...options,
        headers: { ...qbHeaders(), ...(options?.headers || {}) },
      });
      if (!retry.ok) {
        const err = await retry.text();
        throw new Error(`QuickBooks API error ${retry.status}: ${err}`);
      }
      return retry.json();
    }
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`QuickBooks API error ${res.status}: ${err}`);
  }
  return res.json();
}

async function refreshAccessToken(): Promise<boolean> {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) return false;
  try {
    const res = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=refresh_token&refresh_token=${REFRESH_TOKEN}`,
    });
    if (!res.ok) return false;
    const data = await res.json();
    ACCESS_TOKEN = data.access_token;
    return true;
  } catch {
    return false;
  }
}

async function qbQuery(query: string) {
  const encoded = encodeURIComponent(query);
  return qbFetch(`/query?query=${encoded}`);
}

// ── Test mode — return mock data when ?test=1 ─────────────────────────────
function mockResponse(action: string) {
  const mocks: Record<string, object> = {
    company_info: {
      mock: true,
      company: {
        name: 'StudEx Meat (Pty) Ltd',
        legalName: 'StudEx Meat',
        country: 'ZA',
        email: 'info@studexmeat.com',
        fiscalYearStart: 'March',
      },
    },
    invoices_recent: {
      mock: true,
      invoices: [
        { id: '4883', docNumber: 'INV-001', customer: 'The Blockman Parkhurst', total: 9487.50, balance: 9487.50, date: '2026-01-22', status: 'Open' },
        { id: '4884', docNumber: 'INV-002', customer: 'Daruma', total: 5250.00, balance: 0, date: '2026-02-07', status: 'Paid' },
      ],
    },
    customers_all: {
      mock: true,
      customers: [
        { id: '1', name: 'The Blockman Parkhurst', email: 'orders@blockman.co.za', balance: 9487.50 },
        { id: '2', name: 'Daruma', email: 'kitchen@daruma.co.za', balance: 0 },
        { id: '3', name: 'Big Mouth', email: 'info@bigmouth.co.za', balance: 0 },
      ],
    },
    revenue_summary: {
      mock: true,
      totalRevenue: 189000,
      totalInvoices: 47,
      unpaidBalance: 83937.50,
      currency: 'ZAR',
    },
    items_all: {
      mock: true,
      items: [
        { id: '1', name: 'Wagyu Ribeye 4/5', unitPrice: 1500, type: 'Service' },
        { id: '2', name: 'Wagyu Fillet 6/7', unitPrice: 1500, type: 'Service' },
        { id: '3', name: 'Wagyu Boerewors', unitPrice: 350, type: 'Service' },
      ],
    },
  };
  return mocks[action] || { mock: true, message: 'No mock for this action' };
}

export async function GET(req: NextRequest) {
  const test = req.nextUrl.searchParams.get('test');
  if (test === '1') {
    return NextResponse.json({
      mock: true,
      status: 'QuickBooks route ready',
      companyId: COMPANY_ID || 'NOT SET',
      tokenConfigured: !!ACCESS_TOKEN,
      environment: QB_ENVIRONMENT,
    });
  }

  return NextResponse.json({
    service: 'StudEx Meat — QuickBooks Online API',
    version: '1.0.0',
    companyId: COMPANY_ID || 'NOT SET',
    tokenConfigured: !!ACCESS_TOKEN,
    environment: QB_ENVIRONMENT,
    actions: [
      'company_info',
      'invoices_recent', 'invoices_unpaid', 'invoices_overdue',
      'invoice_get', 'invoice_create', 'invoice_send', 'invoice_pdf',
      'customers_all', 'customer_search', 'customer_create',
      'items_all', 'item_create',
      'revenue_summary', 'profit_loss', 'balance_sheet',
      'tax_rates',
      'payment_create',
    ],
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  // Test mode
  const test = req.nextUrl.searchParams.get('test');
  if (test === '1') {
    return NextResponse.json(mockResponse(action));
  }

  if (!ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'QUICKBOOKS_ACCESS_TOKEN not configured. Set it in Fly.io secrets or .env.local' },
      { status: 400 }
    );
  }

  if (!COMPANY_ID) {
    return NextResponse.json(
      { error: 'QUICKBOOKS_COMPANY_ID not configured. Find it in your QBO URL.' },
      { status: 400 }
    );
  }

  try {
    // ─── COMPANY ────────────────────────────────────────────────────────

    if (action === 'company_info') {
      const data = await qbFetch(`/companyinfo/${COMPANY_ID}`);
      const info = data.CompanyInfo;
      return NextResponse.json({
        company: {
          id: info.Id,
          name: info.CompanyName,
          legalName: info.LegalName,
          country: info.Country,
          email: info.Email?.Address,
          phone: info.PrimaryPhone?.FreeFormNumber,
          address: info.CompanyAddr ? {
            line1: info.CompanyAddr.Line1,
            city: info.CompanyAddr.City,
            postalCode: info.CompanyAddr.PostalCode,
            country: info.CompanyAddr.Country,
          } : null,
          fiscalYearStart: info.FiscalYearStartMonth,
        },
      });
    }

    // ─── INVOICES ───────────────────────────────────────────────────────

    if (action === 'invoices_recent') {
      const limit = body.limit || 25;
      const data = await qbQuery(
        `SELECT * FROM Invoice ORDERBY MetaData.CreateTime DESC MAXRESULTS ${limit}`
      );
      const invoices = (data.QueryResponse?.Invoice || []).map((inv: any) => ({
        id: inv.Id,
        docNumber: inv.DocNumber,
        customer: inv.CustomerRef?.name,
        customerId: inv.CustomerRef?.value,
        total: parseFloat(inv.TotalAmt),
        balance: parseFloat(inv.Balance),
        date: inv.TxnDate,
        dueDate: inv.DueDate,
        status: parseFloat(inv.Balance) === 0 ? 'Paid' : 'Open',
        emailStatus: inv.EmailStatus,
        lineItems: (inv.Line || [])
          .filter((l: any) => l.DetailType === 'SalesItemLineDetail')
          .map((l: any) => ({
            description: l.Description,
            amount: parseFloat(l.Amount),
            quantity: l.SalesItemLineDetail?.Qty,
            unitPrice: l.SalesItemLineDetail?.UnitPrice,
            itemRef: l.SalesItemLineDetail?.ItemRef?.name,
          })),
      }));
      return NextResponse.json({ invoices, count: invoices.length });
    }

    if (action === 'invoices_unpaid') {
      const data = await qbQuery(
        `SELECT * FROM Invoice WHERE Balance > '0' ORDERBY DueDate ASC MAXRESULTS 50`
      );
      const invoices = (data.QueryResponse?.Invoice || []).map((inv: any) => ({
        id: inv.Id,
        docNumber: inv.DocNumber,
        customer: inv.CustomerRef?.name,
        total: parseFloat(inv.TotalAmt),
        balance: parseFloat(inv.Balance),
        date: inv.TxnDate,
        dueDate: inv.DueDate,
      }));
      const totalUnpaid = invoices.reduce((s: number, i: any) => s + i.balance, 0);
      return NextResponse.json({ invoices, count: invoices.length, totalUnpaid });
    }

    if (action === 'invoices_overdue') {
      const today = new Date().toISOString().slice(0, 10);
      const data = await qbQuery(
        `SELECT * FROM Invoice WHERE Balance > '0' AND DueDate < '${today}' ORDERBY DueDate ASC MAXRESULTS 50`
      );
      const invoices = (data.QueryResponse?.Invoice || []).map((inv: any) => ({
        id: inv.Id,
        docNumber: inv.DocNumber,
        customer: inv.CustomerRef?.name,
        total: parseFloat(inv.TotalAmt),
        balance: parseFloat(inv.Balance),
        dueDate: inv.DueDate,
        daysOverdue: Math.floor((Date.now() - new Date(inv.DueDate).getTime()) / 86400000),
      }));
      return NextResponse.json({ invoices, count: invoices.length });
    }

    if (action === 'invoice_get') {
      const { invoiceId } = body;
      if (!invoiceId) return NextResponse.json({ error: 'invoiceId required' }, { status: 400 });
      const data = await qbFetch(`/invoice/${invoiceId}`);
      return NextResponse.json({ invoice: data.Invoice });
    }

    if (action === 'invoice_create') {
      // body: { customerId, customerName, items: [{ description, quantity, unitPrice, itemRef? }], memo? }
      const { customerId, customerName, items, memo } = body;
      if (!customerId || !items?.length) {
        return NextResponse.json({ error: 'customerId and items[] required' }, { status: 400 });
      }

      // Build line items
      const lines = items.map((item: any, idx: number) => ({
        DetailType: 'SalesItemLineDetail',
        Amount: (item.quantity || 1) * (item.unitPrice || 0),
        Description: item.description || `${item.cut || 'Item'} — Marble ${item.marbleScore || 'N/A'} — ${item.weight || item.quantity}kg`,
        SalesItemLineDetail: {
          Qty: item.quantity || item.weight || 1,
          UnitPrice: item.unitPrice || item.pricePerKg || 0,
          ...(item.itemRef ? { ItemRef: { value: item.itemRef } } : {}),
        },
      }));

      // Calculate subtotal for tax line
      const subtotal = lines.reduce((s: number, l: any) => s + l.Amount, 0);

      const invoicePayload: any = {
        CustomerRef: { value: customerId, name: customerName },
        Line: [
          ...lines,
          {
            DetailType: 'SubTotalLineDetail',
            Amount: subtotal,
            SubTotalLineDetail: {},
          },
        ],
        BillEmail: body.email ? { Address: body.email } : undefined,
        CustomerMemo: memo ? { value: memo } : undefined,
        TxnTaxDetail: {
          TotalTax: Math.round(subtotal * VAT_RATE / 100 * 100) / 100,
        },
      };

      const data = await qbFetch('/invoice', {
        method: 'POST',
        body: JSON.stringify(invoicePayload),
      });

      return NextResponse.json({
        success: true,
        invoice: {
          id: data.Invoice.Id,
          docNumber: data.Invoice.DocNumber,
          total: parseFloat(data.Invoice.TotalAmt),
          balance: parseFloat(data.Invoice.Balance),
          customer: data.Invoice.CustomerRef?.name,
          date: data.Invoice.TxnDate,
        },
      });
    }

    if (action === 'invoice_send') {
      // Email an invoice to the customer
      const { invoiceId, email } = body;
      if (!invoiceId) return NextResponse.json({ error: 'invoiceId required' }, { status: 400 });
      const emailParam = email ? `?sendTo=${encodeURIComponent(email)}` : '';
      const data = await qbFetch(`/invoice/${invoiceId}/send${emailParam}`, { method: 'POST' });
      return NextResponse.json({ success: true, invoice: data.Invoice });
    }

    if (action === 'invoice_pdf') {
      // Get invoice as PDF
      const { invoiceId } = body;
      if (!invoiceId) return NextResponse.json({ error: 'invoiceId required' }, { status: 400 });
      const url = `${QB_BASE}/${COMPANY_ID}/invoice/${invoiceId}/pdf`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Accept': 'application/pdf',
        },
      });
      if (!res.ok) throw new Error(`PDF download failed: ${res.status}`);
      const pdfBuffer = await res.arrayBuffer();
      const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
      return NextResponse.json({
        invoiceId,
        pdf: pdfBase64,
        contentType: 'application/pdf',
        filename: `invoice-${invoiceId}.pdf`,
      });
    }

    // ─── CUSTOMERS ──────────────────────────────────────────────────────

    if (action === 'customers_all') {
      const limit = body.limit || 100;
      const data = await qbQuery(
        `SELECT * FROM Customer ORDERBY DisplayName ASC MAXRESULTS ${limit}`
      );
      const customers = (data.QueryResponse?.Customer || []).map((c: any) => ({
        id: c.Id,
        name: c.DisplayName,
        companyName: c.CompanyName,
        email: c.PrimaryEmailAddr?.Address,
        phone: c.PrimaryPhone?.FreeFormNumber,
        balance: parseFloat(c.Balance || '0'),
        active: c.Active,
      }));
      return NextResponse.json({ customers, count: customers.length });
    }

    if (action === 'customer_search') {
      // Search by name or email
      const { query } = body;
      if (!query) return NextResponse.json({ error: 'query required' }, { status: 400 });
      const data = await qbQuery(
        `SELECT * FROM Customer WHERE DisplayName LIKE '%${query.replace(/'/g, "\\'")}%' MAXRESULTS 20`
      );
      const customers = (data.QueryResponse?.Customer || []).map((c: any) => ({
        id: c.Id,
        name: c.DisplayName,
        email: c.PrimaryEmailAddr?.Address,
        balance: parseFloat(c.Balance || '0'),
      }));

      if (customers.length === 0 && body.searchEmail) {
        const emailData = await qbQuery(
          `SELECT * FROM Customer WHERE PrimaryEmailAddr = '${body.searchEmail.replace(/'/g, "\\'")}' MAXRESULTS 5`
        );
        const emailCustomers = (emailData.QueryResponse?.Customer || []).map((c: any) => ({
          id: c.Id,
          name: c.DisplayName,
          email: c.PrimaryEmailAddr?.Address,
          balance: parseFloat(c.Balance || '0'),
        }));
        return NextResponse.json({ customers: emailCustomers, count: emailCustomers.length, searchedBy: 'email' });
      }

      return NextResponse.json({ customers, count: customers.length });
    }

    if (action === 'customer_create') {
      // body: { name, email?, phone?, companyName? }
      const { name, email, phone, companyName } = body;
      if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });
      const customerPayload: any = {
        DisplayName: name,
        ...(companyName && { CompanyName: companyName }),
        ...(email && { PrimaryEmailAddr: { Address: email } }),
        ...(phone && { PrimaryPhone: { FreeFormNumber: phone } }),
      };
      const data = await qbFetch('/customer', {
        method: 'POST',
        body: JSON.stringify(customerPayload),
      });
      return NextResponse.json({
        success: true,
        customer: {
          id: data.Customer.Id,
          name: data.Customer.DisplayName,
          email: data.Customer.PrimaryEmailAddr?.Address,
        },
      });
    }

    // ─── ITEMS / PRODUCTS ───────────────────────────────────────────────

    if (action === 'items_all') {
      const limit = body.limit || 100;
      const data = await qbQuery(
        `SELECT * FROM Item WHERE Type = 'Service' OR Type = 'Inventory' ORDERBY Name ASC MAXRESULTS ${limit}`
      );
      const items = (data.QueryResponse?.Item || []).map((item: any) => ({
        id: item.Id,
        name: item.Name,
        description: item.Description,
        unitPrice: parseFloat(item.UnitPrice || '0'),
        type: item.Type,
        active: item.Active,
        taxable: item.Taxable,
        incomeAccountRef: item.IncomeAccountRef?.name,
      }));
      return NextResponse.json({ items, count: items.length });
    }

    if (action === 'item_create') {
      // body: { name, description?, unitPrice, type?: "Service"|"Inventory" }
      const { name, description, unitPrice, type } = body;
      if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });
      const itemPayload: any = {
        Name: name,
        Type: type || 'Service',
        UnitPrice: unitPrice || 0,
        ...(description && { Description: description }),
        Taxable: true,
        IncomeAccountRef: { value: '1' },
      };
      const data = await qbFetch('/item', {
        method: 'POST',
        body: JSON.stringify(itemPayload),
      });
      return NextResponse.json({
        success: true,
        item: {
          id: data.Item.Id,
          name: data.Item.Name,
          unitPrice: parseFloat(data.Item.UnitPrice || '0'),
        },
      });
    }

    // ─── REPORTS ─────────────────────────────────────────────────────────

    if (action === 'revenue_summary') {
      const [invoiceData, unpaidData] = await Promise.all([
        qbQuery(`SELECT COUNT(*) FROM Invoice`),
        qbQuery(`SELECT * FROM Invoice WHERE Balance > '0' MAXRESULTS 200`),
      ]);
      const totalInvoices = invoiceData.QueryResponse?.totalCount || 0;
      const unpaidInvoices = unpaidData.QueryResponse?.Invoice || [];
      const totalUnpaid = unpaidInvoices.reduce((s: number, i: any) => s + parseFloat(i.Balance || '0'), 0);
      const totalAmount = unpaidInvoices.reduce((s: number, i: any) => s + parseFloat(i.TotalAmt || '0'), 0);
      return NextResponse.json({
        totalInvoices,
        unpaidCount: unpaidInvoices.length,
        unpaidBalance: Math.round(totalUnpaid * 100) / 100,
        currency: 'ZAR',
      });
    }

    if (action === 'profit_loss') {
      // Profit & Loss report
      const startDate = body.startDate || new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
      const endDate = body.endDate || new Date().toISOString().slice(0, 10);
      const data = await qbFetch(
        `/reports/ProfitAndLoss?start_date=${startDate}&end_date=${endDate}&accounting_method=Accrual`
      );
      return NextResponse.json({
        report: 'Profit & Loss',
        period: { start: startDate, end: endDate },
        data: data,
      });
    }

    if (action === 'balance_sheet') {
      const asOfDate = body.asOfDate || new Date().toISOString().slice(0, 10);
      const data = await qbFetch(
        `/reports/BalanceSheet?date_macro=Today&accounting_method=Accrual`
      );
      return NextResponse.json({
        report: 'Balance Sheet',
        asOf: asOfDate,
        data: data,
      });
    }

    // ─── TAX ────────────────────────────────────────────────────────────

    if (action === 'tax_rates') {
      const data = await qbQuery(`SELECT * FROM TaxRate MAXRESULTS 50`);
      const rates = (data.QueryResponse?.TaxRate || []).map((t: any) => ({
        id: t.Id,
        name: t.Name,
        description: t.Description,
        rate: parseFloat(t.RateValue || '0'),
        active: t.Active,
      }));
      return NextResponse.json({ taxRates: rates });
    }

    // ─── PAYMENTS ───────────────────────────────────────────────────────

    if (action === 'payment_create') {
      // Record a payment against an invoice
      const { customerId, invoiceId, amount } = body;
      if (!customerId || !invoiceId || !amount) {
        return NextResponse.json({ error: 'customerId, invoiceId, and amount required' }, { status: 400 });
      }
      const paymentPayload = {
        CustomerRef: { value: customerId },
        TotalAmt: amount,
        Line: [{
          Amount: amount,
          LinkedTxn: [{ TxnId: invoiceId, TxnType: 'Invoice' }],
        }],
      };
      const data = await qbFetch('/payment', {
        method: 'POST',
        body: JSON.stringify(paymentPayload),
      });
      return NextResponse.json({
        success: true,
        payment: {
          id: data.Payment.Id,
          amount: parseFloat(data.Payment.TotalAmt),
          customer: data.Payment.CustomerRef?.name,
        },
      });
    }

    return NextResponse.json(
      {
        error: 'Unknown action.',
        available: [
          'company_info',
          'invoices_recent', 'invoices_unpaid', 'invoices_overdue',
          'invoice_get', 'invoice_create', 'invoice_send', 'invoice_pdf',
          'customers_all', 'customer_search', 'customer_create',
          'items_all', 'item_create',
          'revenue_summary', 'profit_loss', 'balance_sheet',
          'tax_rates',
          'payment_create',
        ],
      },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
