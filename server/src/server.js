import "./config/env.js";
import { config } from "./config/env.js";
import { runMigrations } from "./db/connection.js";
import app from "./app.js";

async function start() {
  try {
    await runMigrations();
  } catch (error) {
    console.error("[api] Failed to initialize the database:", error.message);
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    console.log(`[api] TaskFlow API listening on http://localhost:${config.port}`);
    console.log(`[api] Health check: http://localhost:${config.port}/api/health`);
  });

  function shutdown(signal) {
    console.log(`[api] ${signal} received, closing server…`);
    server.close(() => process.exit(0));
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start();
