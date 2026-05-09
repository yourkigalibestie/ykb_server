import { PaymentProcessor, Role } from '../../utils/prismaEnums';
import { AppError } from '../../utils/appError';
import { env } from '../../config/env';
import { calcFeeFromBps, decimalFromString } from '../../utils/money';
import { paymentsRepository } from './payments.repository';
import type { CreatePaymentInput } from './payments.types';

export const paymentsService = {
    create: async (auth: { userId: string; role: Role }, input: CreatePaymentInput) => {
        const booking = await paymentsRepository.findBookingById(input.bookingId);
        if (!booking) throw new AppError('Booking not found', 404, 'NOT_FOUND');
        if (booking.payment) throw new AppError('Payment already exists for booking', 409, 'CONFLICT');

        if (auth.role !== Role.ADMIN && booking.customerId !== auth.userId) {
            throw new AppError('Forbidden', 403, 'FORBIDDEN');
        }

        const amount = input.amount ? decimalFromString(input.amount) : booking.service.basePrice;
        const platformFee = calcFeeFromBps(amount, env.PLATFORM_FEE_BPS);

        return paymentsRepository.createPayment({
            bookingId: booking.id,
            amount,
            platformFee,
            currency: input.currency ?? booking.service.currency,
            processor: input.processor ?? PaymentProcessor.FLUTTERWAVE
        });
    },

    listMine: async (auth: { userId: string; role: Role }) => {
        if (auth.role === Role.ADMIN) {
            return paymentsRepository.listAll();
        }
        return paymentsRepository.listForCustomer(auth.userId);
    },

    // Reserved for future Flutterwave integration.
    // Intentionally no fake network logic here.
    initializeFlutterwaveCheckout: async () => {
        throw new AppError('Flutterwave integration not implemented', 501, 'NOT_IMPLEMENTED');
    }
};
