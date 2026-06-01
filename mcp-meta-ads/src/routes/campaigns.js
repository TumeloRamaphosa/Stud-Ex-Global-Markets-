import { Router } from "express";
import { graphApi, getAccountId } from "../lib/meta-api.js";

const router = Router();

// GET /campaigns — list campaigns
router.get("/", async (req, res, next) => {
  try {
    const accountId = getAccountId();
    const { limit = 25, status, after } = req.query;

    const params = {
      fields: "id,name,objective,status,daily_budget,lifetime_budget,created_time,updated_time",
      limit,
    };
    if (status) params.effective_status = JSON.stringify([status.toUpperCase()]);
    if (after) params.after = after;

    const data = await graphApi(`/${accountId}/campaigns`, { params });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /campaigns — create campaign
router.post("/", async (req, res, next) => {
  try {
    const accountId = getAccountId();
    const { name, objective, status = "PAUSED", daily_budget, lifetime_budget, special_ad_categories } = req.body;

    if (!name || !objective) {
      return res.status(400).json({ error: "name and objective are required" });
    }

    const params = {
      name,
      objective,
      status,
      special_ad_categories: JSON.stringify(special_ad_categories || []),
    };
    if (daily_budget) params.daily_budget = daily_budget;
    if (lifetime_budget) params.lifetime_budget = lifetime_budget;

    const data = await graphApi(`/${accountId}/campaigns`, { method: "POST", params });
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /campaigns/:id — update campaign
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, status, daily_budget, lifetime_budget } = req.body;

    const params = {};
    if (name) params.name = name;
    if (status) params.status = status;
    if (daily_budget) params.daily_budget = daily_budget;
    if (lifetime_budget) params.lifetime_budget = lifetime_budget;

    const data = await graphApi(`/${id}`, { method: "POST", params });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /campaigns/:id — delete campaign
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await graphApi(`/${id}`, { method: "DELETE" });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
