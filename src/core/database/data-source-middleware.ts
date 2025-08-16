import { Request, Response, NextFunction } from "express";
import { TypeOrmBaseRepository } from "@/core/database/type-orm-base-repository";

export async function DataSourceMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  await TypeOrmBaseRepository.ensureInitialized();
  return next();
}
