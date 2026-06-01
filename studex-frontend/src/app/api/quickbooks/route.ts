import { NextRequest, NextResponse } from 'next/server';

const QB_BASE = 'https://quickbooks.api.intuit.com/v3/company';

let accessToken = '';
let tokenExpiry = 0;

async function refreshToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  const res = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: `grant_type=refresh_token&refresh_token=${process.env.QUICKBOOKS_REFRESH_TOKEN}`,
  });

  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return accessToken;
}

async function qbFetch(endpoint: string, options?: RequestInit) {
  const token = await refreshToken();
  const realmId = process.env.QUICKBOOKS_REALM_ID;
  const res = await fetch(`${QB_BASE}/${realmId}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      ...options?.headers,
    },
  });
  return res.json();
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  switch (action) {
    // --- Customer actions ---
    case 'customer_search': {
      const query = encodeURIComponent(`SELECT * FROM Customer WHERE DisplayName LIKE '%${body.customerName}%'`);
      const result = await qbFetch(`/query?query=${query}`);
      const customers = result.QueryResponse?.Customer || [];

      if (customers.length === 0 && body.autoCreate) {
        const newCustomer = await qbFetch('/customer', {
          method: 'POST',
          body: JSON.stringify({
            DisplayName: body.customerName,
            PrimaryEmailAddr: { Address: body.email },
          }),
        });
        return NextResponse.json({ ok: true, customer: newCustomer.Customer, created: true });
      }

      return NextResponse.json({ ok: true, customers, found: customers.length });
    }

    case 'customer_create': {
      const result = await qbFetch('/customer', {
        method: 'POST',
        body: JSON.stringify({
          DisplayName: body.displayName,
          PrimaryEmailAddr: body.email ? { Address: body.email } : undefined,
          PrimaryPhone: body.phone ? { FreeFormNumber: body.phone } : undefined,
          BillAddr: body.address ? {
            Line1: body.address.line1,
            City: body.address.city,
            CountrySubDivisionCode: body.address.state,
            PostalCode: body.address.postalCode,
            Country: body.address.country || 'ZA',
          } : undefined,
          Notes: body.notes,
        }),
      });
      return NextResponse.json({ ok: true, customer: result.Customer });
    }

    case 'customer_update': {
      const result = await qbFetch(`/customer`, {
        method: 'POST',
        body: JSON.stringify({
          Id: body.customerId,
          SyncToken: body.syncToken,
          ...body.data,
        }),
      });
      return NextResponse.json({ ok: true, customer: result.Customer });
    }

    case 'customer_list': {
      const limit = body.limit || 100;
      const offset = body.offset || 1;
      const query = encodeURIComponent(`SELECT * FROM Customer STARTPOSITION ${offset} MAXRESULTS ${limit}`);
      const result = await qbFetch(`/query?query=${query}`);
      return NextResponse.json({ ok: true, customers: result.QueryResponse?.Customer || [], total: result.QueryResponse?.totalCount });
    }

    // --- Invoice actions ---
    case 'invoice_create': {
      const vatRate = 15;
      const lines = body.items.map((item: { description: string; weight: number; cut: string; marbleScore?: string }, i: number) => ({
        LineNum: i + 1,
        Amount: item.weight * 100,
        DetailType: 'SalesItemLineDetail',
        Description: item.description || `${item.cut} (Marble: ${item.marbleScore || 'N/A'})`,
        SalesItemLineDetail: {
          Qty: item.weight,
          UnitPrice: 100,
          TaxCodeRef: { value: 'TAX' },
        },
      }));

      const invoice = await qbFetch('/invoice', {
        method: 'POST',
        body: JSON.stringify({
          CustomerRef: { value: body.customerId },
          Line: lines,
          TxnTaxDetail: {
            TotalTax: lines.reduce((sum: number, l: { Amount: number }) => sum + l.Amount, 0) * (vatRate / 100),
          },
          BillEmail: { Address: body.email },
        }),
      });

      return NextResponse.json({ ok: true, invoice: invoice.Invoice });
    }

    case 'invoice_send': {
      const result = await qbFetch(`/invoice/${body.invoiceId}/send?sendTo=${body.email}`, { method: 'POST' });
      return NextResponse.json({ ok: true, result });
    }

    case 'invoice_pdf': {
      const token = await refreshToken();
      const realmId = process.env.QUICKBOOKS_REALM_ID;
      const res = await fetch(`${QB_BASE}/${realmId}/invoice/${body.invoiceId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
      });
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename=invoice-${body.invoiceId}.pdf` },
      });
    }

    case 'invoice_list': {
      const limit = body.limit || 100;
      const offset = body.offset || 1;
      const query = encodeURIComponent(`SELECT * FROM Invoice STARTPOSITION ${offset} MAXRESULTS ${limit}`);
      const result = await qbFetch(`/query?query=${query}`);
      return NextResponse.json({ ok: true, invoices: result.QueryResponse?.Invoice || [], total: result.QueryResponse?.totalCount });
    }

    case 'invoice_get': {
      const result = await qbFetch(`/invoice/${body.invoiceId}`);
      return NextResponse.json({ ok: true, invoice: result.Invoice });
    }

    case 'invoice_void': {
      const invoice = await qbFetch(`/invoice/${body.invoiceId}`);
      const result = await qbFetch(`/invoice?operation=void`, {
        method: 'POST',
        body: JSON.stringify({
          Id: body.invoiceId,
          SyncToken: invoice.Invoice.SyncToken,
        }),
      });
      return NextResponse.json({ ok: true, invoice: result.Invoice });
    }

    case 'invoice_update': {
      const result = await qbFetch('/invoice', {
        method: 'POST',
        body: JSON.stringify({
          Id: body.invoiceId,
          SyncToken: body.syncToken,
          ...body.data,
        }),
      });
      return NextResponse.json({ ok: true, invoice: result.Invoice });
    }

    // --- Payment actions ---
    case 'payment_create': {
      const result = await qbFetch('/payment', {
        method: 'POST',
        body: JSON.stringify({
          CustomerRef: { value: body.customerId },
          TotalAmt: body.amount,
          Line: [{
            Amount: body.amount,
            LinkedTxn: [{ TxnId: body.invoiceId, TxnType: 'Invoice' }],
          }],
          PaymentMethodRef: body.paymentMethodId ? { value: body.paymentMethodId } : undefined,
        }),
      });
      return NextResponse.json({ ok: true, payment: result.Payment });
    }

    case 'payment_list': {
      const limit = body.limit || 100;
      const offset = body.offset || 1;
      const query = encodeURIComponent(`SELECT * FROM Payment STARTPOSITION ${offset} MAXRESULTS ${limit}`);
      const result = await qbFetch(`/query?query=${query}`);
      return NextResponse.json({ ok: true, payments: result.QueryResponse?.Payment || [], total: result.QueryResponse?.totalCount });
    }

    // --- Estimate actions ---
    case 'estimate_create': {
      const lines = body.items.map((item: { description: string; qty: number; unitPrice: number }, i: number) => ({
        LineNum: i + 1,
        Amount: item.qty * item.unitPrice,
        DetailType: 'SalesItemLineDetail',
        Description: item.description,
        SalesItemLineDetail: {
          Qty: item.qty,
          UnitPrice: item.unitPrice,
        },
      }));

      const result = await qbFetch('/estimate', {
        method: 'POST',
        body: JSON.stringify({
          CustomerRef: { value: body.customerId },
          Line: lines,
          BillEmail: body.email ? { Address: body.email } : undefined,
          ExpirationDate: body.expirationDate,
        }),
      });
      return NextResponse.json({ ok: true, estimate: result.Estimate });
    }

    case 'estimate_send': {
      const result = await qbFetch(`/estimate/${body.estimateId}/send?sendTo=${body.email}`, { method: 'POST' });
      return NextResponse.json({ ok: true, result });
    }

    // --- Report actions ---
    case 'report_profit_loss': {
      const params = new URLSearchParams();
      if (body.startDate) params.set('start_date', body.startDate);
      if (body.endDate) params.set('end_date', body.endDate);
      const result = await qbFetch(`/reports/ProfitAndLoss?${params.toString()}`);
      return NextResponse.json({ ok: true, report: result });
    }

    case 'report_balance_sheet': {
      const params = new URLSearchParams();
      if (body.date) params.set('date', body.date);
      if (body.startDate) params.set('start_date', body.startDate);
      if (body.endDate) params.set('end_date', body.endDate);
      const result = await qbFetch(`/reports/BalanceSheet?${params.toString()}`);
      return NextResponse.json({ ok: true, report: result });
    }

    case 'report_sales_by_customer': {
      const params = new URLSearchParams();
      if (body.startDate) params.set('start_date', body.startDate);
      if (body.endDate) params.set('end_date', body.endDate);
      const result = await qbFetch(`/reports/CustomerSales?${params.toString()}`);
      return NextResponse.json({ ok: true, report: result });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
