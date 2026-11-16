import { runMigrations, closeDb } from "./connection.js";

const command = process.argv[2] ?? "migrate";

if (command === "reset") {
  console.warn(
    "[db] Reset is handled by the seed script: npm run db:seed -- --reset",
  );
}

try {
  await runMigrations();
  console.log("[db] Migrations applied — schema is up to date.");
} catch (error) {
  console.error("[db] Migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await closeDb();
}
