import { DataSource } from "typeorm";
import { databaseConfig } from "@/core/config/database-config";

export const AppDataSource = new DataSource(databaseConfig);
