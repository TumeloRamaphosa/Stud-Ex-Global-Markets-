import express from "express";
import campaignsRouter from "./routes/campaigns.js";
import insightsRouter from "./routes/insights.js";
import audiencesRouter from "./routes/audiences.js";
import instagramRouter from "./routes/instagram.js";
import creativesRouter from "./routes/creatives.js";
import targetingRouter from "./routes/targeting.js";
import reportingRouter from "./routes/reporting.js";

const app = express();
const PORT = process.env.PORT || process.env.META_ADS_PORT || 3002;

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "studex-mcp-meta-ads" });
});

// Routes
app.use("/campaigns", campaignsRouter);
app.use("/insights", insightsRouter);
app.use("/audiences", audiencesRouter);
app.use("/instagram", instagramRouter);
app.use("/creatives", creativesRouter);
app.use("/targeting", targetingRouter);
app.use("/reporting", reportingRouter);

// Error handler
app.use((err, _req, res, _next) => {
  console.error("[meta-ads]", err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message,
    ...(err.fbError && { fb_error: err.fbError }),
  });
});

app.listen(PORT, () => {
  console.log(`studex-mcp-meta-ads listening on port ${PORT}`);
});
