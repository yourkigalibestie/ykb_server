import { z } from 'zod';
import { RequestStatus } from '../../utils/prismaEnums';

export const createRequestSchema = z.object({
    body: z.object({
        description: z.string().min(10).max(5000),
        location: z.string().min(2).max(500),
        preferredDate: z.string().datetime().nullable().optional(),
        budget: z.string().regex(/^\d+(\.\d{1,2})?$/, 'budget must be a decimal string').nullable().optional()
    })
});

export const requestIdParamSchema = z.object({
    params: z.object({ requestId: z.string().min(1) })
});

export const updateMyRequestSchema = z.object({
    params: z.object({ requestId: z.string().min(1) }),
    body: z.object({
        description: z.string().min(10).max(5000).optional(),
        location: z.string().min(2).max(500).optional(),
        preferredDate: z.string().datetime().nullable().optional(),
        budget: z.string().regex(/^\d+(\.\d{1,2})?$/, 'budget must be a decimal string').nullable().optional()
    })
});

export const addMyRequestNoteSchema = z.object({
    params: z.object({ requestId: z.string().min(1) }),
    body: z.object({
        note: z.string().min(2).max(3000)
    })
});

export const adminUpdateRequestSchema = z.object({
    params: z.object({ requestId: z.string().min(1) }),
    body: z.object({
        status: z.nativeEnum(RequestStatus),
        adminNotes: z.string().max(3000).nullable().optional()
    })
});

export const rateRequestSchema = z.object({
    params: z.object({ requestId: z.string().min(1) }),
    body: z.object({
        rating: z.number().int().min(1).max(10)
    })
});
