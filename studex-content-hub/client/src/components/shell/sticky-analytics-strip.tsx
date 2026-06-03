import { useEffect, useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { api } from "@/lib/api";
import type { AnalyticsSnapshot } from "@/lib/types";
import { usePrivacy } from "@/providers/privacy-provider";

function formatCurrency(value: number, masked: boolean) {
  if (masked) return "••••••";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number, masked: boolean) {
  if (masked) return "••••••";
  return new Intl.NumberFormat("en-ZA").format(value);
}

export function StickyAnalyticsStrip() {
  const { isMasked, toggleMasked } = usePrivacy();
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .getAnalytics()
      .then((data) => {
        if (active) setAnalytics(data);
      })
      .catch(() => {
        if (active) setAnalytics(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const data =
    analytics ??
    ({
      todaysRevenue: 3240,
      ordersToday: 4,
      pendingFulfilment: 2,
      topProduct: "Wagyu Burger Patties",
      facebookReach7d: 1204,
      instagramEngagement: 6.2,
      gaSessions7d: null,
      gaConversions7d: null,
      metaTokenExpiresAt: "2026-08-04",
      sources: { shopify: "demo", meta: "demo", ga4: "demo" },
    } satisfies AnalyticsSnapshot);

  return (
    <section className="kpi-strip">
      <div className="kpi-strip-header">
        <div>
          <span className="mini-label">Analytics Strip</span>
          <p className="kpi-strip-copy">Live where available, graceful fallback where not.</p>
        </div>
        <button type="button" className="privacy-toggle" onClick={toggleMasked}>
          {isMasked ? <Eye size={16} /> : <EyeOff size={16} />}
          {isMasked ? "Show numbers" : "Mask numbers"}
        </button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="mini-label">Today's Revenue</span>
          <strong>{formatCurrency(data.todaysRevenue, isMasked)}</strong>
          <small>{data.sources.shopify}</small>
        </div>
        <div className="kpi-card">
          <span className="mini-label">Orders Today</span>
          <strong>{formatNumber(data.ordersToday, isMasked)}</strong>
          <small>{data.sources.shopify}</small>
        </div>
        <div className="kpi-card">
          <span className="mini-label">Pending Fulfilment</span>
          <strong>{formatNumber(data.pendingFulfilment, isMasked)}</strong>
          <small>{data.sources.shopify}</small>
        </div>
        <div className="kpi-card">
          <span className="mini-label">Top Product</span>
          <strong>{data.topProduct}</strong>
          <small>catalog</small>
        </div>
        <div className="kpi-card">
          <span className="mini-label">Facebook Reach (7d)</span>
          <strong>{loading ? <LoaderCircle className="spin" size={16} /> : formatNumber(data.facebookReach7d, false)}</strong>
          <small>{data.sources.meta}</small>
        </div>
        <div className="kpi-card">
          <span className="mini-label">Instagram Engagement</span>
          <strong>{loading ? <LoaderCircle className="spin" size={16} /> : `${data.instagramEngagement}%`}</strong>
          <small>{data.sources.meta}</small>
        </div>
      </div>
    </section>
  );
}
