import pino from "pino";
import { env } from "@/core/config/env-config";
import { NODE_ENVS } from "@/common/constants/env-constant";

const isDev = env.nodeEnv !== NODE_ENVS.PRODUCTION;

export const logger = isDev
  ? pino(
      {},
      pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "yyyy-mm-dd HH:MM:ss",
        },
      }),
    )
  : pino({ level: "info" });
