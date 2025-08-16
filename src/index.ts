import express from "express";
import cors from "cors";

import { env } from "@/core/config/env-config";
import { logger } from "@/core/logger/logger";
import { productRouter } from "@/products/product-router";
import { DataSourceMiddleware } from "@/core/database/data-source-middleware";
import { Router } from "express";
import { errorHandler } from "@/core/middlewares/error-handler";
import { HTTP_STATUS } from "@/constants/http";

const app = express();

app.use(express.json());
app.use(cors());

app.use(DataSourceMiddleware);

app.get("/healthz", (_req, res) => {
  res.status(HTTP_STATUS.OK).json({ status: "ok" });
});

export const apiRouter = Router();
apiRouter.use("/products", productRouter);
app.use(env.apiPrefix, apiRouter);

app.use(errorHandler);

app.listen(env.port, "0.0.0.0", () => {
  logger.info(`App listening on port ${env.port}`);
});
