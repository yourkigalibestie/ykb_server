import { z } from 'zod';

export const createCategorySchema = z.object({
    body: z.object({
        name: z.string().min(2).max(120)
    })
});

export const createServiceSchema = z.object({
    body: z.object({
        categoryId: z.string().min(1),
        title: z.string().min(2).max(200),
        description: z.string().max(5000).nullable().optional(),
        basePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'basePrice must be a decimal string'),
        currency: z.string().min(3).max(3).optional(),
        isPlatformOwned: z.boolean().optional(),
        imageUrl: z.string().url().nullable().optional(),
        imagePublicId: z.string().nullable().optional()
    })
});

export const updateServiceSchema = z.object({
    params: z.object({ serviceId: z.string().min(1) }),
    body: z.object({
        categoryId: z.string().min(1).optional(),
        title: z.string().min(2).max(200).optional(),
        description: z.string().max(5000).nullable().optional(),
        basePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'basePrice must be a decimal string').optional(),
        currency: z.string().min(3).max(3).optional(),
        imageUrl: z.string().url().nullable().optional(),
        imagePublicId: z.string().nullable().optional()
    })
});

export const addServiceImageSchema = z.object({
    params: z.object({ serviceId: z.string().min(1) }),
    body: z.object({
        url: z.string().url(),
        publicId: z.string().min(1)
    })
});
