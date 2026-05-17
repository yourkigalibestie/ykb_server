import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Supabase PgBouncer (port 6543 / pgbouncer=true) can be flaky for long-lived dev servers.
// If a direct connection URL is available, prefer it at runtime.
if (
    process.env.DIRECT_URL &&
    process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.includes('pgbouncer=true') || process.env.DATABASE_URL.includes(':6543'))
) {
    process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.string().min(1),
    DIRECT_URL: z.string().min(1).optional(),
    JWT_SECRET: z.string().min(16),
    JWT_EXPIRES_IN: z.string().min(1).default('7d'),
    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
    PLATFORM_FEE_BPS: z.coerce.number().int().min(0).max(10_000).default(0),
    PESAPAY_CONSUMER_KEY: z.string().min(1),
    PESAPAY_CONSUMER_SECRET: z.string().min(1),
    PESAPAY_BASE_URL: z.string().min(1),
    PESAPAY_IPN_ID: z.string().min(1),
    PESAPAY_CALLBACK_URL: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
