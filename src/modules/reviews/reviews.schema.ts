import { z } from 'zod';

export const createReviewSchema = z.object({
    body: z.object({
        bookingId: z.string().min(1),
        rating: z.number().int().min(1).max(5),
        comment: z.string().max(3000).nullable().optional()
    })
});

export const providerIdParamSchema = z.object({
    params: z.object({ providerId: z.string().min(1) })
});
