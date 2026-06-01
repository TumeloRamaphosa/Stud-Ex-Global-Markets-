import { Router } from "express";
import { graphApi, getAccountId } from "../lib/meta-api.js";

const router = Router();

// GET /creatives — list ad creatives
router.get("/", async (req, res, next) => {
  try {
    const accountId = getAccountId();
    const { limit = 25, after } = req.query;

    const params = {
      fields: "id,name,title,body,image_url,image_hash,video_id,object_story_spec,url_tags,thumbnail_url,status,created_time",
      limit,
    };
    if (after) params.after = after;

    const data = await graphApi(`/${accountId}/adcreatives`, { params });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /creatives — create ad creative
router.post("/", async (req, res, next) => {
  try {
    const accountId = getAccountId();
    const { name, object_story_spec, asset_feed_spec, degrees_of_freedom_spec, url_tags } = req.body;

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }
    if (!object_story_spec && !asset_feed_spec) {
      return res.status(400).json({ error: "object_story_spec or asset_feed_spec is required" });
    }

    const params = { name };

    if (object_story_spec) {
      params.object_story_spec = typeof object_story_spec === "string"
        ? object_story_spec
        : JSON.stringify(object_story_spec);
    }
    if (asset_feed_spec) {
      params.asset_feed_spec = typeof asset_feed_spec === "string"
        ? asset_feed_spec
        : JSON.stringify(asset_feed_spec);
    }
    if (degrees_of_freedom_spec) {
      params.degrees_of_freedom_spec = typeof degrees_of_freedom_spec === "string"
        ? degrees_of_freedom_spec
        : JSON.stringify(degrees_of_freedom_spec);
    }
    if (url_tags) params.url_tags = url_tags;

    const data = await graphApi(`/${accountId}/adcreatives`, { method: "POST", params });
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /creatives/:id — delete creative
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await graphApi(`/${id}`, { method: "DELETE" });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /creatives/preview — generate ad preview
router.post("/preview", async (req, res, next) => {
  try {
    const { creative_id, ad_format = "DESKTOP_FEED_STANDARD" } = req.body;

    if (!creative_id) {
      return res.status(400).json({ error: "creative_id is required" });
    }

    const data = await graphApi(`/${creative_id}/previews`, {
      params: { ad_format },
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
