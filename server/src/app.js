import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/env.js";
import { apiLimiter, originCheck } from "./middleware/security.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

/**
 * TaskFlow API.
 *
 * Response shape:
 *   success: { data: ... }
 *   failure: { error: { code, message, details? } }
 */
const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: config.clientOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(originCheck);
app.use("/api", apiLimiter);

app.get("/api/health", (_request, response) => {
  response.json({
    data: {
      status: "ok",
      service: "taskflow-api",
      timestamp: new Date().toISOString(),
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
