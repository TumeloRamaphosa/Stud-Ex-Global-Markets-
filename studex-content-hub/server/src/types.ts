export type ContentStatus = "draft" | "approved" | "rejected" | "posted";
export type ContentType = "image" | "video";
export type AdStatus = "draft" | "active" | "paused";
export type AdObjective = "Awareness" | "Traffic" | "Conversions";
export type CalendarPlatform = "facebook" | "instagram" | "both";

export interface ContentItem {
  id: number;
  title: string;
  type: ContentType;
  file_path: string;
  status: ContentStatus;
  platform_post_id_fb: string | null;
  platform_post_id_ig: string | null;
  posted_at: string | null;
  campaign_tag: string;
}

export interface AdPlan {
  id: number;
  name: string;
  objective: AdObjective;
  audience: string;
  budget_zar: number;
  start_date: string;
  end_date: string;
  status: AdStatus;
  content_item_id: number;
}

export interface CalendarEvent {
  id: number;
  date: string;
  title: string;
  caption_preview: string;
  platform: CalendarPlatform;
  content_item_id: number | null;
  campaign_tag: string;
}
