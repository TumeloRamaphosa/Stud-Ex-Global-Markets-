import { Router } from "express";
import { graphApi, getAccountId } from "../lib/meta-api.js";

const router = Router();

// GET /targeting/interests — search targeting interests
router.get("/interests", async (req, res, next) => {
  try {
    const { q, limit = 25 } = req.query;

    if (!q) {
      return res.status(400).json({ error: "q (search query) is required" });
    }

    const data = await graphApi("/search", {
      params: {
        type: "adinterest",
        q,
        limit,
      },
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /targeting/demographics — get demographic targeting options
router.get("/demographics", async (req, res, next) => {
  try {
    const { type = "adgeolocation", q, limit = 25 } = req.query;

    // Supported types: adgeolocation, adlocale, adcountry, adeducationschool,
    // adeducationmajor, adworkemployer, adworkposition
    const params = { type, limit };
    if (q) params.q = q;

    const data = await graphApi("/search", { params });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /targeting/reach-estimate — estimate audience reach
router.post("/reach-estimate", async (req, res, next) => {
  try {
    const accountId = getAccountId();
    const { targeting_spec, optimization_goal } = req.body;

    if (!targeting_spec) {
      return res.status(400).json({ error: "targeting_spec is required" });
    }

    const params = {
      targeting_spec: typeof targeting_spec === "string"
        ? targeting_spec
        : JSON.stringify(targeting_spec),
    };
    if (optimization_goal) params.optimization_goal = optimization_goal;

    const data = await graphApi(`/${accountId}/reachestimate`, { params });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /targeting/saved — list saved targeting specs (saved audiences)
router.get("/saved", async (req, res, next) => {
  try {
    const accountId = getAccountId();
    const { limit = 25, after } = req.query;

    const params = {
      fields: "id,name,targeting,run_status,time_created,time_updated",
      limit,
    };
    if (after) params.after = after;

    const data = await graphApi(`/${accountId}/saved_audiences`, { params });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
