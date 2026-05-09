import { z } from 'zod';
import { PaymentProcessor } from '../../utils/prismaEnums';

export const createPaymentSchema = z.object({
    body: z.object({
        bookingId: z.string().min(1),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'amount must be a decimal string').optional(),
        currency: z.string().min(3).max(3).optional(),
        processor: z.nativeEnum(PaymentProcessor).optional()
    })
});
