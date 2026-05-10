import { z } from 'zod';

const subcategoriesSchema = z.array(z.string().min(1)).default([]);
const groupSchema = z.enum(['APP', 'INFRASTRUCTURE', 'OTHERS']);

export const createStarterGuideCategorySchema = z.object({
    body: z.object({
        category: z.string().min(1),
        group: groupSchema.optional(),
        subcategories: subcategoriesSchema.optional(),
        description: z.string().optional(),
        imageUrl: z.string().url().optional().or(z.literal('')),
        imagePublicId: z.string().optional(),
        isStarterKit: z.boolean().optional(),
        allowProviderRegistration: z.boolean().optional()
    })
});

export const starterGuideCategoryIdSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive()
    })
});

export const updateStarterGuideCategorySchema = z.object({
    params: starterGuideCategoryIdSchema.shape.params,
    body: z
        .object({
            category: z.string().min(1).optional(),
            group: groupSchema.optional(),
            subcategories: subcategoriesSchema.optional(),
            description: z.string().optional(),
            imageUrl: z.string().url().optional().or(z.literal('')),
            imagePublicId: z.string().optional(),
            isStarterKit: z.boolean().optional(),
            allowProviderRegistration: z.boolean().optional()
        })
        .refine((val) => Object.keys(val).length > 0, { message: 'At least one field is required' })
});
