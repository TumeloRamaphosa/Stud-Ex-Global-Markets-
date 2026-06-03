import { NextRequest, NextResponse } from 'next/server';

const QB_BASE = 'https://quickbooks.api.intuit.com/v3/company';

let accessToken = '';
let tokenExpiry = 0;

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

async function refreshToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
  const refreshTokenValue = process.env.QUICKBOOKS_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshTokenValue) {
    throw new Error('QuickBooks not configured: QUICKBOOKS_CLIENT_ID, QUICKBOOKS_CLIENT_SECRET, and QUICKBOOKS_REFRESH_TOKEN are required');
  }

  const res = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshTokenValue)}`,
  });

  if (!res.ok) {
    const errorText = await res.text();
    // Reset cached token on failure so next call retries
    accessToken = '';
    tokenExpiry = 0;
    throw new Error(`QuickBooks token refresh failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  if (!data.access_token) {
    accessToken = '';
    tokenExpiry = 0;
    throw new Error(`QuickBooks token refresh returned no access_token: ${JSON.stringify(data)}`);
  }

  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return accessToken;
}

async function qbFetch(endpoint: string, options?: RequestInit) {
  const token = await refreshToken();
  const realmId = process.env.QUICKBOOKS_REALM_ID;
  if (!realmId) {
    throw new Error('QUICKBOOKS_REALM_ID is required');
  }

  const res = await fetch(`${QB_BASE}/${realmId}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    // If 401, invalidate cached token so next call refreshes
    if (res.status === 401) {
      accessToken = '';
      tokenExpiry = 0;
    }
    throw new Error(`QuickBooks API error ${res.status}: ${errorText}`);
  }

  return res.json();
}

/** Sanitize a string for use in QuickBooks query to prevent injection */
function sanitizeQueryString(input: string): string {
  return input.replace(/'/g, "\\'").replace(/[%_]/g, '');
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { action } = body;
  if (!action || typeof action !== 'string') {
    return errorResponse('Missing or invalid "action" field', 400);
  }

  try {
    switch (action) {
      // --- Customer actions ---
      case 'customer_search': {
        if (!body.customerName || typeof body.customerName !== 'string') {
          return errorResponse('Missing required field: customerName', 400);
        }
        const safeName = sanitizeQueryString(body.customerName);
        const query = encodeURIComponent(`SELECT * FROM Customer WHERE DisplayName LIKE '%${safeName}%'`);
        const result = await qbFetch(`/query?query=${query}`);
        const customers = result.QueryResponse?.Customer || [];

        if (customers.length === 0 && body.autoCreate) {
          const newCustomer = await qbFetch('/customer', {
            method: 'POST',
            body: JSON.stringify({
              DisplayName: body.customerName,
              PrimaryEmailAddr: body.email ? { Address: body.email } : undefined,
            }),
          });
          return NextResponse.json({ ok: true, customer: newCustomer.Customer, created: true });
        }

        return NextResponse.json({ ok: true, customers, found: customers.length });
      }

      case 'customer_create': {
        if (!body.displayName) return errorResponse('Missing required field: displayName', 400);
        const address = body.address as Record<string, string> | undefined;
        const result = await qbFetch('/customer', {
          method: 'POST',
          body: JSON.stringify({
            DisplayName: body.displayName,
            PrimaryEmailAddr: body.email ? { Address: body.email } : undefined,
            PrimaryPhone: body.phone ? { FreeFormNumber: body.phone } : undefined,
            BillAddr: address ? {
              Line1: address.line1,
              City: address.city,
              CountrySubDivisionCode: address.state,
              PostalCode: address.postalCode,
              Country: address.country || 'ZA',
            } : undefined,
            Notes: body.notes,
          }),
        });
        return NextResponse.json({ ok: true, customer: result.Customer });
      }

      case 'customer_update': {
        if (!body.customerId || !body.syncToken) {
          return errorResponse('Missing required fields: customerId, syncToken', 400);
        }
        const result = await qbFetch('/customer', {
          method: 'POST',
          body: JSON.stringify({
            Id: body.customerId,
            SyncToken: body.syncToken,
            ...(body.data as Record<string, unknown> || {}),
          }),
        });
        return NextResponse.json({ ok: true, customer: result.Customer });
      }

      case 'customer_list': {
        const limit = Number(body.limit) || 100;
        const offset = Number(body.offset) || 1;
        const query = encodeURIComponent(`SELECT * FROM Customer STARTPOSITION ${offset} MAXRESULTS ${limit}`);
        const result = await qbFetch(`/query?query=${query}`);
        return NextResponse.json({ ok: true, customers: result.QueryResponse?.Customer || [], total: result.QueryResponse?.totalCount });
      }

      // --- Invoice actions ---
      case 'invoice_create': {
        if (!body.customerId) return errorResponse('Missing required field: customerId', 400);
        const items = body.items as Array<{ description?: string; weight: number; cut: string; marbleScore?: string }> | undefined;
        if (!items || !Array.isArray(items) || items.length === 0) {
          return errorResponse('Missing or empty "items" array', 400);
        }
        const VAT_RATE = 15;
        const lines = items.map((item, i: number) => ({
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

        const totalAmount = lines.reduce((sum, l) => sum + l.Amount, 0);
        const invoice = await qbFetch('/invoice', {
          method: 'POST',
          body: JSON.stringify({
            CustomerRef: { value: body.customerId },
            Line: lines,
            TxnTaxDetail: {
              TotalTax: totalAmount * (VAT_RATE / 100),
            },
            BillEmail: body.email ? { Address: body.email } : undefined,
          }),
        });

        return NextResponse.json({ ok: true, invoice: invoice.Invoice });
      }

      case 'invoice_send': {
        if (!body.invoiceId || !body.email) {
          return errorResponse('Missing required fields: invoiceId, email', 400);
        }
        const result = await qbFetch(`/invoice/${body.invoiceId}/send?sendTo=${encodeURIComponent(String(body.email))}`, { method: 'POST' });
        return NextResponse.json({ ok: true, result });
      }

      case 'invoice_pdf': {
        if (!body.invoiceId) return errorResponse('Missing required field: invoiceId', 400);
        const token = await refreshToken();
        const realmId = process.env.QUICKBOOKS_REALM_ID;
        if (!realmId) throw new Error('QUICKBOOKS_REALM_ID is required');
        const res = await fetch(`${QB_BASE}/${realmId}/invoice/${body.invoiceId}/pdf`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/pdf',
          },
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch invoice PDF: ${res.status}`);
        }
        const buffer = await res.arrayBuffer();
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice-${body.invoiceId}.pdf`,
          },
        });
      }

      case 'invoice_list': {
        const limit = Number(body.limit) || 100;
        const offset = Number(body.offset) || 1;
        const query = encodeURIComponent(`SELECT * FROM Invoice STARTPOSITION ${offset} MAXRESULTS ${limit}`);
        const result = await qbFetch(`/query?query=${query}`);
        return NextResponse.json({ ok: true, invoices: result.QueryResponse?.Invoice || [], total: result.QueryResponse?.totalCount });
      }

      case 'invoice_get': {
        if (!body.invoiceId) return errorResponse('Missing required field: invoiceId', 400);
        const result = await qbFetch(`/invoice/${body.invoiceId}`);
        return NextResponse.json({ ok: true, invoice: result.Invoice });
      }

      case 'invoice_void': {
        if (!body.invoiceId) return errorResponse('Missing required field: invoiceId', 400);
        const invoice = await qbFetch(`/invoice/${body.invoiceId}`);
        if (!invoice.Invoice?.SyncToken) {
          throw new Error('Could not retrieve invoice SyncToken for void operation');
        }
        const result = await qbFetch('/invoice?operation=void', {
          method: 'POST',
          body: JSON.stringify({
            Id: body.invoiceId,
            SyncToken: invoice.Invoice.SyncToken,
          }),
        });
        return NextResponse.json({ ok: true, invoice: result.Invoice });
      }

      case 'invoice_update': {
        if (!body.invoiceId || !body.syncToken) {
          return errorResponse('Missing required fields: invoiceId, syncToken', 400);
        }
        const result = await qbFetch('/invoice', {
          method: 'POST',
          body: JSON.stringify({
            Id: body.invoiceId,
            SyncToken: body.syncToken,
            ...(body.data as Record<string, unknown> || {}),
          }),
        });
        return NextResponse.json({ ok: true, invoice: result.Invoice });
      }

      // --- Payment actions ---
      case 'payment_create': {
        if (!body.customerId || !body.amount || !body.invoiceId) {
          return errorResponse('Missing required fields: customerId, amount, invoiceId', 400);
        }
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
        const limit = Number(body.limit) || 100;
        const offset = Number(body.offset) || 1;
        const query = encodeURIComponent(`SELECT * FROM Payment STARTPOSITION ${offset} MAXRESULTS ${limit}`);
        const result = await qbFetch(`/query?query=${query}`);
        return NextResponse.json({ ok: true, payments: result.QueryResponse?.Payment || [], total: result.QueryResponse?.totalCount });
      }

      // --- Estimate actions ---
      case 'estimate_create': {
        if (!body.customerId) return errorResponse('Missing required field: customerId', 400);
        const estItems = body.items as Array<{ description: string; qty: number; unitPrice: number }> | undefined;
        if (!estItems || !Array.isArray(estItems) || estItems.length === 0) {
          return errorResponse('Missing or empty "items" array', 400);
        }
        const lines = estItems.map((item, i: number) => ({
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
        if (!body.estimateId || !body.email) {
          return errorResponse('Missing required fields: estimateId, email', 400);
        }
        const result = await qbFetch(`/estimate/${body.estimateId}/send?sendTo=${encodeURIComponent(String(body.email))}`, { method: 'POST' });
        return NextResponse.json({ ok: true, result });
      }

      // --- Report actions ---
      case 'report_profit_loss': {
        const params = new URLSearchParams();
        if (body.startDate) params.set('start_date', String(body.startDate));
        if (body.endDate) params.set('end_date', String(body.endDate));
        const result = await qbFetch(`/reports/ProfitAndLoss?${params.toString()}`);
        return NextResponse.json({ ok: true, report: result });
      }

      case 'report_balance_sheet': {
        const params = new URLSearchParams();
        if (body.date) params.set('date', String(body.date));
        if (body.startDate) params.set('start_date', String(body.startDate));
        if (body.endDate) params.set('end_date', String(body.endDate));
        const result = await qbFetch(`/reports/BalanceSheet?${params.toString()}`);
        return NextResponse.json({ ok: true, report: result });
      }

      case 'report_sales_by_customer': {
        const params = new URLSearchParams();
        if (body.startDate) params.set('start_date', String(body.startDate));
        if (body.endDate) params.set('end_date', String(body.endDate));
        const result = await qbFetch(`/reports/CustomerSales?${params.toString()}`);
        return NextResponse.json({ ok: true, report: result });
      }

      default:
        return errorResponse(`Unknown action: ${action}`, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'QuickBooks request failed';
    console.error(`[quickbooks/${action}] Error:`, err);
    return errorResponse(message);
  }
}
