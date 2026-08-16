import compression from "compression";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import mongoose from "mongoose";

import { env } from "./config/env.js";
import {
  errorHandler,
  notFoundHandler,
} from "./common/middleware/errorHandler.js";
import { globalRateLimiter } from "./common/middleware/rateLimit.js";
import { requestLogger } from "./common/middleware/requestLogger.js";
import { apiRouter } from "./routes.js";

/**
 * Builds the Express app without binding a port, so tests can drive it with
 * supertest and `server.ts` owns the listening/lifecycle concerns.
 */
export const createApp = (): Express => {
  const app = express();

  // Correct client IPs behind a proxy — required for rate limiting to work.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL.split(",").map((origin) => origin.trim()),
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(requestLogger);
  app.use(globalRateLimiter);

  app.get("/health", (_req, res) => {
    const dbUp = mongoose.connection.readyState === 1;

    res.status(dbUp ? 200 : 503).json({
      success: dbUp,
      status: dbUp ? "ok" : "degraded",
      database: dbUp ? "connected" : "disconnected",
      uptime: process.uptime(),
    });
  });

  app.get("/", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Company Admin Panel API is running",
    });
  });

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
