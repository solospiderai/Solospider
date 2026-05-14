import "dotenv/config";
import { z } from "zod";
import Redis from "ioredis";

// ── Env validation ──────────────────────────────────────────────────────────
const EnvSchema = z.object({
  PORT:                     z.string().default("3001"),
  NODE_ENV:                 z.enum(["development", "production", "test"]).default("development"),
  SUPABASE_URL:             z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY:z.string().min(10),
  REDIS_URL:                z.string().default("redis://localhost:6379"),
  OPENROUTER_API_KEY:       z.string().min(10),
  WORKER_SECRET:            z.string().default("dev-secret"),
  CORS_ORIGINS:             z.string().default("http://localhost:8080"),
});

function loadEnv() {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    result.error.issues.forEach(i => console.error(` • ${i.path.join(".")}: ${i.message}`));
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();

// ── Redis client (shared across workers) ───────────────────────────────────
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // required by BullMQ
  enableReadyCheck: false,
  tls: env.REDIS_URL.startsWith("rediss://") ? {} : undefined,
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err.message));
