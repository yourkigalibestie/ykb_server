import { prisma } from '../../config/prisma';

export const reviewsRepository = {
    findBookingById: async (bookingId: string) => {
        return prisma.booking.findUnique({
            where: { id: bookingId },
            include: { review: true }
        });
    },

    create: async (data: any) => {
        return prisma.review.create({
            data,
            include: { provider: { include: { user: true } }, user: true, booking: true }
        });
    },

    listForProvider: async (providerId: string) => {
        return prisma.review.findMany({
            where: { providerId },
            include: { user: true, booking: true },
            orderBy: { createdAt: 'desc' }
        });
    }
};
