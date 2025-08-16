import { Request, Response, NextFunction } from "express";
import { ResourceNotFoundException } from "@/api/models/ResourceNotFoundException";
import { ApiErrorResponse } from "@/api/models/ApiErrorResponse";
import { HTTP_STATUS } from "@/constants/http";
import { logger } from "@/core/logger/logger";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  if (err instanceof ResourceNotFoundException) {
    const response = new ApiErrorResponse({
      message: err.message,
      code: err.code,
      type: err.name,
    });
    return res.status(HTTP_STATUS.NOT_FOUND).json(response);
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  const type = err instanceof Error ? err.name : undefined;

  const response = new ApiErrorResponse({ message, type });
  logger.error({ err }, "Unhandled error");
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
}
