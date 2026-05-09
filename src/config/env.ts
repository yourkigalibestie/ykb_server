import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.string().min(1),
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
