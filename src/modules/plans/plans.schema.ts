import { z } from 'zod';

export const createPlanSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255),
    features: z.array(z.string().min(1)).min(1, 'At least one feature is required'),
    feeRwf: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Fee in RWF must be a valid decimal number'),
    feeUsd: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Fee in USD must be a valid decimal number'),
  }),
});

export const updatePlanSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    features: z.array(z.string().min(1)).min(1).optional(),
    feeRwf: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    feeUsd: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getPlanSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const deletePlanSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
