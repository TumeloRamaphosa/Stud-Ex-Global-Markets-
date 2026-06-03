import { useEffect, useMemo, useState } from "react";
import { Calendar, CalendarDays, Download, Facebook, Instagram, LoaderCircle, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { AdPlan, CalendarEvent, ContentItem } from "@/lib/types";
import { useToast } from "@/providers/toast-provider";

type ComposerState = Omit<AdPlan, "id">;

const initialPlan: ComposerState = {
  name: "",
  objective: "Awareness",
  audience: "",
  budget_zar: 0,
  start_date: "2026-06-05",
  end_date: "2026-06-16",
  status: "draft",
  content_item_id: 1,
};

export function ContentWorkspace() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const { pushToast } = useToast();

  useEffect(() => {
    let active = true;
    api
      .getContent()
      .then((data) => {
        if (active) setItems(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateItem = (next: ContentItem) =>
    setItems((current) => current.map((item) => (item.id === next.id ? next : item)));

  async function setStatus(item: ContentItem, status: ContentItem["status"]) {
    setBusyId(item.id);
    try {
      const next = await api.updateContentStatus(item.id, status);
      updateItem(next);
      pushToast({
        title: `Content ${status}`,
        description: `${item.title} is now marked ${status}.`,
      });
    } catch (error) {
      pushToast({
        title: "Status update failed",
        description: error instanceof Error ? error.message : "Unknown error",
        tone: "muted",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function post(item: ContentItem, platform: "facebook" | "instagram") {
    setBusyId(item.id);
    try {
      const assetUrl = new URL(item.file_path, window.location.origin).toString();
      const result =
        platform === "facebook"
          ? await api.postToFacebook(item, assetUrl)
          : await api.postToInstagram(item, assetUrl);
      updateItem(result.item);
      pushToast({
        title: `Posted to ${platform}`,
        description: `${item.title} was posted successfully.`,
      });
    } catch (error) {
      pushToast({
        title: `Post to ${platform} failed`,
        description: error instanceof Error ? error.message : "Unknown error",
        tone: "muted",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="workspace-stack">
      <Card className="workspace-header-card">
        <div>
          <span className="section-eyebrow">Content Carousel</span>
          <h2 className="section-title">Generated assets ready for approval and direct posting</h2>
          <p className="section-copy">
            Approve or reject each asset, then publish directly to Facebook or Instagram from the same workspace.
          </p>
        </div>
        <a className="button-root button-secondary button-sm yaml-link" href="/api/content/export.yaml" target="_blank" rel="noreferrer">
          <Download size={16} />
          Export YAML
        </a>
      </Card>

      <div className="asset-carousel">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card className="asset-card" key={index}>
                <Skeleton className="asset-preview-skeleton" />
                <Skeleton className="asset-line-skeleton" />
                <Skeleton className="asset-line-skeleton short" />
              </Card>
            ))
          : items.map((item) => (
              <AssetCard
                key={item.id}
                item={item}
                busy={busyId === item.id}
                onApprove={() => setStatus(item, "approved")}
                onReject={() => setStatus(item, "rejected")}
                onPostFacebook={() => post(item, "facebook")}
                onPostInstagram={() => post(item, "instagram")}
              />
            ))}
      </div>
    </div>
  );
}

function AssetCard({
  item,
  busy,
  onApprove,
  onReject,
  onPostFacebook,
  onPostInstagram,
}: {
  item: ContentItem;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
  onPostFacebook: () => void;
  onPostInstagram: () => void;
}) {
  return (
    <Card className={`asset-card asset-card-${item.status}`}>
      <div className="asset-preview">
        {item.type === "video" ? (
          <video controls muted preload="metadata" className="asset-media">
            <source src={item.file_path} />
          </video>
        ) : (
          <img
            src={item.file_path}
            alt={item.title}
            className="asset-media"
            onError={(event) => {
              event.currentTarget.style.display = "none";
              const placeholder = event.currentTarget.nextElementSibling as HTMLDivElement | null;
              if (placeholder) placeholder.style.display = "flex";
            }}
          />
        )}
        <div className="asset-placeholder" style={{ display: item.type === "video" ? "none" : "none" }}>
          Placeholder preview
        </div>
      </div>
      <div className="asset-card-body">
        <div className="asset-card-header">
          <div>
            <span className="mini-label">{item.type === "video" ? "Video" : "Image"}</span>
            <h3>{item.title}</h3>
          </div>
          <StatusBadge status={item.status} />
        </div>

        <p className="asset-meta">{item.campaign_tag}</p>

        <div className="asset-actions">
          <button type="button" className="button-root button-primary button-sm" onClick={onApprove} disabled={busy || item.status === "approved" || item.status === "posted"}>
            {busy ? <LoaderCircle className="spin" size={16} /> : "Approve"}
          </button>
          <button type="button" className="button-root button-ghost button-sm" onClick={onReject} disabled={busy || item.status === "rejected"}>
            Reject
          </button>
        </div>

        {item.status === "approved" ? (
          <div className="post-actions">
            <button type="button" className="button-root button-secondary button-sm" onClick={onPostFacebook} disabled={busy}>
              <Facebook size={16} />
              Post to Facebook
            </button>
            <button type="button" className="button-root button-secondary button-sm" onClick={onPostInstagram} disabled={busy}>
              <Instagram size={16} />
              Post to Instagram
            </button>
          </div>
        ) : null}

        {item.status === "posted" && item.posted_at ? (
          <p className="posted-at">Posted {new Date(item.posted_at).toLocaleString("en-ZA")}</p>
        ) : null}
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: ContentItem["status"] }) {
  return <span className={`status-badge status-${status}`}>{status}</span>;
}

export function AdsWorkspace() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [plans, setPlans] = useState<AdPlan[]>([]);
  const [form, setForm] = useState<ComposerState>(initialPlan);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { pushToast } = useToast();

  useEffect(() => {
    let active = true;
    Promise.all([api.getContent(), api.getAdPlans()])
      .then(([contentItems, adPlans]) => {
        if (!active) return;
        setContent(contentItems);
        setPlans(adPlans);
        if (contentItems[0]) {
          setForm((current) => ({ ...current, content_item_id: contentItems[0].id }));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function submitPlan(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const created = await api.createAdPlan(form);
      setPlans((current) => [...current, created]);
      pushToast({
        title: "Ad plan saved",
        description: `${created.name} is ready in the planner.`,
      });
      setForm((current) => ({ ...initialPlan, content_item_id: current.content_item_id }));
    } catch (error) {
      pushToast({
        title: "Ad plan failed",
        description: error instanceof Error ? error.message : "Unknown error",
        tone: "muted",
      });
    } finally {
      setSaving(false);
    }
  }

  async function launch(id: number) {
    try {
      const result = await api.launchAdPlan(id);
      setPlans((current) =>
        current.map((plan) => (plan.id === id ? result.adPlan : plan)),
      );
      pushToast({
        title: "Ad submitted to Facebook Ads Manager",
        description: result.message,
      });
    } catch (error) {
      pushToast({
        title: "Launch failed",
        description: error instanceof Error ? error.message : "Unknown error",
        tone: "muted",
      });
    }
  }

  return (
    <div className="workspace-grid">
      <Card className="planner-card">
        <div className="stack-sm">
          <span className="section-eyebrow">Facebook Ads Planner</span>
          <h2 className="section-title">Plan ads against approved content assets</h2>
        </div>
        <form className="planner-form" onSubmit={submitPlan}>
          <label>
            <span>Ad name</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            <span>Objective</span>
            <select value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value as ComposerState["objective"] })}>
              <option>Awareness</option>
              <option>Traffic</option>
              <option>Conversions</option>
            </select>
          </label>
          <label>
            <span>Audience</span>
            <input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} required />
          </label>
          <label>
            <span>Budget (ZAR)</span>
            <input type="number" min="0" value={form.budget_zar} onChange={(e) => setForm({ ...form, budget_zar: Number(e.target.value) })} required />
          </label>
          <label>
            <span>Start date</span>
            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
          </label>
          <label>
            <span>End date</span>
            <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
          </label>
          <label>
            <span>Status</span>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ComposerState["status"] })}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </label>
          <label>
            <span>Link to content asset</span>
            <select value={form.content_item_id} onChange={(e) => setForm({ ...form, content_item_id: Number(e.target.value) })}>
              {content.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Ad Account</span>
            <input value="act_560666565541381" readOnly />
          </label>
          <button type="submit" className="button-root button-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Ad Plan"}
          </button>
        </form>
      </Card>

      <Card className="plans-card">
        <div className="stack-sm">
          <span className="section-eyebrow">Planned Ads</span>
          <h2 className="section-title">Queue</h2>
        </div>
        {loading ? (
          <div className="stack-md">
            <Skeleton className="list-skeleton" />
            <Skeleton className="list-skeleton" />
            <Skeleton className="list-skeleton" />
          </div>
        ) : (
          <div className="plans-table">
            <div className="plans-row plans-head">
              <span>Name</span>
              <span>Objective</span>
              <span>Budget</span>
              <span>Status</span>
              <span />
            </div>
            {plans.map((plan) => (
              <div className="plans-row" key={plan.id}>
                <span>{plan.name}</span>
                <span>{plan.objective}</span>
                <span>R{plan.budget_zar.toLocaleString("en-ZA")}</span>
                <span className={`status-badge status-${plan.status}`}>{plan.status}</span>
                <button type="button" className="button-root button-secondary button-sm" onClick={() => launch(plan.id)}>
                  Launch Ad
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export function CalendarWorkspace() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([api.getCalendarEvents(), api.getContent()])
      .then(([calendar, items]) => {
        if (!active) return;
        setEvents(calendar);
        setContent(items);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
      acc[event.date] ??= [];
      acc[event.date].push(event);
      return acc;
    }, {});
  }, [events]);

  const cells = buildJune2026Cells();
  const contentById = new Map(content.map((item) => [item.id, item]));

  return (
    <div className="workspace-stack">
      <Card className="workspace-header-card">
        <div>
          <span className="section-eyebrow">Content Calendar</span>
          <h2 className="section-title">June 2026 campaign schedule</h2>
          <p className="section-copy">
            Click any scheduled slot to inspect the caption preview, linked asset, and intended platform mix.
          </p>
        </div>
      </Card>

      <Card className="calendar-card">
        <div className="calendar-topline">
          <div>
            <span className="mini-label">Monthly View</span>
            <h3>June 2026</h3>
          </div>
          <div className="calendar-legend">
            <span><Facebook size={14} /> Facebook</span>
            <span><Instagram size={14} /> Instagram</span>
            <span><Calendar size={14} /> Both</span>
          </div>
        </div>

        <div className="calendar-grid">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
            <div className="calendar-label" key={label}>{label}</div>
          ))}
          {loading
            ? Array.from({ length: 35 }).map((_, index) => <Skeleton className="calendar-skeleton" key={index} />)
            : cells.map((cell, index) => (
                <div className={`calendar-cell ${cell ? "" : "calendar-cell-empty"}`} key={index}>
                  {cell ? (
                    <>
                      <span className="calendar-day">{cell.day}</span>
                      <div className="calendar-events">
                        {(eventsByDate[cell.date] || []).map((event) => (
                          <button key={event.id} type="button" className="calendar-event-pill" onClick={() => setSelected(event)}>
                            {event.title}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              ))}
        </div>
      </Card>

      {selected ? (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setSelected(null)}>
              <X size={18} />
            </button>
            <span className="section-eyebrow">Scheduled Post</span>
            <h2 className="section-title">{selected.title}</h2>
            <p className="section-copy">{selected.caption_preview}</p>
            <div className="stack-sm">
              <div className="detail-row"><strong>Date</strong><span>{selected.date}</span></div>
              <div className="detail-row"><strong>Platform</strong><span>{selected.platform}</span></div>
              <div className="detail-row"><strong>Campaign</strong><span>{selected.campaign_tag}</span></div>
            </div>
            {selected.content_item_id ? (
              <div className="modal-asset">
                <span className="mini-label">Linked Asset</span>
                <strong>{contentById.get(selected.content_item_id)?.title || "Linked asset"}</strong>
                <img src={contentById.get(selected.content_item_id)?.file_path || ""} alt="" className="modal-asset-image" />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function StrategyWorkspace() {
  return (
    <div className="workspace-grid strategy-grid">
      <StrategyCard
        title="Father's Day Campaign"
        period="Jun 5–16"
        goal="Drive VIP box + Tomahawk sales for Father's Day"
        bullets={[
          "8 posts planned | 3 ad variants | WhatsApp broadcast on Jun 15",
          "Key product: Tomahawk 1kg, VIP Large Wagyu Box",
          "CTA: View Full Campaign PDF",
        ]}
      />
      <StrategyCard
        title="Hwende 2x Champ Box"
        period="Jun 12–26"
        goal="Launch Nicholas Hwende collab box, drive R1,799 box sales"
        bullets={[
          "15-day campaign | 8 posts | product drop + restock arc",
          "Key product: Hwende 2x Champ Box (R1,799)",
          "Nicholas Hwende: 2x Champion — EFC Bantamweight 2022 + BRAVE CF Bantamweight World Champion 2024",
          'Tagline: "Two Titles. One Fire. Feed Like a Champion."',
          "CTA: View Full Campaign PDF",
        ]}
      />
    </div>
  );
}

function StrategyCard({
  title,
  period,
  goal,
  bullets,
}: {
  title: string;
  period: string;
  goal: string;
  bullets: string[];
}) {
  return (
    <Card className="strategy-card">
      <span className="section-eyebrow">Strategy View</span>
      <h2 className="section-title">{title}</h2>
      <div className="detail-row"><strong>Campaign period</strong><span>{period}</span></div>
      <div className="detail-row"><strong>Goal</strong><span>{goal}</span></div>
      <div className="strategy-list">
        {bullets.map((bullet) => (
          <p key={bullet}>{bullet}</p>
        ))}
      </div>
      <button type="button" className="button-root button-secondary button-sm">View Full Campaign PDF</button>
    </Card>
  );
}

function buildJune2026Cells() {
  const cells: Array<{ day: number; date: string } | null> = [];
  const firstDayOffset = 0;
  for (let i = 0; i < firstDayOffset; i += 1) cells.push(null);
  for (let day = 1; day <= 30; day += 1) {
    cells.push({ day, date: `2026-06-${String(day).padStart(2, "0")}` });
  }
  while (cells.length < 35) cells.push(null);
  return cells;
}
