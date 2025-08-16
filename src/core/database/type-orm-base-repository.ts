import { DataSource } from "typeorm";
import { AppDataSource } from "@/core/database/typeorm";

export const TypeOrmBaseRepository = {
  dataSource: AppDataSource as DataSource,

  async ensureInitialized() {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }
    return this.dataSource;
  },
};
