import { Router } from "express";
import { graphApi, getAccountId } from "../lib/meta-api.js";

const router = Router();

// GET /audiences — list custom audiences
router.get("/", async (req, res, next) => {
  try {
    const accountId = getAccountId();
    const { limit = 25, after } = req.query;

    const params = {
      fields: "id,name,description,subtype,approximate_count,data_source,delivery_status,operation_status,created_time",
      limit,
    };
    if (after) params.after = after;

    const data = await graphApi(`/${accountId}/customaudiences`, { params });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /audiences — create custom audience
router.post("/", async (req, res, next) => {
  try {
    const accountId = getAccountId();
    const { name, description, subtype, rule, lookalike_spec, customer_file_source } = req.body;

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    const params = { name };
    if (description) params.description = description;
    if (subtype) params.subtype = subtype;
    if (rule) params.rule = typeof rule === "string" ? rule : JSON.stringify(rule);
    if (lookalike_spec) params.lookalike_spec = typeof lookalike_spec === "string" ? lookalike_spec : JSON.stringify(lookalike_spec);
    if (customer_file_source) params.customer_file_source = customer_file_source;

    const data = await graphApi(`/${accountId}/customaudiences`, { method: "POST", params });
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
