"use client";

import { useState, useEffect, useCallback } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface StoreOverview {
  revenue_mtd: number;
  orders_mtd: number;
  currency: string;
  negative_stock_variants: number;
  low_stock_variants: number;
  unfulfilled_paid: number;
  unfulfilled_orders: { order_number: number; total: number; customer: string }[];
}

interface RecentOrder {
  id: number;
  order_number: number;
  created_at: string;
  customer: { first_name: string; last_name: string } | null;
  total_price: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string | null;
  line_items: { title: string; quantity: number }[];
}

interface InventoryAlert {
  product_id: number;
  product_title: string;
  variant_title: string;
  variant_id: number;
  quantity: number;
  level: "critical" | "warning";
}

interface PlatformData {
  instagram: {
    stats: {
      followers: number;
      following: number;
      totalPosts: number;
      totalLikes: number;
      totalComments: number;
      engRate: string;
      reelAvg: number;
      imageAvg: number;
    };
    topPosts: { caption: string; likes: number; comments: number; type: string; permalink: string }[];
    insights: Record<string, number>;
  };
  metaAds: {
    connected: boolean;
    campaigns: { id: string; name: string; status: string; objective: string; dailyBudget: string | null }[];
    insights: {
      impressions: number;
      reach: number;
      clicks: number;
      spend: string;
      cpc: string;
      cpm: string;
      ctr: string;
    } | null;
  };
}

function usePrivacy() {
  const [masked, setMasked] = useState(false);
  const mask = (val: number | string) =>
    masked ? "******" : typeof val === "number" ? `R${val.toLocaleString()}` : val;
  return { masked, toggle: () => setMasked((m) => !m), mask };
}

function DaysBadge({ days }: { days: number }) {
  const color =
    days > 60
      ? "bg-red-100 text-red-700 border-red-300"
      : days > 30
      ? "bg-amber-100 text-amber-700 border-amber-300"
      : "bg-green-100 text-green-700 border-green-300";
  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${color}`}>
      {days}d
    </span>
  );
}

function StatusBadge({ status, type }: { status: string | null; type: "financial" | "fulfillment" }) {
  if (!status) return <span className="text-xs text-gray-400">--</span>;
  const colors: Record<string, string> = {
    paid: "bg-green-100 text-green-700 border-green-300",
    pending: "bg-amber-100 text-amber-700 border-amber-300",
    refunded: "bg-gray-100 text-gray-600 border-gray-300",
    fulfilled: "bg-green-100 text-green-700 border-green-300",
    unfulfilled: "bg-red-100 text-red-700 border-red-300",
    partial: "bg-amber-100 text-amber-700 border-amber-300",
  };
  const key = status.toLowerCase().replace("_", "");
  const color = colors[key] || "bg-gray-100 text-gray-600 border-gray-300";
  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${color}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

async function fetchShopify(action: string, extra: Record<string, any> = {}) {
  const res = await fetch("/api/shopify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...extra }),
  });
  if (!res.ok) throw new Error(`Shopify API error ${res.status}`);
  return res.json();
}

async function fetchPlatformData(): Promise<PlatformData> {
  const res = await fetch("/api/platform-data");
  if (!res.ok) throw new Error(`Platform data error ${res.status}`);
  return res.json();
}

export default function DashboardPage() {
  const { masked, toggle, mask } = usePrivacy();
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "inventory" | "social">("overview");

  const [overview, setOverview] = useState<StoreOverview | null>(null);
  const [overviewError, setOverviewError] = useState(false);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [ordersError, setOrdersError] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [alertsError, setAlertsError] = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const [platform, setPlatform] = useState<PlatformData | null>(null);
  const [platformError, setPlatformError] = useState(false);
  const [platformLoading, setPlatformLoading] = useState(true);

  const [showAllUnfulfilled, setShowAllUnfulfilled] = useState(false);

  const loadData = useCallback(async () => {
    setOverviewLoading(true);
    setOrdersLoading(true);
    setAlertsLoading(true);
    setPlatformLoading(true);

    const overviewPromise = fetchShopify("store_overview")
      .then((data) => { setOverview(data); setOverviewError(false); })
      .catch(() => { setOverviewError(true); })
      .finally(() => setOverviewLoading(false));

    const ordersPromise = fetchShopify("orders_recent", { limit: 10 })
      .then((data) => { setOrders(data.orders || []); setOrdersError(false); })
      .catch(() => { setOrdersError(true); })
      .finally(() => setOrdersLoading(false));

    const alertsPromise = fetchShopify("products_inventory_alerts", { threshold: 10 })
      .then((data) => { setAlerts(data.alerts || []); setAlertsError(false); })
      .catch(() => { setAlertsError(true); })
      .finally(() => setAlertsLoading(false));

    const platformPromise = fetchPlatformData()
      .then((data) => { setPlatform(data); setPlatformError(false); })
      .catch(() => { setPlatformError(true); })
      .finally(() => setPlatformLoading(false));

    await Promise.allSettled([overviewPromise, ordersPromise, alertsPromise, platformPromise]);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const daysAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const customerName = (order: RecentOrder) => {
    if (!order.customer) return "Guest";
    const f = order.customer.first_name || "";
    const l = order.customer.last_name || "";
    return `${f} ${l}`.trim() || "Guest";
  };

  const customerInitials = (order: RecentOrder) => {
    if (!order.customer) return "G";
    const f = order.customer.first_name?.[0] || "";
    const l = order.customer.last_name?.[0] || "";
    return `${f}${l}`.toUpperCase() || "G";
  };

  const criticalAlerts = alerts.filter((a) => a.level === "critical");
  const warningAlerts = alerts.filter((a) => a.level === "warning");

  const oldestUnfulfilled = overview?.unfulfilled_orders?.[overview.unfulfilled_orders.length - 1];
  const totalUnfulfilledValue = overview?.unfulfilled_orders?.reduce((s, o) => s + o.total, 0) || 0;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "Recent Orders" },
    { id: "inventory", label: "Inventory" },
    { id: "social", label: "Social & Ads" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#FFF8F0] font-sans">
      <div className="border-b border-[#D4A017]/20 bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
            STUDEX NEXUS
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">// Command Centre</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-mono">
            {new Date().toLocaleDateString("en-ZA", {
              weekday: "short", day: "numeric", month: "short",
            })} · SAST
          </span>
          <button
            onClick={toggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
              masked
                ? "bg-[#D4A017] text-white border-[#D4A017]"
                : "bg-white text-gray-600 border-gray-300 hover:border-[#D4A017]"
            }`}
          >
            {masked ? "SHOW" : "HIDE"}
          </button>
          <button
            onClick={loadData}
            className="text-xs px-3 py-1.5 rounded-full font-mono border border-gray-300 bg-white text-gray-600 hover:border-[#D4A017] transition-all"
          >
            REFRESH
          </button>
        </div>
      </div>

      <div className="px-6 py-6 max-w-6xl mx-auto space-y-6">
        {!overviewLoading && !overviewError && overview && overview.unfulfilled_paid > 0 && (
          <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-red-600 font-bold text-sm">FULFILLMENT ALERT</span>
                  <span className="bg-red-600 text-white text-xs font-mono px-2 py-0.5 rounded-full">
                    {overview.unfulfilled_paid} UNFULFILLED
                  </span>
                </div>
                <p className="text-sm text-red-700">
                  <span className="font-bold">{overview.unfulfilled_paid} paid orders</span> awaiting fulfillment
                  {totalUnfulfilledValue > 0 && (
                    <> · <span className="font-mono font-bold">{mask(totalUnfulfilledValue)}</span> outstanding</>
                  )}
                  {oldestUnfulfilled && (
                    <> · Oldest: <span className="font-mono">#{oldestUnfulfilled.order_number}</span></>
                  )}
                </p>
              </div>
              <a
                href="https://admin.shopify.com/store/studexmeat/orders?fulfillment_status=unfulfilled&financial_status=paid"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Open Shopify
              </a>
            </div>

            {overview.unfulfilled_orders.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-red-500 font-mono border-b border-red-200">
                      <th className="text-left pb-1 pr-4">Order</th>
                      <th className="text-left pb-1 pr-4">Customer</th>
                      <th className="text-right pb-1">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllUnfulfilled
                      ? overview.unfulfilled_orders
                      : overview.unfulfilled_orders.slice(0, 5)
                    ).map((order) => (
                      <tr key={order.order_number} className="border-b border-red-100 last:border-0">
                        <td className="py-1 pr-4 font-mono text-[#1A1A1A]">#{order.order_number}</td>
                        <td className="py-1 pr-4 text-gray-700">{order.customer}</td>
                        <td className="py-1 text-right font-mono font-semibold text-[#1A1A1A]">
                          {mask(order.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {!showAllUnfulfilled && overview.unfulfilled_orders.length > 5 && (
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="pt-2">
                          <button
                            onClick={() => setShowAllUnfulfilled(true)}
                            className="text-red-600 hover:underline text-xs font-mono"
                          >
                            + {overview.unfulfilled_orders.length - 5} more orders...
                          </button>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 border-b border-[#D4A017]/20 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium whitespace-nowrap transition-all border-b-2 -mb-[2px] text-sm ${
                activeTab === tab.id
                  ? "border-b-[#D4A017] text-[#1A1A1A]"
                  : "border-b-transparent text-gray-400 hover:text-[#1A1A1A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            {overviewLoading ? (
              <LoadingSpinner className="py-12" />
            ) : overviewError ? (
              <div className="bg-white border border-red-200 rounded-xl p-6 text-center">
                <p className="text-sm text-red-600 font-mono">Unable to load store overview</p>
                <button onClick={loadData} className="mt-2 text-xs text-[#D4A017] hover:underline font-mono">
                  Retry
                </button>
              </div>
            ) : overview && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-[#D4A017]/20 rounded-xl p-4">
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">
                      REVENUE MTD
                    </p>
                    <p className="text-2xl font-bold text-[#1A1A1A] font-mono">
                      {mask(overview.revenue_mtd)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date().toLocaleDateString("en-ZA", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="bg-white border border-[#D4A017]/20 rounded-xl p-4">
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">
                      ORDERS MTD
                    </p>
                    <p className="text-2xl font-bold text-[#1A1A1A] font-mono">
                      {overview.orders_mtd}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">This month</p>
                  </div>
                  <div className="bg-white border border-[#D4A017]/20 rounded-xl p-4">
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">
                      UNFULFILLED
                    </p>
                    <p className={`text-2xl font-bold font-mono ${overview.unfulfilled_paid > 0 ? "text-red-600" : "text-green-600"}`}>
                      {overview.unfulfilled_paid}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Paid, waiting</p>
                  </div>
                  <div className="bg-white border border-[#D4A017]/20 rounded-xl p-4">
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">
                      NEGATIVE STOCK
                    </p>
                    <p className={`text-2xl font-bold font-mono ${overview.negative_stock_variants > 0 ? "text-red-600" : "text-green-600"}`}>
                      {overview.negative_stock_variants}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Variants overselling</p>
                  </div>
                </div>

                {alertsLoading ? (
                  <LoadingSpinner className="py-8" size="sm" />
                ) : alertsError ? (
                  <div className="bg-white border border-red-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-red-600 font-mono">Unable to load inventory alerts</p>
                  </div>
                ) : alerts.length > 0 && (
                  <div className="bg-white border border-amber-300 rounded-xl p-4">
                    <h2 className="text-sm font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                      INVENTORY ALERTS
                      <span className="text-xs font-mono bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-300">
                        {criticalAlerts.length} overselling · {warningAlerts.length} low
                      </span>
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {alerts.slice(0, 8).map((item) => (
                        <div
                          key={`${item.product_id}-${item.variant_id}`}
                          className={`rounded-lg p-2.5 border ${
                            item.level === "critical"
                              ? "bg-red-50 border-red-200"
                              : "bg-amber-50 border-amber-200"
                          }`}
                        >
                          <p className="text-xs text-gray-700 leading-tight mb-1">
                            {item.product_title}
                            {item.variant_title && item.variant_title !== "Default Title" && (
                              <span className="text-gray-400"> · {item.variant_title}</span>
                            )}
                          </p>
                          <p className={`text-lg font-mono font-bold ${
                            item.quantity < 0 ? "text-red-600" : "text-amber-600"
                          }`}>
                            {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono uppercase">
                            {item.level === "critical" ? "Overselling" : "Low stock"}
                          </p>
                        </div>
                      ))}
                    </div>
                    {alerts.length > 8 && (
                      <p className="text-xs text-gray-500 mt-3 font-mono">
                        + {alerts.length - 8} more alerts — see Inventory tab
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="bg-white border border-[#D4A017]/20 rounded-xl p-4">
              <h2 className="text-sm font-bold text-[#1A1A1A] mb-3">QUICK ACTIONS</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "View All Orders", href: "https://admin.shopify.com/store/studexmeat/orders" },
                  { label: "Refresh Facebook Token", href: "https://developers.facebook.com/tools/explorer" },
                  { label: "Google Ads", href: "https://ads.google.com/aw/campaigns?customerId=2234319068" },
                  { label: "GA4 Analytics", href: "https://analytics.google.com/analytics/web/#/p295728486/reports" },
                  { label: "Shopify Admin", href: "https://admin.shopify.com/store/studexmeat" },
                ].map((action) => (
                  <a
                    key={action.label}
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-2 bg-[#FFF8F0] hover:bg-[#D4A017]/10 border border-[#D4A017]/30 hover:border-[#D4A017] text-[#1A1A1A] rounded-lg transition-all font-mono"
                  >
                    {action.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-4">
            {ordersLoading ? (
              <LoadingSpinner className="py-12" />
            ) : ordersError ? (
              <div className="bg-white border border-red-200 rounded-xl p-6 text-center">
                <p className="text-sm text-red-600 font-mono">Unable to load recent orders</p>
                <button onClick={loadData} className="mt-2 text-xs text-[#D4A017] hover:underline font-mono">
                  Retry
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white border border-[#D4A017]/20 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-500 font-mono">No recent orders</p>
              </div>
            ) : (
              <div className="bg-white border border-[#D4A017]/20 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] font-mono text-gray-400 uppercase tracking-widest border-b border-[#D4A017]/10">
                        <th className="text-left px-4 py-3">Order</th>
                        <th className="text-left px-4 py-3">Customer</th>
                        <th className="text-left px-4 py-3">Items</th>
                        <th className="text-right px-4 py-3">Total</th>
                        <th className="text-center px-4 py-3">Payment</th>
                        <th className="text-center px-4 py-3">Fulfillment</th>
                        <th className="text-right px-4 py-3">Age</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-[#D4A017]/5 last:border-0 hover:bg-[#FFF8F0]/50">
                          <td className="px-4 py-3 font-mono text-[#1A1A1A] font-semibold">
                            #{order.order_number}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-full bg-[#D4A017]/10 text-[#D4A017] text-xs font-bold flex items-center justify-center">
                                {customerInitials(order)}
                              </span>
                              <span className="text-xs">{customerName(order)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {order.line_items?.slice(0, 2).map((li) => li.title).join(", ")}
                            {order.line_items?.length > 2 && ` +${order.line_items.length - 2}`}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-[#1A1A1A]">
                            {mask(parseFloat(order.total_price))}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <StatusBadge status={order.financial_status} type="financial" />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <StatusBadge status={order.fulfillment_status || "unfulfilled"} type="fulfillment" />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DaysBadge days={daysAgo(order.created_at)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="space-y-4">
            {alertsLoading ? (
              <LoadingSpinner className="py-12" />
            ) : alertsError ? (
              <div className="bg-white border border-red-200 rounded-xl p-6 text-center">
                <p className="text-sm text-red-600 font-mono">Unable to load inventory alerts</p>
                <button onClick={loadData} className="mt-2 text-xs text-[#D4A017] hover:underline font-mono">
                  Retry
                </button>
              </div>
            ) : alerts.length === 0 ? (
              <div className="bg-white border border-green-200 rounded-xl p-6 text-center">
                <p className="text-sm text-green-600 font-mono">All inventory levels healthy</p>
              </div>
            ) : (
              <>
                <div className="flex gap-3">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex-1">
                    <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest mb-1">CRITICAL (Negative)</p>
                    <p className="text-2xl font-bold text-red-600 font-mono">{criticalAlerts.length}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex-1">
                    <p className="text-[10px] font-mono text-amber-400 uppercase tracking-widest mb-1">LOW STOCK</p>
                    <p className="text-2xl font-bold text-amber-600 font-mono">{warningAlerts.length}</p>
                  </div>
                </div>

                <div className="bg-white border border-[#D4A017]/20 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[10px] font-mono text-gray-400 uppercase tracking-widest border-b border-[#D4A017]/10">
                          <th className="text-left px-4 py-3">Product</th>
                          <th className="text-left px-4 py-3">Variant</th>
                          <th className="text-right px-4 py-3">Quantity</th>
                          <th className="text-center px-4 py-3">Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alerts.map((alert) => (
                          <tr key={`${alert.product_id}-${alert.variant_id}`} className="border-b border-[#D4A017]/5 last:border-0">
                            <td className="px-4 py-3 text-[#1A1A1A] font-medium text-xs">{alert.product_title}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">
                              {alert.variant_title === "Default Title" ? "--" : alert.variant_title}
                            </td>
                            <td className={`px-4 py-3 text-right font-mono font-bold ${
                              alert.quantity < 0 ? "text-red-600" : "text-amber-600"
                            }`}>
                              {alert.quantity}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                                alert.level === "critical"
                                  ? "bg-red-100 text-red-700 border-red-300"
                                  : "bg-amber-100 text-amber-700 border-amber-300"
                              }`}>
                                {alert.level}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="text-xs text-gray-500 font-mono px-1">
                  Fix overselling: Shopify Admin → Product → Inventory → uncheck &quot;Continue selling when out of stock&quot;
                </p>
              </>
            )}
          </div>
        )}

        {activeTab === "social" && (
          <div className="space-y-6">
            {platformLoading ? (
              <LoadingSpinner className="py-12" />
            ) : platformError ? (
              <div className="bg-white border border-red-200 rounded-xl p-6 text-center">
                <p className="text-sm text-red-600 font-mono">Unable to load social data</p>
                <button onClick={loadData} className="mt-2 text-xs text-[#D4A017] hover:underline font-mono">
                  Retry
                </button>
              </div>
            ) : platform && (
              <>
                <div className="bg-white border border-[#D4A017]/20 rounded-xl p-4">
                  <h2 className="text-sm font-bold text-[#1A1A1A] mb-3">INSTAGRAM</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {[
                      { label: "FOLLOWERS", value: platform.instagram.stats.followers.toLocaleString() },
                      { label: "POSTS", value: platform.instagram.stats.totalPosts.toLocaleString() },
                      { label: "ENG. RATE", value: `${platform.instagram.stats.engRate}%` },
                      { label: "TOTAL LIKES", value: platform.instagram.stats.totalLikes.toLocaleString() },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-xl font-bold text-[#1A1A1A] font-mono">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {platform.instagram.topPosts.length > 0 && (
                    <>
                      <h3 className="text-xs font-bold text-gray-500 mb-2 font-mono uppercase">Top Posts</h3>
                      <div className="space-y-2">
                        {platform.instagram.topPosts.slice(0, 3).map((post, i) => (
                          <div key={i} className="flex items-center justify-between bg-[#FFF8F0] rounded-lg p-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-700 truncate">{post.caption || "No caption"}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{post.type}</p>
                            </div>
                            <div className="flex gap-3 ml-3 text-xs font-mono text-gray-600">
                              <span>{post.likes} likes</span>
                              <span>{post.comments} comments</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-white border border-[#D4A017]/20 rounded-xl p-4">
                  <h2 className="text-sm font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                    META ADS
                    {!platform.metaAds.connected && (
                      <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                        Not connected
                      </span>
                    )}
                  </h2>
                  {platform.metaAds.connected && platform.metaAds.insights ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {[
                          { label: "IMPRESSIONS", value: platform.metaAds.insights.impressions.toLocaleString() },
                          { label: "REACH", value: platform.metaAds.insights.reach.toLocaleString() },
                          { label: "CLICKS", value: platform.metaAds.insights.clicks.toLocaleString() },
                          { label: "SPEND", value: mask(parseFloat(platform.metaAds.insights.spend)) },
                        ].map((stat) => (
                          <div key={stat.label}>
                            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-xl font-bold text-[#1A1A1A] font-mono">{stat.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">CPC</p>
                          <p className="text-sm font-mono text-[#1A1A1A]">R{platform.metaAds.insights.cpc}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">CPM</p>
                          <p className="text-sm font-mono text-[#1A1A1A]">R{platform.metaAds.insights.cpm}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">CTR</p>
                          <p className="text-sm font-mono text-[#1A1A1A]">{platform.metaAds.insights.ctr}%</p>
                        </div>
                      </div>
                    </>
                  ) : platform.metaAds.connected ? (
                    <p className="text-sm text-gray-500 font-mono">No ad insights available</p>
                  ) : (
                    <p className="text-sm text-gray-500 font-mono">
                      Connect your Meta Ads account to see campaign data
                    </p>
                  )}

                  {platform.metaAds.campaigns.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-xs font-bold text-gray-500 mb-2 font-mono uppercase">Campaigns</h3>
                      <div className="space-y-2">
                        {platform.metaAds.campaigns.slice(0, 5).map((campaign) => (
                          <div key={campaign.id} className="flex items-center justify-between bg-[#FFF8F0] rounded-lg p-3">
                            <div>
                              <p className="text-xs text-[#1A1A1A] font-medium">{campaign.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{campaign.objective}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {campaign.dailyBudget && (
                                <span className="text-xs font-mono text-gray-500">
                                  {mask(parseFloat(campaign.dailyBudget))}/day
                                </span>
                              )}
                              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                                campaign.status === "ACTIVE"
                                  ? "bg-green-100 text-green-700 border-green-300"
                                  : "bg-gray-100 text-gray-500 border-gray-300"
                              }`}>
                                {campaign.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
