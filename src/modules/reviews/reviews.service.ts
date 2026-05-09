import { BookingStatus, Role } from '../../utils/prismaEnums';
import { AppError } from '../../utils/appError';
import { reviewsRepository } from './reviews.repository';
import type { CreateReviewInput } from './reviews.types';

export const reviewsService = {
    create: async (auth: { userId: string; role: Role }, input: CreateReviewInput) => {
        if (auth.role !== Role.CUSTOMER && auth.role !== Role.ADMIN) {
            throw new AppError('Only customers can create reviews', 403, 'FORBIDDEN');
        }

        const booking = await reviewsRepository.findBookingById(input.bookingId);
        if (!booking) throw new AppError('Booking not found', 404, 'NOT_FOUND');
        if (booking.review) throw new AppError('Review already exists for booking', 409, 'CONFLICT');
        if (auth.role !== Role.ADMIN && booking.customerId !== auth.userId) {
            throw new AppError('Forbidden', 403, 'FORBIDDEN');
        }
        if (booking.status !== BookingStatus.COMPLETED) {
            throw new AppError('Only completed bookings can be reviewed', 400, 'INVALID_STATE');
        }
        if (!booking.providerId) {
            throw new AppError('Cannot review a booking without a provider', 400, 'VALIDATION_ERROR');
        }

        return reviewsRepository.create({
            bookingId: booking.id,
            userId: auth.userId,
            providerId: booking.providerId,
            rating: input.rating,
            comment: input.comment
        });
    },

    listForProvider: async (providerId: string) => {
        return reviewsRepository.listForProvider(providerId);
    }
};
