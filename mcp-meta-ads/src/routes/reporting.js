import { Router } from "express";
import { graphApi, getAccountId } from "../lib/meta-api.js";

const router = Router();

const PERFORMANCE_FIELDS = "campaign_name,campaign_id,spend,impressions,clicks,cpc,cpm,ctr,actions,cost_per_action_type,reach,frequency";

// GET /reporting/daily — daily spend/performance report
router.get("/daily", async (req, res, next) => {
  try {
    const accountId = getAccountId();
    const { since, until, campaign_id, fields } = req.query;

    const params = {
      fields: fields || PERFORMANCE_FIELDS,
      time_increment: 1, // daily breakdown
      level: "campaign",
    };

    if (since && until) {
      params.time_range = JSON.stringify({ since, until });
    } else {
      params.date_preset = "last_30d";
    }

    const endpoint = campaign_id
      ? `/${campaign_id}/insights`
      : `/${accountId}/insights`;

    const data = await graphApi(endpoint, { params });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /reporting/comparison — compare campaigns performance
router.get("/comparison", async (req, res, next) => {
  try {
    const accountId = getAccountId();
    const { campaign_ids, date_preset = "last_30d", since, until, fields } = req.query;

    const params = {
      fields: fields || PERFORMANCE_FIELDS,
      level: "campaign",
    };

    if (since && until) {
      params.time_range = JSON.stringify({ since, until });
    } else {
      params.date_preset = date_preset;
    }

    if (campaign_ids) {
      // Filter to specific campaigns
      const ids = Array.isArray(campaign_ids) ? campaign_ids : campaign_ids.split(",");
      params.filtering = JSON.stringify([
        { field: "campaign.id", operator: "IN", value: ids },
      ]);
    }

    const data = await graphApi(`/${accountId}/insights`, { params });

    // Group by campaign for easy comparison
    const byCampaign = {};
    for (const row of data.data || []) {
      const cid = row.campaign_id;
      if (!byCampaign[cid]) {
        byCampaign[cid] = { campaign_id: cid, campaign_name: row.campaign_name, entries: [] };
      }
      byCampaign[cid].entries.push(row);
    }

    res.json({ campaigns: Object.values(byCampaign), paging: data.paging });
  } catch (err) {
    next(err);
  }
});

// POST /reporting/export — export report as CSV/JSON
router.post("/export", async (req, res, next) => {
  try {
    const accountId = getAccountId();
    const { format = "json", date_preset = "last_30d", since, until, level = "campaign", fields } = req.body;

    const params = {
      fields: fields || PERFORMANCE_FIELDS,
      level,
      time_increment: 1,
    };

    if (since && until) {
      params.time_range = JSON.stringify({ since, until });
    } else {
      params.date_preset = date_preset;
    }

    const data = await graphApi(`/${accountId}/insights`, { params });
    const rows = data.data || [];

    if (format === "csv") {
      if (!rows.length) {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=report.csv");
        return res.send("");
      }

      // Build CSV
      const flatRows = rows.map((row) => {
        const flat = { ...row };
        // Flatten actions array into columns
        if (flat.actions) {
          for (const action of flat.actions) {
            flat[`action_${action.action_type}`] = action.value;
          }
          delete flat.actions;
        }
        if (flat.cost_per_action_type) {
          for (const cpa of flat.cost_per_action_type) {
            flat[`cost_per_${cpa.action_type}`] = cpa.value;
          }
          delete flat.cost_per_action_type;
        }
        return flat;
      });

      const headers = [...new Set(flatRows.flatMap(Object.keys))];
      const csvLines = [
        headers.join(","),
        ...flatRows.map((row) =>
          headers.map((h) => {
            const val = row[h] ?? "";
            return typeof val === "string" && val.includes(",") ? `"${val}"` : val;
          }).join(",")
        ),
      ];

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=report.csv");
      return res.send(csvLines.join("\n"));
    }

    // Default: JSON
    res.json({ data: rows, paging: data.paging });
  } catch (err) {
    next(err);
  }
});

// GET /reporting/attribution — conversion attribution data
router.get("/attribution", async (req, res, next) => {
  try {
    const accountId = getAccountId();
    const { date_preset = "last_30d", since, until, attribution_windows, campaign_id } = req.query;

    const params = {
      fields: "campaign_name,campaign_id,actions,action_values,conversions,conversion_values,cost_per_action_type",
      level: "campaign",
    };

    if (since && until) {
      params.time_range = JSON.stringify({ since, until });
    } else {
      params.date_preset = date_preset;
    }

    if (attribution_windows) {
      // e.g. "1d_click,7d_click,1d_view"
      params.action_attribution_windows = JSON.stringify(
        attribution_windows.split(",").map((w) => w.trim())
      );
    } else {
      params.action_attribution_windows = JSON.stringify(["1d_click", "7d_click", "1d_view"]);
    }

    const endpoint = campaign_id
      ? `/${campaign_id}/insights`
      : `/${accountId}/insights`;

    const data = await graphApi(endpoint, { params });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
