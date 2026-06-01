import { Router } from "express";
import { graphApi, instagramApi, getInstagramAccountId } from "../lib/meta-api.js";

const router = Router();

// GET /instagram/media — list recent Instagram media
router.get("/media", async (req, res, next) => {
  try {
    const igId = await getInstagramAccountId();
    const { limit = 25, after } = req.query;

    const params = {
      fields: "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count",
      limit,
    };
    if (after) params.after = after;

    const data = await instagramApi(`/${igId}/media`, { params });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /instagram/media — publish Instagram post (image/carousel/reel)
router.post("/media", async (req, res, next) => {
  try {
    const igId = await getInstagramAccountId();
    const { media_type = "IMAGE", image_url, video_url, caption, children, share_to_feed } = req.body;

    if (media_type === "IMAGE" && !image_url) {
      return res.status(400).json({ error: "image_url is required for IMAGE posts" });
    }
    if (media_type === "REELS" && !video_url) {
      return res.status(400).json({ error: "video_url is required for REELS" });
    }
    if (media_type === "CAROUSEL" && (!children || !children.length)) {
      return res.status(400).json({ error: "children array is required for CAROUSEL posts" });
    }

    let containerId;

    if (media_type === "CAROUSEL") {
      // Create child containers first
      const childIds = [];
      for (const child of children) {
        const childParams = {};
        if (child.media_type === "VIDEO") {
          childParams.video_url = child.video_url;
          childParams.media_type = "VIDEO";
        } else {
          childParams.image_url = child.image_url;
        }
        childParams.is_carousel_item = true;
        const childContainer = await instagramApi(`/${igId}/media`, { method: "POST", params: childParams });
        childIds.push(childContainer.id);
      }

      // Create carousel container
      const carouselParams = {
        media_type: "CAROUSEL",
        children: childIds.join(","),
      };
      if (caption) carouselParams.caption = caption;
      const container = await instagramApi(`/${igId}/media`, { method: "POST", params: carouselParams });
      containerId = container.id;
    } else if (media_type === "REELS") {
      const params = {
        media_type: "REELS",
        video_url,
      };
      if (caption) params.caption = caption;
      if (share_to_feed !== undefined) params.share_to_feed = share_to_feed;
      const container = await instagramApi(`/${igId}/media`, { method: "POST", params });
      containerId = container.id;
    } else {
      // IMAGE
      const params = { image_url };
      if (caption) params.caption = caption;
      const container = await instagramApi(`/${igId}/media`, { method: "POST", params });
      containerId = container.id;
    }

    // Publish the container
    const published = await instagramApi(`/${igId}/media_publish`, {
      method: "POST",
      params: { creation_id: containerId },
    });

    res.status(201).json(published);
  } catch (err) {
    next(err);
  }
});

// GET /instagram/insights — Instagram account insights
router.get("/insights", async (req, res, next) => {
  try {
    const igId = await getInstagramAccountId();
    const { metric, period = "day", since, until } = req.query;

    const defaultMetrics = "reach,impressions,follower_count,profile_views";
    const params = {
      metric: metric || defaultMetrics,
      period,
    };
    if (since) params.since = since;
    if (until) params.until = until;

    const data = await instagramApi(`/${igId}/insights`, { params });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /instagram/stories — list stories
router.get("/stories", async (req, res, next) => {
  try {
    const igId = await getInstagramAccountId();

    const params = {
      fields: "id,media_type,media_url,timestamp,permalink",
    };

    const data = await instagramApi(`/${igId}/stories`, { params });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /instagram/hashtags — search hashtag insights
router.get("/hashtags", async (req, res, next) => {
  try {
    const igId = await getInstagramAccountId();
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: "q (hashtag query) is required" });
    }

    // Step 1: Search for the hashtag ID
    const searchData = await instagramApi("/ig_hashtag_search", {
      params: { user_id: igId, q },
    });

    if (!searchData.data || !searchData.data.length) {
      return res.json({ data: [], message: "No hashtags found" });
    }

    const hashtagId = searchData.data[0].id;

    // Step 2: Get top media for this hashtag
    const topMedia = await instagramApi(`/${hashtagId}/top_media`, {
      params: {
        user_id: igId,
        fields: "id,caption,media_type,media_url,permalink,like_count,comments_count,timestamp",
      },
    });

    res.json({ hashtag_id: hashtagId, query: q, top_media: topMedia.data || [] });
  } catch (err) {
    next(err);
  }
});

export default router;
