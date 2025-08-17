import express from "express";
import { router as productRouter } from "@/products/router";
import { router as healthCheckRouter } from "@/health-check/router";

export const apiRouter = express.Router();

apiRouter.use("/healthz", healthCheckRouter);
apiRouter.use("/products", productRouter);
