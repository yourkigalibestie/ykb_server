import { z } from 'zod';

export const translatorIdSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive()
    })
});

const baseTranslatorBodySchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(5),
    profileImageUrl: z.string().url().optional().nullable(),
    profileImagePublicId: z.string().min(1).optional().nullable(),
    languageIds: z.array(z.coerce.number().int().positive()).default([])
});

export const listTranslatorsSchema = z.object({
    query: z.object({
        languageId: z.coerce.number().int().positive().optional()
    })
});

export const createTranslatorSchema = z.object({
    body: baseTranslatorBodySchema
});

export const updateTranslatorSchema = z.object({
    params: translatorIdSchema.shape.params,
    body: baseTranslatorBodySchema
        .partial()
        .refine((val) => Object.keys(val).length > 0, { message: 'At least one field is required' })
});
