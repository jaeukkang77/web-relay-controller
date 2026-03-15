import { z } from 'zod';

// ============================================================
// Environment Variable Schema
// ============================================================

export const envSchema = z.object({
  // ── Server ──────────────────────────────────────────────
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z
    .string()
    .regex(/^\d+$/, 'PORT must be a number')
    .transform(Number)
    .default('3000'),

  // ── Database ─────────────────────────────────────────────
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid URL')
    .startsWith('postgresql://', 'DATABASE_URL must start with postgresql://'),

  // ── JWT ──────────────────────────────────────────────────
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),

  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),

  JWT_ACCESS_EXPIRES_IN: z
    .string()
    .regex(/^\d+[smhd]$/, "JWT_ACCESS_EXPIRES_IN format: '15m', '1h', etc.")
    .default('15m'),

  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .regex(/^\d+[smhd]$/, "JWT_REFRESH_EXPIRES_IN format: '30d', '1h', etc.")
    .default('30d'),

  // ── Internal API ─────────────────────────────────────────
  INTERNAL_SECRET: z
    .string()
    .min(32, 'INTERNAL_SECRET must be at least 32 characters'),

  // ── CORS / Public URL ────────────────────────────────────
  // 운영: 'https://yourname.iptime.org', 개발: 'http://localhost:5173'
  CORS_ORIGIN: z
    .string()
    .url('CORS_ORIGIN must be a valid URL')
    .default('http://localhost:5173'),
});

// ── Inferred Type ─────────────────────────────────────────
export type Env = z.infer<typeof envSchema>;

// ── Validate & Export ─────────────────────────────────────
export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const formatted = result.error.errors
      .map((e) => `  [${e.path.join('.')}] ${e.message}`)
      .join('\n');

    throw new Error(`❌ Environment validation failed:\n${formatted}`);
  }

  return result.data;
}
