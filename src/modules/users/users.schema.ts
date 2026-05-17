import { z } from 'zod';

export const updateMeSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(120).optional(),
        phone: z.string().min(6).max(32).nullable().optional(),
        email: z.string().email().optional()
    })
});

export const changeEmailSchema = z.object({
    body: z.object({
        newEmail: z.string().email(),
        code: z.string().min(1).max(10).optional()
    })
});

export const verifyEmailChangeSchema = z.object({
    body: z.object({
        newEmail: z.string().email(),
        code: z.string().min(1).max(10)
    })
});
