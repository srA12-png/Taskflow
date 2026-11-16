import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

/**
 * Loads environment variables in a predictable order:
 *   1. <repo-root>/.env   (documented in README + .env.example)
 *   2. <server>/.env      (optional local override)
 *
 * Values already present in the real environment (production) always win.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(here, "../..");
const repoRoot = path.resolve(serverRoot, "..");

dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.join(serverRoot, ".env") });

const nodeEnv = process.env.NODE_ENV ?? "development";
const jwtSecret = process.env.JWT_SECRET ?? "development-only-insecure-secret";

if (nodeEnv === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in production");
}

export const config = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  isTest: nodeEnv === "test",
  serverRoot,
  port: Number(process.env.PORT) || 5000,
  clientOrigins: (
    process.env.CLIENT_ORIGIN ??
    process.env.RENDER_EXTERNAL_URL ??
    "http://localhost:5173"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  cookieName: "taskflow_token",
  cookieSecure: process.env.COOKIE_SECURE === "true",
  databaseFile: process.env.DATABASE_FILE ?? "./data/taskflow.db",
};

/** Absolute path so the API behaves the same from any working directory. */
export function resolveDatabasePath() {
  if (config.databaseFile === ":memory:") return ":memory:";
  return path.isAbsolute(config.databaseFile)
    ? config.databaseFile
    : path.resolve(config.serverRoot, config.databaseFile);
}
