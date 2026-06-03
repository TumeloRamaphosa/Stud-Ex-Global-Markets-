import "./env.js";
import { initDb } from "./db.js";
import { createApp } from "./app.js";

initDb();
const app = createApp();
const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`StudEx Content Hub server listening on http://localhost:${port}`);
});
