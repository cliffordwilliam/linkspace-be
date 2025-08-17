import express from "express";
import cors from "cors";

import { env } from "@/core/config/env-config";
import { logger } from "@/core/logger/logger";
import { errorHandler } from "@/core/middlewares/error-handler";
import { TypeOrmBaseRepository } from "@/core/database/type-orm-base-repository";
import { apiRouter } from "@/api/routes/index";
import { corsConfig } from "@/core/config/cors-config";

const app = express();

app.use(express.json());
app.use(cors(corsConfig));

app.use(env.apiPrefix, apiRouter);

app.use(errorHandler);

async function startServer() {
  try {
    await TypeOrmBaseRepository.ensureInitialized();
    app.listen(env.port, "0.0.0.0", () => {
      logger.info(`App listening on port ${env.port}`);
    });
  } catch (err) {
    logger.error({ err }, "Failed to initialize database");
    process.exit(1);
  }
}

startServer();
