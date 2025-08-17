import { Request, Response, NextFunction } from "express";
import { ResourceNotFoundException } from "@/api/models/ResourceNotFoundException";
import { ApiErrorResponse } from "@/api/models/ApiErrorResponse";
import { HTTP_STATUS } from "@/common/constants/http";
import { logger } from "@/core/logger/logger";
import { DTOValidationException } from "@/api/models/DTOValidationException";

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

  if (err instanceof DTOValidationException) {
    const details = err.errors.flatMap((e) =>
      Object.entries(e.constraints || {}).map(([constraint, msg]) => ({
        field: `${err.source}.${e.property}`,
        message: msg,
        type: constraint,
      })),
    );

    const response = new ApiErrorResponse({
      message: err.message,
      code: err.code,
      details,
    });

    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json(response);
  }

  const response = new ApiErrorResponse({
    message: err instanceof Error ? err.message : "Internal server error",
    type: err instanceof Error ? err.name : undefined,
  });
  logger.error({ err }, "Unhandled error");
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
}
