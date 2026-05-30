import { NextResponse } from 'next/server';

// ─── StudEx Meat — Shopify Admin API Route ────────────────────────────────────
// Store: studexmeat.myshopify.com
// Orchestrated by: Perplexity Computer
// Built by: Claude Code (Stud-Ex-Global-Markets / claude/instagram-analytics-prd-qSt5w)
//
// ENV VARS REQUIRED:
//   SHOPIFY_ACCESS_TOKEN  — shpat_... token from Shopify admin
//   SHOPIFY_STORE_DOMAIN  — studexmeat.myshopify.com
// ─────────────────────────────────────────────────────────────────────────────

const SHOPIFY_STORE  = process.env.SHOPIFY_STORE_DOMAIN || 'studexmeat.myshopify.com';
const ACCESS_TOKEN   = process.env.SHOPIFY_ACCESS_TOKEN || '';
const API_VERSION    = '2024-01';
const BASE           = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}`;

const shopifyHeaders = {
  'X-Shopify-Access-Token': ACCESS_TOKEN,
  'Content-Type': 'application/json',
};

async function shopifyFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...shopifyHeaders, ...(options?.headers || {}) },
    next: { revalidate: 300 }, // 5-min cache
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Shopify API error ${res.status}: ${err}`);
  }
  return res.json();
}

export async function POST(req: Request) {
  const body = await req.json();
  const { action } = body;

  if (!ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'SHOPIFY_ACCESS_TOKEN not configured' },
      { status: 400 }
    );
  }

  try {
    // ─── ORDERS ──────────────────────────────────────────────────────────────

    if (action === 'orders_recent') {
      // Last N orders with customer, total, status
      const limit  = body.limit  || 20;
      const status = body.status || 'any'; // any | open | closed | cancelled
      const data   = await shopifyFetch(
        `/orders.json?limit=${limit}&status=${status}&fields=id,order_number,created_at,financial_status,fulfillment_status,total_price,currency,customer,line_items`
      );
      return NextResponse.json({ orders: data.orders || [] });
    }

    if (action === 'orders_count') {
      const data = await shopifyFetch(`/orders/count.json?status=any`);
      return NextResponse.json({ count: data.count });
    }

    if (action === 'orders_revenue_mtd') {
      // Month-to-date revenue — first day of current month to now
      const now        = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const data       = await shopifyFetch(
        `/orders.json?status=any&financial_status=paid&created_at_min=${firstOfMonth}&limit=250&fields=id,total_price,created_at`
      );
      const orders = data.orders || [];
      const revenue = orders.reduce((sum: number, o: any) => sum + parseFloat(o.total_price), 0);
      return NextResponse.json({
        revenue_mtd: revenue,
        order_count_mtd: orders.length,
        currency: 'ZAR',
        period_start: firstOfMonth,
      });
    }

    if (action === 'orders_unfulfilled') {
      // All paid but unfulfilled orders — critical action items
      const data = await shopifyFetch(
        `/orders.json?status=open&fulfillment_status=unfulfilled&financial_status=paid&limit=50&fields=id,order_number,created_at,total_price,customer,line_items`
      );
      return NextResponse.json({ unfulfilled: data.orders || [] });
    }

    if (action === 'orders_daily_revenue') {
      // Daily revenue for last 30 days (for sparkline chart)
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const data  = await shopifyFetch(
        `/orders.json?status=any&financial_status=paid&created_at_min=${since}&limit=250&fields=id,total_price,created_at`
      );
      // Bucket by date
      const byDate: Record<string, number> = {};
      for (const o of (data.orders || [])) {
        const date = o.created_at.slice(0, 10);
        byDate[date] = (byDate[date] || 0) + parseFloat(o.total_price);
      }
      const series = Object.entries(byDate)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));
      return NextResponse.json({ daily_revenue: series });
    }

    // ─── PRODUCTS & INVENTORY ─────────────────────────────────────────────────

    if (action === 'products_all') {
      const data = await shopifyFetch(
        `/products.json?limit=250&fields=id,title,status,variants,image`
      );
      return NextResponse.json({ products: data.products || [] });
    }

    if (action === 'products_inventory_alerts') {
      // Products with stock < threshold (default 10) or negative
      const threshold = body.threshold ?? 10;
      const data      = await shopifyFetch(
        `/products.json?limit=250&fields=id,title,status,variants`
      );
      const alerts = (data.products || [])
        .filter((p: any) => p.status === 'active')
        .flatMap((p: any) =>
          (p.variants || [])
            .filter((v: any) => v.inventory_quantity < threshold)
            .map((v: any) => ({
              product_id:    p.id,
              product_title: p.title,
              variant_title: v.title,
              variant_id:    v.id,
              quantity:      v.inventory_quantity,
              level:         v.inventory_quantity < 0 ? 'critical' : 'warning',
            }))
        )
        .sort((a: any, b: any) => a.quantity - b.quantity);
      return NextResponse.json({ alerts, threshold });
    }

    if (action === 'products_top_revenue') {
      // Revenue per product — joins orders + line_items
      const since = body.since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const data  = await shopifyFetch(
        `/orders.json?status=any&financial_status=paid&created_at_min=${since}&limit=250&fields=line_items`
      );
      const revenueMap: Record<string, { title: string; revenue: number; units: number }> = {};
      for (const order of (data.orders || [])) {
        for (const item of (order.line_items || [])) {
          if (!revenueMap[item.product_id]) {
            revenueMap[item.product_id] = { title: item.title, revenue: 0, units: 0 };
          }
          revenueMap[item.product_id].revenue += parseFloat(item.price) * item.quantity;
          revenueMap[item.product_id].units   += item.quantity;
        }
      }
      const top = Object.entries(revenueMap)
        .map(([id, v]) => ({ product_id: id, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, body.limit || 10);
      return NextResponse.json({ top_products: top });
    }

    // ─── CUSTOMERS ───────────────────────────────────────────────────────────

    if (action === 'customers_stats') {
      const [countData, ordersData] = await Promise.all([
        shopifyFetch(`/customers/count.json`),
        shopifyFetch(`/orders.json?status=any&financial_status=paid&limit=250&fields=customer,total_price`),
      ]);
      const orders = ordersData.orders || [];
      const totalRevenue = orders.reduce((s: number, o: any) => s + parseFloat(o.total_price), 0);
      const aov = orders.length ? totalRevenue / orders.length : 0;

      // Repeat customers (more than 1 order)
      const customerOrderCount: Record<string, number> = {};
      for (const o of orders) {
        if (o.customer?.id) {
          customerOrderCount[o.customer.id] = (customerOrderCount[o.customer.id] || 0) + 1;
        }
      }
      const repeatCustomers = Object.values(customerOrderCount).filter((c) => c > 1).length;

      return NextResponse.json({
        total_customers: countData.count,
        total_orders: orders.length,
        avg_order_value: Math.round(aov * 100) / 100,
        repeat_customers: repeatCustomers,
        repeat_rate: countData.count ? Math.round((repeatCustomers / countData.count) * 100) : 0,
        currency: 'ZAR',
      });
    }

    if (action === 'customers_top') {
      // Top customers by lifetime spend
      const data = await shopifyFetch(
        `/customers.json?limit=50&fields=id,first_name,last_name,email,orders_count,total_spent`
      );
      const top = (data.customers || [])
        .sort((a: any, b: any) => parseFloat(b.total_spent) - parseFloat(a.total_spent))
        .slice(0, body.limit || 10)
        .map((c: any) => ({
          id:           c.id,
          initials:     `${c.first_name?.[0] || '?'}${c.last_name?.[0] || '?'}`.toUpperCase(),
          orders_count: c.orders_count,
          total_spent:  parseFloat(c.total_spent),
        }));
      return NextResponse.json({ top_customers: top });
    }

    // ─── DISCOUNTS ────────────────────────────────────────────────────────────

    if (action === 'discount_create') {
      // Create a percentage discount code
      // body: { code, percentage, min_purchase?, usage_limit?, ends_at? }
      const priceRule = await shopifyFetch(`/price_rules.json`, {
        method: 'POST',
        body: JSON.stringify({
          price_rule: {
            title:               body.code,
            target_type:         'line_item',
            target_selection:    'all',
            allocation_method:   'across',
            value_type:          'percentage',
            value:               `-${body.percentage}`,
            customer_selection:  'all',
            starts_at:           new Date().toISOString(),
            ends_at:             body.ends_at || null,
            usage_limit:         body.usage_limit || null,
            once_per_customer:   body.once_per_customer || false,
            prerequisite_subtotal_range: body.min_purchase
              ? { greater_than_or_equal_to: String(body.min_purchase) }
              : undefined,
          },
        }),
      });
      const ruleId = priceRule.price_rule?.id;
      if (!ruleId) throw new Error('Failed to create price rule');

      const discountCode = await shopifyFetch(`/price_rules/${ruleId}/discount_codes.json`, {
        method: 'POST',
        body: JSON.stringify({ discount_code: { code: body.code } }),
      });
      return NextResponse.json({
        success: true,
        price_rule_id: ruleId,
        discount_code: discountCode.discount_code,
      });
    }

    // ─── STORE HEALTH ─────────────────────────────────────────────────────────

    if (action === 'store_overview') {
      // Single call: orders MTD + count + inventory alerts — for dashboard Overview
      const now         = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const since30     = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [mtdData, productsData, unfulfilledData] = await Promise.all([
        shopifyFetch(`/orders.json?status=any&financial_status=paid&created_at_min=${firstOfMonth}&limit=250&fields=id,total_price`),
        shopifyFetch(`/products.json?limit=250&fields=id,title,status,variants`),
        shopifyFetch(`/orders.json?status=open&fulfillment_status=unfulfilled&financial_status=paid&limit=10&fields=id,order_number,total_price,customer`),
      ]);

      const mtdOrders  = mtdData.orders || [];
      const revenue    = mtdOrders.reduce((s: number, o: any) => s + parseFloat(o.total_price), 0);
      const products   = productsData.products || [];
      const negStock   = products.flatMap((p: any) =>
        (p.variants || []).filter((v: any) => v.inventory_quantity < 0)
      ).length;
      const lowStock   = products.flatMap((p: any) =>
        (p.variants || []).filter((v: any) => v.inventory_quantity >= 0 && v.inventory_quantity < 10)
      ).length;

      return NextResponse.json({
        revenue_mtd:        Math.round(revenue * 100) / 100,
        orders_mtd:         mtdOrders.length,
        currency:           'ZAR',
        negative_stock_variants: negStock,
        low_stock_variants: lowStock,
        unfulfilled_paid:   (unfulfilledData.orders || []).length,
        unfulfilled_orders: (unfulfilledData.orders || []).map((o: any) => ({
          order_number: o.order_number,
          total:        parseFloat(o.total_price),
          customer:     o.customer
            ? `${o.customer.first_name?.[0] || '?'}${o.customer.last_name?.[0] || '?'}`.toUpperCase()
            : 'Guest',
        })),
      });
    }

    return NextResponse.json(
      {
        error: 'Unknown action.',
        available: [
          'orders_recent',
          'orders_count',
          'orders_revenue_mtd',
          'orders_unfulfilled',
          'orders_daily_revenue',
          'products_all',
          'products_inventory_alerts',
          'products_top_revenue',
          'customers_stats',
          'customers_top',
          'discount_create',
          'store_overview',
        ],
      },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
