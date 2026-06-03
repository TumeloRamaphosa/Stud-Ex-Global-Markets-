import "./env.js";

const shopifyStore = process.env.SHOPIFY_STORE || "";
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN || "";

function buildShopifyUrl(pathname: string, search: Record<string, string>) {
  const url = new URL(`https://${shopifyStore}/admin/api/2024-01/${pathname}`);
  Object.entries(search).forEach(([key, value]) => url.searchParams.set(key, value));
  return url;
}

async function shopifyFetch<T>(pathname: string, search: Record<string, string>) {
  if (!shopifyStore || !accessToken) {
    throw new Error("Shopify credentials are not configured.");
  }

  const response = await fetch(buildShopifyUrl(pathname, search), {
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
  });

  if (!response.ok) {
    throw new Error(`Shopify request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

function getTodayMidnightSastIso() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [year, month, day] = formatter.format(now).split("-");
  return `${year}-${month}-${day}T00:00:00+02:00`;
}

type ShopifyOrder = {
  total_price: string;
  fulfillment_status?: string | null;
  line_items?: Array<{ name?: string; quantity?: number }>;
};

type ShopifyOrdersResponse = { orders: ShopifyOrder[] };

export async function fetchOrdersToday() {
  return shopifyFetch<ShopifyOrdersResponse>("orders.json", {
    status: "any",
    created_at_min: getTodayMidnightSastIso(),
  });
}

export async function fetchInventory() {
  return shopifyFetch<{ inventory_levels: unknown[] }>("inventory_levels.json", {});
}

export async function getAnalyticsFromShopify() {
  const response = await fetchOrdersToday();
  const orders = response.orders || [];

  const revenue = orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0);
  const pendingFulfilment = orders.filter((order) => !order.fulfillment_status).length;

  const productCounts = new Map<string, number>();
  orders.forEach((order) =>
    order.line_items?.forEach((item) => {
      const name = item.name || "Unknown Product";
      productCounts.set(name, (productCounts.get(name) || 0) + (item.quantity || 0));
    }),
  );

  const topProduct =
    [...productCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "Wagyu Burger Patties";

  return {
    orders,
    revenue,
    ordersToday: orders.length,
    pendingFulfilment,
    topProduct,
  };
}
