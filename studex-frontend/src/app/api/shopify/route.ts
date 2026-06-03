import { NextRequest, NextResponse } from 'next/server';

const SHOPIFY_API_VERSION = '2024-10';

function getShopifyConfig() {
  const store = process.env.SHOPIFY_STORE;
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  if (!store || !token) {
    return null;
  }
  return { store, token, baseUrl: `https://${store}/admin/api/${SHOPIFY_API_VERSION}` };
}

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

async function shopifyFetch(endpoint: string, options?: RequestInit) {
  const config = getShopifyConfig();
  if (!config) {
    throw new Error('Shopify not configured: SHOPIFY_STORE and SHOPIFY_ACCESS_TOKEN are required');
  }
  const res = await fetch(`${config.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': config.token,
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Shopify API error ${res.status}: ${errorText}`);
  }
  return res.json();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const resource = searchParams.get('resource') || 'orders';
  const limit = searchParams.get('limit') || '50';
  const status = searchParams.get('status') || 'any';

  try {
    switch (resource) {
      case 'orders':
        return NextResponse.json(await shopifyFetch(`/orders.json?limit=${limit}&status=${status}`));
      case 'products':
        return NextResponse.json(await shopifyFetch(`/products.json?limit=${limit}`));
      case 'customers':
        return NextResponse.json(await shopifyFetch(`/customers.json?limit=${limit}`));
      case 'inventory':
        return NextResponse.json(await shopifyFetch(`/inventory_levels.json?limit=${limit}`));
      default:
        return errorResponse(`Unknown resource: ${resource}`, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Shopify GET failed';
    console.error(`[shopify/GET] Error:`, err);
    return errorResponse(message);
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { action, data } = body as { action?: string; data?: Record<string, unknown> };
  if (!action || typeof action !== 'string') {
    return errorResponse('Missing or invalid "action" field', 400);
  }

  try {
    switch (action) {
      // Legacy resource-based routing
      case 'orders':
        return NextResponse.json(await shopifyFetch('/orders.json', { method: 'POST', body: JSON.stringify({ order: data }) }));
      case 'products':
        return NextResponse.json(await shopifyFetch('/products.json', { method: 'POST', body: JSON.stringify({ product: data }) }));
      case 'customers':
        return NextResponse.json(await shopifyFetch('/customers.json', { method: 'POST', body: JSON.stringify({ customer: data }) }));

      // Order actions
      case 'create_order': {
        if (!data) return errorResponse('Missing "data" for order creation', 400);
        const result = await shopifyFetch('/orders.json', {
          method: 'POST',
          body: JSON.stringify({ order: data }),
        });
        return NextResponse.json({ ok: true, order: result.order });
      }

      case 'update_order': {
        if (!body.orderId) return errorResponse('Missing "orderId"', 400);
        const result = await shopifyFetch(`/orders/${body.orderId}.json`, {
          method: 'PUT',
          body: JSON.stringify({ order: data }),
        });
        return NextResponse.json({ ok: true, order: result.order });
      }

      case 'fulfill_order': {
        if (!body.orderId) return errorResponse('Missing "orderId"', 400);
        const result = await shopifyFetch(`/orders/${body.orderId}/fulfillments.json`, {
          method: 'POST',
          body: JSON.stringify({
            fulfillment: {
              location_id: body.locationId,
              tracking_number: body.trackingNumber,
              tracking_company: body.trackingCompany,
              line_items: body.lineItems,
            },
          }),
        });
        return NextResponse.json({ ok: true, fulfillment: result.fulfillment });
      }

      case 'cancel_order': {
        if (!body.orderId) return errorResponse('Missing "orderId"', 400);
        const result = await shopifyFetch(`/orders/${body.orderId}/cancel.json`, {
          method: 'POST',
          body: JSON.stringify({
            reason: body.reason || 'other',
            email: body.notifyCustomer ?? true,
            restock: body.restock ?? true,
          }),
        });
        return NextResponse.json({ ok: true, order: result.order });
      }

      // Product actions
      case 'create_product': {
        if (!data) return errorResponse('Missing "data" for product creation', 400);
        const result = await shopifyFetch('/products.json', {
          method: 'POST',
          body: JSON.stringify({ product: data }),
        });
        return NextResponse.json({ ok: true, product: result.product });
      }

      case 'update_product': {
        if (!body.productId) return errorResponse('Missing "productId"', 400);
        const result = await shopifyFetch(`/products/${body.productId}.json`, {
          method: 'PUT',
          body: JSON.stringify({ product: data }),
        });
        return NextResponse.json({ ok: true, product: result.product });
      }

      case 'delete_product': {
        if (!body.productId) return errorResponse('Missing "productId"', 400);
        await shopifyFetch(`/products/${body.productId}.json`, { method: 'DELETE' });
        return NextResponse.json({ ok: true, deleted: body.productId });
      }

      // Inventory actions
      case 'sync_inventory': {
        const items = body.items as Array<{ locationId: string; inventoryItemId: string; available: number }> | undefined;
        if (!items || !Array.isArray(items)) return errorResponse('Missing "items" array', 400);
        const results = [];
        for (const item of items) {
          const result = await shopifyFetch('/inventory_levels/set.json', {
            method: 'POST',
            body: JSON.stringify({
              location_id: item.locationId,
              inventory_item_id: item.inventoryItemId,
              available: item.available,
            }),
          });
          results.push(result);
        }
        return NextResponse.json({ ok: true, results, synced: results.length });
      }

      default:
        return errorResponse(`Unknown action: ${action}`, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Shopify POST failed';
    console.error(`[shopify/${action}] Error:`, err);
    return errorResponse(message);
  }
}
