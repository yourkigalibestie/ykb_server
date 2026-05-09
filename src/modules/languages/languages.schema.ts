import { z } from 'zod';

const pricesSchema = z
    .record(z.string().min(1), z.coerce.number().positive())
    .refine((val) => Object.keys(val).length > 0, { message: 'At least one price is required' });

export const createLanguageSchema = z.object({
    body: z.object({
        title: z.string().min(1),
        prices: pricesSchema
    })
});

export const languageIdSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive()
    })
});

export const updateLanguageSchema = z.object({
    params: languageIdSchema.shape.params,
    body: z
        .object({
            title: z.string().min(1).optional(),
            prices: pricesSchema.optional()
        })
        .refine((val) => Object.keys(val).length > 0, { message: 'At least one field is required' })
});
