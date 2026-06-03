import "./env.js";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import type { AdPlan, CalendarEvent, ContentItem, ContentStatus } from "./types.js";

const defaultDbPath = path.resolve(process.cwd(), "data", "studex-content-hub.sqlite");
const dbPath = path.resolve(process.cwd(), process.env.DATABASE_PATH || defaultDbPath);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

const seededContent = [
  {
    title: "Tomahawk Hero",
    type: "image",
    filePath: "/assets/content/studex-tomahawk-fathers-day-hero.png",
    campaignTag: "Fathers Day Campaign",
  },
  {
    title: "Hwende 2x Champ Box",
    type: "image",
    filePath: "/assets/content/studex-hwende-champ-box-reveal.png",
    campaignTag: "Hwende Campaign",
  },
  {
    title: "Father's Day Braai",
    type: "image",
    filePath: "/assets/content/studex-fathers-day-braai-lifestyle.png",
    campaignTag: "Fathers Day Campaign",
  },
  {
    title: "Youth Day June 16",
    type: "image",
    filePath: "/assets/content/studex-youth-day-june16.png",
    campaignTag: "Fathers Day Campaign",
  },
  {
    title: "Wagyu Burger Patties",
    type: "image",
    filePath: "/assets/content/studex-wagyu-burger-patties.png",
    campaignTag: "Fathers Day Campaign",
  },
  {
    title: "Tomahawk Sizzle Reel",
    type: "video",
    filePath: "/assets/content/studex-tomahawk-sizzle-reel.mp4",
    campaignTag: "Hwende Campaign",
  },
] as const;

const contentIdByTitle = new Map<string, number>();

const seededEvents = [
  {
    date: "2026-06-05",
    title: "Dad doesn't want a tie",
    caption: "Tomahawk hero post with matching ad launch for the Father's Day campaign.",
    platform: "both",
    contentTitle: "Tomahawk Hero",
    campaignTag: "Fathers Day Campaign",
  },
  {
    date: "2026-06-07",
    title: "Wagyu Burger Patties product spotlight",
    caption: "Lean into the convenience and premium angle for a quick Father's Day braai win.",
    platform: "both",
    contentTitle: "Wagyu Burger Patties",
    campaignTag: "Fathers Day Campaign",
  },
  {
    date: "2026-06-10",
    title: "Father + son braai lifestyle",
    caption: "Emotional storytelling post centered on togetherness and premium cuts.",
    platform: "both",
    contentTitle: "Father's Day Braai",
    campaignTag: "Fathers Day Campaign",
  },
  {
    date: "2026-06-12",
    title: "Hwende 2x Champ Box reveal",
    caption: "Reveal the collab drop and introduce the champion angle for the launch arc.",
    platform: "both",
    contentTitle: "Hwende 2x Champ Box",
    campaignTag: "Hwende Campaign",
  },
  {
    date: "2026-06-14",
    title: "Youth Day teaser",
    caption: "Preview the June 16 patriotism angle with a premium 'feed the nation' hook.",
    platform: "both",
    contentTitle: "Youth Day June 16",
    campaignTag: "Fathers Day Campaign",
  },
  {
    date: "2026-06-15",
    title: "Father's Day premium VIP box push",
    caption: "Push the VIP box and Tomahawk upsell, plus WhatsApp broadcast timing.",
    platform: "both",
    contentTitle: "Tomahawk Hero",
    campaignTag: "Fathers Day Campaign",
  },
  {
    date: "2026-06-16",
    title: "Youth Day feed the nation post",
    caption: "A patriotic Youth Day story framed around premium South African quality.",
    platform: "both",
    contentTitle: "Youth Day June 16",
    campaignTag: "Fathers Day Campaign",
  },
  {
    date: "2026-06-15",
    title: "Fight night fuel reel",
    caption: "Use the Tomahawk reel as the motion-led post for the Hwende collab.",
    platform: "instagram",
    contentTitle: "Tomahawk Sizzle Reel",
    campaignTag: "Hwende Campaign",
  },
  {
    date: "2026-06-19",
    title: "Fan testimonial repost",
    caption: "A testimonial-driven proof point to extend trust in the Hwende campaign.",
    platform: "facebook",
    contentTitle: "Hwende 2x Champ Box",
    campaignTag: "Hwende Campaign",
  },
  {
    date: "2026-06-22",
    title: "Restock alert",
    caption: "Urgency-led message for the collab box restock moment.",
    platform: "both",
    contentTitle: "Hwende 2x Champ Box",
    campaignTag: "Hwende Campaign",
  },
  {
    date: "2026-06-26",
    title: "Campaign wrap",
    caption: "Close the Hwende campaign with a recap, social proof, and last call CTA.",
    platform: "both",
    contentTitle: "Hwende 2x Champ Box",
    campaignTag: "Hwende Campaign",
  },
] as const;

function createSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS content_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK(type IN ('image', 'video')),
      file_path TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('draft', 'approved', 'rejected', 'posted')) DEFAULT 'draft',
      platform_post_id_fb TEXT,
      platform_post_id_ig TEXT,
      posted_at TEXT,
      campaign_tag TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ad_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      objective TEXT NOT NULL CHECK(objective IN ('Awareness', 'Traffic', 'Conversions')),
      audience TEXT NOT NULL,
      budget_zar REAL NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('draft', 'active', 'paused')) DEFAULT 'draft',
      content_item_id INTEGER NOT NULL,
      FOREIGN KEY(content_item_id) REFERENCES content_items(id)
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      caption_preview TEXT NOT NULL,
      platform TEXT NOT NULL CHECK(platform IN ('facebook', 'instagram', 'both')),
      content_item_id INTEGER,
      campaign_tag TEXT NOT NULL,
      UNIQUE(date, title, platform),
      FOREIGN KEY(content_item_id) REFERENCES content_items(id)
    );
  `);
}

function seedContent() {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO content_items
    (title, type, file_path, status, campaign_tag)
    VALUES (@title, @type, @file_path, 'draft', @campaign_tag)
  `);

  for (const item of seededContent) {
    stmt.run({
      title: item.title,
      type: item.type,
      file_path: item.filePath,
      campaign_tag: item.campaignTag,
    });
  }

  const rows = db
    .prepare("SELECT id, title FROM content_items ORDER BY id ASC")
    .all() as Array<{ id: number; title: string }>;
  rows.forEach((row) => contentIdByTitle.set(row.title, row.id));
}

function seedCalendar() {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO calendar_events
    (date, title, caption_preview, platform, content_item_id, campaign_tag)
    VALUES (@date, @title, @caption_preview, @platform, @content_item_id, @campaign_tag)
  `);

  for (const event of seededEvents) {
    stmt.run({
      date: event.date,
      title: event.title,
      caption_preview: event.caption,
      platform: event.platform,
      content_item_id: contentIdByTitle.get(event.contentTitle) ?? null,
      campaign_tag: event.campaignTag,
    });
  }
}

export function initDb() {
  createSchema();
  seedContent();
  seedCalendar();
}

export function listContent(): ContentItem[] {
  return db.prepare("SELECT * FROM content_items ORDER BY id ASC").all() as ContentItem[];
}

export function getContentById(id: number): ContentItem | undefined {
  return db.prepare("SELECT * FROM content_items WHERE id = ?").get(id) as ContentItem | undefined;
}

export function updateContentStatus(id: number, status: ContentStatus) {
  db.prepare("UPDATE content_items SET status = ? WHERE id = ?").run(status, id);
  return getContentById(id);
}

export function markContentPosted(
  id: number,
  fields: {
    status?: ContentStatus;
    platformPostIdFb?: string | null;
    platformPostIdIg?: string | null;
    postedAt?: string | null;
  },
) {
  db.prepare(`
    UPDATE content_items
    SET status = COALESCE(@status, status),
        platform_post_id_fb = COALESCE(@platform_post_id_fb, platform_post_id_fb),
        platform_post_id_ig = COALESCE(@platform_post_id_ig, platform_post_id_ig),
        posted_at = COALESCE(@posted_at, posted_at)
    WHERE id = @id
  `).run({
    id,
    status: fields.status ?? null,
    platform_post_id_fb: fields.platformPostIdFb ?? null,
    platform_post_id_ig: fields.platformPostIdIg ?? null,
    posted_at: fields.postedAt ?? null,
  });
  return getContentById(id);
}

export function listAdPlans(): AdPlan[] {
  return db.prepare("SELECT * FROM ad_plans ORDER BY start_date ASC, id ASC").all() as AdPlan[];
}

export function createAdPlan(input: Omit<AdPlan, "id">) {
  const result = db
    .prepare(`
      INSERT INTO ad_plans
      (name, objective, audience, budget_zar, start_date, end_date, status, content_item_id)
      VALUES (@name, @objective, @audience, @budget_zar, @start_date, @end_date, @status, @content_item_id)
    `)
    .run(input);

  return db.prepare("SELECT * FROM ad_plans WHERE id = ?").get(result.lastInsertRowid) as AdPlan;
}

export function updateAdPlanStatus(id: number, status: AdPlan["status"]) {
  db.prepare("UPDATE ad_plans SET status = ? WHERE id = ?").run(status, id);
  return db.prepare("SELECT * FROM ad_plans WHERE id = ?").get(id) as AdPlan | undefined;
}

export function listCalendarEvents(): CalendarEvent[] {
  return db.prepare("SELECT * FROM calendar_events ORDER BY date ASC, id ASC").all() as CalendarEvent[];
}
