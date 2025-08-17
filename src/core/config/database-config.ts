import { env } from "@/core/config/env-config";
import { NODE_ENVS } from "@/common/constants/env-constant";
import { DataSourceOptions } from "typeorm";

export const databaseConfig: DataSourceOptions = {
  type: "postgres",
  host: env.postgres.host,
  port: env.postgres.port,
  username: env.postgres.user,
  password: env.postgres.password,
  database: env.postgres.name,
  synchronize: env.nodeEnv === NODE_ENVS.DEVELOPMENT,
  entities: [__dirname + "/../../**/models/*.{ts,js}"],
};
