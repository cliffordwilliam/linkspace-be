import express from "express";
import { env } from "@/core/config/env-config";
import { logger } from "@/core/logger/logger";

const app = express();

// Health check
app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start HTTP server
app.listen(env.port, "0.0.0.0", () => {
  logger.info(`App listening on port ${env.port}`);
});
