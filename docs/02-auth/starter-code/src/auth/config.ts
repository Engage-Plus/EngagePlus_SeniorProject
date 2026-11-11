// Auth configuration (F21). Fails fast if a required variable is missing.
import { z } from "zod";

const Env = z.object({
  MS_CLIENT_ID: z.string().min(1),
  MS_CLIENT_SECRET: z.string().min(1),
  MS_AUTHORITY: z.string().url().default("https://login.microsoftonline.com/organizations"),
  MS_REDIRECT_URI: z.string().url(),
  HOWARD_TENANT_ID: z.string().uuid(),
  SESSION_SECRET: z.string().min(32),
  WEB_ORIGIN: z.string().url(),
  DEV_AUTH: z.enum(["true", "false"]).default("false"),
  NODE_ENV: z.string().default("development"),
});

export type AuthConfig = z.infer<typeof Env>;

export function loadAuthConfig(env: NodeJS.ProcessEnv = process.env): AuthConfig {
  const cfg = Env.parse(env);
  if (cfg.DEV_AUTH === "true" && cfg.NODE_ENV === "production") {
    throw new Error("DEV_AUTH must never be enabled in production");
  }
  return cfg;
}

// Only basic sign-in scopes: these avoid admin-consent-only permissions.
export const LOGIN_SCOPES = ["openid", "profile", "email", "User.Read"];
