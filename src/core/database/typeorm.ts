import { DataSource } from "typeorm";
import { env } from "@/core/config/env-config";
import { NODE_ENVS } from "@/common/constants/env-constant";
import { ProductModel } from "@/products/models/ProductModel";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.postgres.host,
  port: env.postgres.port,
  username: env.postgres.user,
  password: env.postgres.password,
  database: env.postgres.name,
  synchronize: env.nodeEnv === NODE_ENVS.DEVELOPMENT,
  entities: [ProductModel],
});
