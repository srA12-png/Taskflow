import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { resolveDatabasePath } from "../config/env.js";

const here = path.dirname(fileURLToPath(import.meta.url));

let dbPromise = null;

/**
 * Single shared connection.
 * SQLite is a local file, so a pool would only add lock contention.
 */
export async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const filename = resolveDatabasePath();

      if (filename !== ":memory:") {
        fs.mkdirSync(path.dirname(filename), { recursive: true });
      }

      const db = await open({ filename, driver: sqlite3.Database });

      // Foreign keys are OFF by default in SQLite and must be enabled
      // per connection, otherwise ON DELETE CASCADE / SET NULL silently fail.
      await db.exec("PRAGMA foreign_keys = ON");
      await db.exec("PRAGMA busy_timeout = 5000");
      if (filename !== ":memory:") {
        await db.exec("PRAGMA journal_mode = WAL");
      }

      return db;
    })();
  }

  return dbPromise;
}

/** Runs schema.sql (idempotent) so the app can start on a fresh machine. */
export async function runMigrations() {
  const db = await getDb();
  const schema = fs.readFileSync(path.join(here, "schema.sql"), "utf8");
  await db.exec(schema);
  return db;
}

export async function closeDb() {
  if (!dbPromise) return;
  const db = await dbPromise;
  dbPromise = null;
  await db.close();
}

/** Small transaction helper: rolls back automatically when work throws. */
export async function withTransaction(work) {
  const db = await getDb();
  await db.exec("BEGIN");
  try {
    const result = await work(db);
    await db.exec("COMMIT");
    return result;
  } catch (error) {
    await db.exec("ROLLBACK");
    throw error;
  }
}
