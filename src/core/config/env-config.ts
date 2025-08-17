import { z } from "zod";
import dotenv from "dotenv";
import { NODE_ENVS, NodeEnv } from "@/common/constants/env-constant";

dotenv.config();

const envSchema = z.object({
  // PostgreSQL database
  DB_USER: z.string().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
  DB_HOST: z.string().min(1, "DB_HOST is required"),
  DB_PORT: z.coerce.number().int().positive(),
  DB_NAME: z.string().min(1, "DB_NAME is required"),

  // App port and protocol
  LOCALHOST: z.string().min(1, "LOCALHOST is required"),
  PORT: z.coerce.number().int().positive(),
  PROTOCOL: z.string().min(1, "PROTOCOL is required"),

  // Admirer port
  ADMIRER_PORT: z.coerce.number().int().positive(),

  // App state
  NODE_ENV: z.enum([
    NODE_ENVS.DEVELOPMENT,
    NODE_ENVS.PRODUCTION,
    NODE_ENVS.TEST,
    NODE_ENVS.CI,
  ]),
  API_PREFIX: z.string().min(1, "API_PREFIX is required"),

  // CORS
  CORS_ORIGIN: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),
});

// Validate and parse
const envVars = envSchema.parse(process.env);

export const env = {
  apiPrefix: envVars.API_PREFIX,
  port: envVars.PORT,
  localhost: envVars.LOCALHOST,
  protocol: envVars.PROTOCOL,
  nodeEnv: envVars.NODE_ENV as NodeEnv,
  postgres: {
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    name: envVars.DB_NAME,
  },
  admirerPort: envVars.ADMIRER_PORT,
  cors: {
    origins: envVars.CORS_ORIGINS
      ? envVars.CORS_ORIGINS.split(",").map((o) => o.trim())
      : envVars.CORS_ORIGIN
        ? [envVars.CORS_ORIGIN]
        : [],
  },
};
