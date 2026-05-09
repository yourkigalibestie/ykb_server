import { z } from 'zod';

export const updateMeSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(120).optional(),
        phone: z.string().min(6).max(32).nullable().optional()
    })
});
