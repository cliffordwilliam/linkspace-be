import express from "express";
import cors from "cors";

import { env } from "@/core/config/env-config";
import { logger } from "@/core/logger/logger";
import { productRouter } from "@/products/product-router";
import { DataSourceMiddleware } from "@/core/database/data-source-middleware";
import { Router } from "express";

const app = express();

app.use(express.json());
app.use(cors());

app.use(DataSourceMiddleware);

app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

export const apiRouter = Router();
apiRouter.use("/products", productRouter);
app.use(env.apiPrefix, apiRouter);

app.listen(env.port, "0.0.0.0", () => {
  logger.info(`App listening on port ${env.port}`);
});
