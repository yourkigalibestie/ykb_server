import { z } from 'zod';

export const createBookingSchema = z.object({
    body: z.object({
        providerId: z.string().min(1).nullable().optional(),
        serviceId: z.string().min(1),
        date: z.string().datetime(),
        location: z.string().min(2).max(500),
        notes: z.string().max(3000).nullable().optional()
    })
});

export const bookingIdParamSchema = z.object({
    params: z.object({ bookingId: z.string().min(1) })
});
