import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  body: z.object({
    planId: z.string().uuid('Plan ID must be a valid UUID'),
    currency: z.enum(['RWF', 'USD'], { message: 'Currency must be RWF or USD' }),
    paymentMethod: z.enum(['card', 'mobileMoney'], { message: 'Payment method must be card or mobileMoney' }),
    paymentDetails: z.record(z.any()).optional(),
    email: z.string().email('A valid email is required'),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional(),
  }),
});

export const updateSubscriptionSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'ACTIVE', 'CANCELLED', 'EXPIRED']).optional(),
    pesapalOrderTrackingId: z.string().optional(),
    pesapalMerchantReference: z.string().optional(),
    pesapalStatus: z.string().optional(),
    paymentDetails: z.record(z.any()).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const cancelSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
