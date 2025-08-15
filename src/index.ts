import express from "express";
import { env } from "@/core/config/env-config";
import { logger } from "@/core/logger/logger";
import cors from "cors";

const app = express();

app.use(cors());

app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(env.port, "0.0.0.0", () => {
  logger.info(`App listening on port ${env.port}`);
});
