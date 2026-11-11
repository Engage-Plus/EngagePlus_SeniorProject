// API entry point: `npm run dev -w @engageplus/api` or `node dist/index.js`.
import { createApp } from "./app.js";
import { disconnectDb } from "./db.js";
import { loadEnv } from "./env.js";
import { geminiFromEnv } from "./services/gemini.js";

const env = loadEnv();
const model = geminiFromEnv();
const server = createApp({ model }).listen(env.PORT, () => {
  console.log(`Engage+ API listening on http://localhost:${env.PORT}`);
  if (!model) console.log("GEMINI_API_KEY not set: AI features use their non-AI fallbacks");
});

function shutdown(): void {
  server.close(() => {
    void disconnectDb().finally(() => process.exit(0));
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
