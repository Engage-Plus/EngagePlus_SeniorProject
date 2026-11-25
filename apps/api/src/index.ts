// API entry point: `npm run dev -w @engageplus/api` or `node dist/index.js`.
import { createApp } from "./app.js";
import { disconnectDb } from "./db.js";
import { loadEnv } from "./env.js";

const env = loadEnv();
const server = createApp().listen(env.PORT, () => {
  console.log(`Engage+ API listening on http://localhost:${env.PORT}`);
});

function shutdown(): void {
  server.close(() => {
    void disconnectDb().finally(() => process.exit(0));
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
