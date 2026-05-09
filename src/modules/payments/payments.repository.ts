import { prisma } from '../../config/prisma';

export const paymentsRepository = {
    findBookingById: async (bookingId: string) => {
        return prisma.booking.findUnique({
            where: { id: bookingId },
            include: { service: true, payment: true }
        });
    },

    createPayment: async (data: {
        bookingId: string;
        amount: any;
        platformFee: any;
        currency: string;
        processor?: any;
    }) => {
        return prisma.payment.create({
            data,
            include: { booking: { include: { service: true, customer: true, provider: { include: { user: true } } } } }
        });
    },

    listForCustomer: async (customerId: string) => {
        return prisma.payment.findMany({
            where: { booking: { customerId } },
            include: { booking: { include: { service: true } } },
            orderBy: { createdAt: 'desc' }
        });
    },

    listAll: async () => {
        return prisma.payment.findMany({
            include: { booking: { include: { service: true, customer: true, provider: { include: { user: true } } } } },
            orderBy: { createdAt: 'desc' }
        });
    }
};
