import type { PaymentProcessor } from '../../utils/prismaEnums';

export type CreatePaymentInput = {
    bookingId: string;
    amount?: string;
    currency?: string;
    processor?: PaymentProcessor;
};
