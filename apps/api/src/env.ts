// Base API config, validated with zod at startup. Feature-specific settings
// (auth, Gemini, email, storage) are loaded by their own modules.
import { z } from "zod";

const Env = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  WEB_ORIGIN: z.url().default("http://localhost:5173"),
});

export type ApiEnv = z.infer<typeof Env>;

export function loadEnv(env: NodeJS.ProcessEnv = process.env): ApiEnv {
  return Env.parse(env);
}
