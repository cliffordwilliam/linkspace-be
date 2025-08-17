import { env } from "@/core/config/env-config";

export const corsConfig = {
  origin: env.cors.origins,
  credentials: true,
};
