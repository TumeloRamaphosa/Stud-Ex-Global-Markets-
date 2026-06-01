import { NextRequest, NextResponse } from 'next/server';

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API = `https://${SHOPIFY_STORE}/admin/api/2024-01`;

async function shopifyFetch(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${SHOPIFY_API}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_TOKEN!,
      ...options?.headers,
    },
  });
  return res.json();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const resource = searchParams.get('resource') || 'orders';
  const limit = searchParams.get('limit') || '50';
  const status = searchParams.get('status') || 'any';

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
      return NextResponse.json({ error: `Unknown resource: ${resource}` }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, data } = body;

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
      const result = await shopifyFetch('/orders.json', {
        method: 'POST',
        body: JSON.stringify({ order: data }),
      });
      return NextResponse.json({ ok: true, order: result.order });
    }

    case 'update_order': {
      const result = await shopifyFetch(`/orders/${body.orderId}.json`, {
        method: 'PUT',
        body: JSON.stringify({ order: data }),
      });
      return NextResponse.json({ ok: true, order: result.order });
    }

    case 'fulfill_order': {
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
      const result = await shopifyFetch('/products.json', {
        method: 'POST',
        body: JSON.stringify({ product: data }),
      });
      return NextResponse.json({ ok: true, product: result.product });
    }

    case 'update_product': {
      const result = await shopifyFetch(`/products/${body.productId}.json`, {
        method: 'PUT',
        body: JSON.stringify({ product: data }),
      });
      return NextResponse.json({ ok: true, product: result.product });
    }

    case 'delete_product': {
      await shopifyFetch(`/products/${body.productId}.json`, { method: 'DELETE' });
      return NextResponse.json({ ok: true, deleted: body.productId });
    }

    // Inventory actions
    case 'sync_inventory': {
      const results = [];
      for (const item of (body.items || [])) {
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
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
