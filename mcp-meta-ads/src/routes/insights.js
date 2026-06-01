import { Router } from "express";
import { graphApi, getAccountId } from "../lib/meta-api.js";

const router = Router();

const DEFAULT_FIELDS = "spend,impressions,clicks,actions,cost_per_action_type,cpc,cpm,ctr";

// GET /insights — ad account level insights
router.get("/", async (req, res, next) => {
  try {
    const accountId = getAccountId();
    const { date_preset = "last_30d", time_range, level, fields } = req.query;

    const params = {
      fields: fields || DEFAULT_FIELDS,
      level: level || "account",
    };

    if (time_range) {
      params.time_range = time_range; // expects JSON string e.g. {"since":"2024-01-01","until":"2024-01-31"}
    } else {
      params.date_preset = date_preset;
    }

    const data = await graphApi(`/${accountId}/insights`, { params });

    // Extract conversions from actions array for convenience
    const enriched = (data.data || []).map((row) => {
      const conversions = (row.actions || [])
        .filter((a) => a.action_type === "offsite_conversion" || a.action_type === "lead" || a.action_type === "purchase")
        .reduce((acc, a) => { acc[a.action_type] = a.value; return acc; }, {});

      return { ...row, conversions };
    });

    res.json({ ...data, data: enriched });
  } catch (err) {
    next(err);
  }
});

// GET /insights/:campaignId — campaign-specific insights
router.get("/:campaignId", async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const { date_preset = "last_30d", time_range, fields, breakdowns } = req.query;

    const params = {
      fields: fields || DEFAULT_FIELDS,
    };

    if (time_range) {
      params.time_range = time_range;
    } else {
      params.date_preset = date_preset;
    }

    if (breakdowns) params.breakdowns = breakdowns;

    const data = await graphApi(`/${campaignId}/insights`, { params });

    const enriched = (data.data || []).map((row) => {
      const conversions = (row.actions || [])
        .filter((a) => a.action_type === "offsite_conversion" || a.action_type === "lead" || a.action_type === "purchase")
        .reduce((acc, a) => { acc[a.action_type] = a.value; return acc; }, {});

      return { ...row, conversions };
    });

    res.json({ ...data, data: enriched });
  } catch (err) {
    next(err);
  }
});

export default router;
