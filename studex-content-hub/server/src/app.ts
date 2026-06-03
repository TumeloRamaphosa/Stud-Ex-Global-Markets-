import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import {
  createAdPlan,
  getContentById,
  listAdPlans,
  listCalendarEvents,
  listContent,
  markContentPosted,
  updateAdPlanStatus,
  updateContentStatus,
} from "./db.js";
import {
  fetchFacebookReach,
  fetchInstagramEngagement,
  getMetaConfig,
  postToFacebook,
  postToInstagram,
} from "./meta.js";
import { fetchInventory, fetchOrdersToday, getAnalyticsFromShopify } from "./shopify.js";
import type { AdObjective, AdStatus, ContentStatus } from "./types.js";
import { toYaml } from "./yaml.js";

function ok<T>(res: express.Response, data: T) {
  return res.json({ ok: true, data });
}

function fail(res: express.Response, error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return res.status(status).json({ ok: false, error: message });
}

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => ok(res, { status: "ok" }));

  app.get("/api/content", (_req, res) => ok(res, listContent()));

  app.patch("/api/content/:id/status", (req, res) => {
    try {
      const id = Number(req.params.id);
      const status = req.body.status as ContentStatus;
      const allowed: ContentStatus[] = ["draft", "approved", "rejected", "posted"];

      if (!allowed.includes(status)) {
        return fail(res, new Error("Invalid content status"), 400);
      }

      const updated = updateContentStatus(id, status);
      if (!updated) {
        return fail(res, new Error("Content item not found"), 404);
      }
      return ok(res, updated);
    } catch (error) {
      return fail(res, error);
    }
  });

  app.get("/api/content/export.yaml", (_req, res) => {
    const document = toYaml({
      generatedAt: new Date().toISOString(),
      contentItems: listContent(),
      calendarEvents: listCalendarEvents(),
      adPlans: listAdPlans(),
    });

    res.type("application/yaml");
    res.send(document);
  });

  app.post("/api/posts/facebook", async (req, res) => {
    try {
      const contentId = Number(req.body.content_id);
      const item = getContentById(contentId);
      if (!item) {
        return fail(res, new Error("Content item not found"), 404);
      }

      const result = await postToFacebook({
        caption: req.body.caption || item.title,
        imageUrl: req.body.image_url,
        videoUrl: req.body.video_url,
      });

      const updated = markContentPosted(contentId, {
        status: "posted",
        platformPostIdFb: result.postId,
        postedAt: new Date().toISOString(),
      });

      return ok(res, { item: updated, remote: result });
    } catch (error) {
      return fail(res, error);
    }
  });

  app.post("/api/posts/instagram", async (req, res) => {
    try {
      const contentId = Number(req.body.content_id);
      const item = getContentById(contentId);
      if (!item) {
        return fail(res, new Error("Content item not found"), 404);
      }

      const result = await postToInstagram({
        caption: req.body.caption || item.title,
        imageUrl: req.body.image_url,
        videoUrl: req.body.video_url,
      });

      const updated = markContentPosted(contentId, {
        status: "posted",
        platformPostIdIg: result.postId,
        postedAt: new Date().toISOString(),
      });

      return ok(res, { item: updated, remote: result });
    } catch (error) {
      return fail(res, error);
    }
  });

  app.get("/api/ad-plans", (_req, res) => ok(res, listAdPlans()));

  app.post("/api/ad-plans", (req, res) => {
    try {
      const objective = req.body.objective as AdObjective;
      const status = req.body.status as AdStatus;
      const allowedObjectives: AdObjective[] = ["Awareness", "Traffic", "Conversions"];
      const allowedStatus: AdStatus[] = ["draft", "active", "paused"];

      if (!allowedObjectives.includes(objective) || !allowedStatus.includes(status)) {
        return fail(res, new Error("Invalid ad plan payload"), 400);
      }

      const plan = createAdPlan({
        name: req.body.name,
        objective,
        audience: req.body.audience,
        budget_zar: Number(req.body.budget_zar),
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        status,
        content_item_id: Number(req.body.content_item_id),
      });

      return ok(res, plan);
    } catch (error) {
      return fail(res, error);
    }
  });

  app.post("/api/ad-plans/:id/launch", (req, res) => {
    try {
      const id = Number(req.params.id);
      const updated = updateAdPlanStatus(id, "active");
      if (!updated) {
        return fail(res, new Error("Ad plan not found"), 404);
      }

      return ok(res, {
        adPlan: updated,
        message: `Ad submitted to Facebook Ads Manager for ${process.env.META_AD_ACCOUNT || "act_560666565541381"}.`,
        stub: true,
      });
    } catch (error) {
      return fail(res, error);
    }
  });

  app.get("/api/calendar-events", (_req, res) => ok(res, listCalendarEvents()));

  app.get("/api/shopify/orders", async (_req, res) => {
    try {
      return ok(res, await fetchOrdersToday());
    } catch (error) {
      return fail(res, error);
    }
  });

  app.get("/api/shopify/inventory", async (_req, res) => {
    try {
      return ok(res, await fetchInventory());
    } catch (error) {
      return fail(res, error);
    }
  });

  app.get("/api/analytics", async (_req, res) => {
    const metaConfig = getMetaConfig();
    const snapshot = {
      todaysRevenue: 3240,
      ordersToday: 4,
      pendingFulfilment: 2,
      topProduct: "Wagyu Burger Patties",
      facebookReach7d: 1204,
      instagramEngagement: 6.2,
      gaSessions7d: null as number | null,
      gaConversions7d: null as number | null,
      metaTokenExpiresAt: metaConfig.tokenExpiresAt,
      sources: {
        shopify: "demo",
        meta: metaConfig.tokenConfigured ? "live" : "demo",
        ga4: "demo",
      },
    };

    try {
      const shopify = await getAnalyticsFromShopify();
      snapshot.todaysRevenue = Number(shopify.revenue.toFixed(2));
      snapshot.ordersToday = shopify.ordersToday;
      snapshot.pendingFulfilment = shopify.pendingFulfilment;
      snapshot.topProduct = shopify.topProduct;
      snapshot.sources.shopify = "live";
    } catch {
      snapshot.sources.shopify = "demo";
    }

    try {
      const reach = await fetchFacebookReach();
      if (typeof reach === "number") {
        snapshot.facebookReach7d = reach;
        snapshot.sources.meta = "live";
      }
    } catch {
      snapshot.sources.meta = metaConfig.tokenConfigured ? "partial" : "demo";
    }

    try {
      const engagement = await fetchInstagramEngagement();
      if (typeof engagement === "number") {
        snapshot.instagramEngagement = engagement;
        snapshot.sources.meta = "live";
      }
    } catch {
      snapshot.sources.meta = metaConfig.tokenConfigured ? "partial" : "demo";
    }

    return ok(res, snapshot);
  });

  const clientDist = path.resolve(process.cwd(), "..", "client", "dist");
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  return app;
}
