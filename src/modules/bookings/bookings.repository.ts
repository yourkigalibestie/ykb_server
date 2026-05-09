import { prisma } from '../../config/prisma';
import type { BookingStatus } from '../../utils/prismaEnums';

export const bookingsRepository = {
    create: async (data: {
        customerId: string;
        providerId?: string | null;
        serviceId: string;
        scheduledAt: Date;
        location: string;
        notes?: string | null;
    }) => {
        return prisma.booking.create({
            data,
            include: {
                customer: true,
                provider: { include: { user: true } },
                service: { include: { category: true } },
                payment: true
            }
        });
    },

    findById: async (bookingId: string) => {
        return prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                customer: true,
                provider: { include: { user: true } },
                service: { include: { category: true } },
                payment: true,
                review: true
            }
        });
    },

    listForCustomer: async (customerId: string) => {
        return prisma.booking.findMany({
            where: { customerId },
            include: {
                provider: { include: { user: true } },
                service: { include: { category: true } },
                payment: true
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    listForProvider: async (providerId: string) => {
        return prisma.booking.findMany({
            where: { providerId },
            include: {
                customer: true,
                service: { include: { category: true } },
                payment: true
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    listAll: async () => {
        return prisma.booking.findMany({
            include: {
                customer: true,
                provider: { include: { user: true } },
                service: { include: { category: true } },
                payment: true
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    updateStatus: async (bookingId: string, status: BookingStatus) => {
        return prisma.booking.update({
            where: { id: bookingId },
            data: { status },
            include: {
                customer: true,
                provider: { include: { user: true } },
                service: { include: { category: true } },
                payment: true,
                review: true
            }
        });
    },

    findServiceById: async (serviceId: string) => {
        return prisma.service.findUnique({
            where: { id: serviceId },
            include: { provider: true }
        });
    },

    findProviderById: async (providerId: string) => {
        return prisma.provider.findUnique({ where: { id: providerId } });
    },

    findProviderByUserId: async (userId: string) => {
        return prisma.provider.findUnique({ where: { userId } });
    }
};
