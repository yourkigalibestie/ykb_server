import { BookingStatus, ProviderStatus, Role } from '../../utils/prismaEnums';
import { AppError } from '../../utils/appError';
import { bookingsRepository } from './bookings.repository';
import type { CreateBookingInput } from './bookings.types';

const canViewBooking = (auth: { userId: string; role: Role }, booking: any, providerIdForAuth?: string | null) => {
    if (auth.role === Role.ADMIN) return true;
    if (booking.customerId === auth.userId) return true;
    if (providerIdForAuth && booking.providerId && booking.providerId === providerIdForAuth) return true;
    return false;
};

export const bookingsService = {
    create: async (auth: { userId: string; role: Role }, input: CreateBookingInput) => {
        if (auth.role !== Role.CUSTOMER && auth.role !== Role.ADMIN) {
            throw new AppError('Only customers can create bookings', 403, 'FORBIDDEN');
        }

        const service = await bookingsRepository.findServiceById(input.serviceId);
        if (!service) throw new AppError('Service not found', 404, 'NOT_FOUND');

        let providerId: string | null | undefined = null;

        if (service.providerId) {
            providerId = service.providerId;
            if (input.providerId && input.providerId !== providerId) {
                throw new AppError('providerId does not match the service provider', 400, 'VALIDATION_ERROR');
            }
        } else {
            providerId = input.providerId ?? null;
            if (providerId) {
                const provider = await bookingsRepository.findProviderById(providerId);
                if (!provider) throw new AppError('Provider not found', 404, 'NOT_FOUND');
                if (provider.status !== ProviderStatus.APPROVED) {
                    throw new AppError('Provider is not approved', 403, 'FORBIDDEN');
                }
            }
        }

        const scheduledAt = new Date(input.date);
        if (Number.isNaN(scheduledAt.getTime())) {
            throw new AppError('Invalid date', 400, 'VALIDATION_ERROR');
        }

        return bookingsRepository.create({
            customerId: auth.userId,
            providerId,
            serviceId: input.serviceId,
            scheduledAt,
            location: input.location,
            notes: input.notes
        });
    },

    get: async (auth: { userId: string; role: Role }, bookingId: string) => {
        const booking = await bookingsRepository.findById(bookingId);
        if (!booking) throw new AppError('Booking not found', 404, 'NOT_FOUND');

        const provider = auth.role === Role.PROVIDER ? await bookingsRepository.findProviderByUserId(auth.userId) : null;
        const providerIdForAuth = provider?.id ?? null;

        if (!canViewBooking(auth, booking, providerIdForAuth)) {
            throw new AppError('Forbidden', 403, 'FORBIDDEN');
        }

        return booking;
    },

    listForMe: async (auth: { userId: string; role: Role }) => {
        if (auth.role === Role.ADMIN) {
            return bookingsRepository.listAll();
        }

        if (auth.role === Role.CUSTOMER) {
            return bookingsRepository.listForCustomer(auth.userId);
        }

        if (auth.role === Role.PROVIDER) {
            const provider = await bookingsRepository.findProviderByUserId(auth.userId);
            if (!provider) throw new AppError('Provider profile not found', 404, 'NOT_FOUND');
            return bookingsRepository.listForProvider(provider.id);
        }

        return [];
    },

    confirm: async (auth: { userId: string; role: Role }, bookingId: string) => {
        const booking = await bookingsRepository.findById(bookingId);
        if (!booking) throw new AppError('Booking not found', 404, 'NOT_FOUND');

        if (booking.status !== BookingStatus.PENDING) {
            throw new AppError('Only PENDING bookings can be confirmed', 400, 'INVALID_STATE');
        }

        if (auth.role !== Role.ADMIN) {
            if (auth.role !== Role.PROVIDER) throw new AppError('Forbidden', 403, 'FORBIDDEN');
            const provider = await bookingsRepository.findProviderByUserId(auth.userId);
            if (!provider) throw new AppError('Provider profile not found', 404, 'NOT_FOUND');
            if (!booking.providerId) throw new AppError('Booking has no assigned provider', 400, 'INVALID_STATE');
            if (booking.providerId !== provider.id) throw new AppError('Forbidden', 403, 'FORBIDDEN');
        }

        return bookingsRepository.updateStatus(bookingId, BookingStatus.CONFIRMED);
    },

    complete: async (auth: { userId: string; role: Role }, bookingId: string) => {
        const booking = await bookingsRepository.findById(bookingId);
        if (!booking) throw new AppError('Booking not found', 404, 'NOT_FOUND');

        if (booking.status !== BookingStatus.CONFIRMED) {
            throw new AppError('Only CONFIRMED bookings can be completed', 400, 'INVALID_STATE');
        }

        if (auth.role !== Role.ADMIN) {
            if (auth.role !== Role.PROVIDER) throw new AppError('Forbidden', 403, 'FORBIDDEN');
            const provider = await bookingsRepository.findProviderByUserId(auth.userId);
            if (!provider) throw new AppError('Provider profile not found', 404, 'NOT_FOUND');
            if (!booking.providerId) throw new AppError('Booking has no assigned provider', 400, 'INVALID_STATE');
            if (booking.providerId !== provider.id) throw new AppError('Forbidden', 403, 'FORBIDDEN');
        }

        return bookingsRepository.updateStatus(bookingId, BookingStatus.COMPLETED);
    },

    cancel: async (auth: { userId: string; role: Role }, bookingId: string) => {
        const booking = await bookingsRepository.findById(bookingId);
        if (!booking) throw new AppError('Booking not found', 404, 'NOT_FOUND');

        if (booking.status === BookingStatus.COMPLETED) {
            throw new AppError('Completed bookings cannot be cancelled', 400, 'INVALID_STATE');
        }

        if (auth.role !== Role.ADMIN) {
            if (auth.role === Role.CUSTOMER) {
                if (booking.customerId !== auth.userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
            } else if (auth.role === Role.PROVIDER) {
                const provider = await bookingsRepository.findProviderByUserId(auth.userId);
                if (!provider) throw new AppError('Provider profile not found', 404, 'NOT_FOUND');
                if (!booking.providerId || booking.providerId !== provider.id) throw new AppError('Forbidden', 403, 'FORBIDDEN');
            } else {
                throw new AppError('Forbidden', 403, 'FORBIDDEN');
            }
        }

        return bookingsRepository.updateStatus(bookingId, BookingStatus.CANCELLED);
    }
};
