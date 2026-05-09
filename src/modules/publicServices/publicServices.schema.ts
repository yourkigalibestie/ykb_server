import { z } from 'zod';

export const createPublicServiceSchema = z.object({
    body: z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        imageUrl: z.string().url().optional().nullable(),
        imagePublicId: z.string().optional().nullable()
    })
});

export const publicServiceIdSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive()
    })
});

export const updatePublicServiceSchema = z.object({
    params: publicServiceIdSchema.shape.params,
    body: z
        .object({
            title: z.string().min(1).optional(),
            description: z.string().min(1).optional(),
            imageUrl: z.string().url().optional().nullable(),
            imagePublicId: z.string().optional().nullable()
        })
        .refine((val) => Object.keys(val).length > 0, { message: 'At least one field is required' })
});
