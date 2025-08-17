import { Router, Request, Response } from "express";
import { HTTP_STATUS } from "@/common/constants/http";

export const healthCheckRouter = Router();

healthCheckRouter.get("", async (_req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    status: "ok",
  });
});
