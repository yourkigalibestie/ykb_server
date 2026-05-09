import { ProviderStatus } from '../../utils/prismaEnums';
import type { RequestStatus } from '../../utils/prismaEnums';
import { prisma } from '../../config/prisma';

export const adminRepository = {
    listBookings: async () => {
        return prisma.booking.findMany({
            include: { customer: true, provider: { include: { user: true } }, service: { include: { category: true } }, payment: true },
            orderBy: { createdAt: 'desc' }
        });
    },

    listPayments: async () => {
        return prisma.payment.findMany({
            include: { booking: { include: { customer: true, provider: { include: { user: true } }, service: true } } },
            orderBy: { createdAt: 'desc' }
        });
    },

    listRequests: async () => {
        return prisma.request.findMany({ 
            include: { 
                user: true,
                provider: { include: { user: true } }
            }, 
            orderBy: { createdAt: 'desc' } 
        });
    },

    listProviders: async () => {
        return prisma.provider.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } });
    },

    getProviderById: async (providerId: string) => {
        return prisma.provider.findUnique({ where: { id: providerId }, include: { user: true } });
    },

    updateProviderStatus: async (providerId: string, status: ProviderStatus, rejectionReason?: string | null) => {
        return prisma.provider.update({
            where: { id: providerId },
            data: {
                status,
                rejectionReason: status === ProviderStatus.REJECTED ? rejectionReason ?? null : null
            },
            include: { user: true }
        });
    },

    updateRequest: async (requestId: string, data: { status: RequestStatus; adminNotes?: string | null }) => {
        return prisma.request.update({ where: { id: requestId }, data, include: { user: true } });
    },

    listUsers: async (role?: string) => {
        const where = role ? { role: role as any } : {};
        return prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                phone: true,
                name: true,
                role: true,
                provider: {
                    select: {
                        id: true,
                        status: true
                    }
                },
                createdAt: true,
                updatedAt: true
            }
        });
    },

    findRequestById: async (requestId: string) => {
        return prisma.request.findUnique({
            where: { id: requestId },
            include: { user: true, provider: { include: { user: true } } }
        });
    },

    getProvidersForService: async (serviceName: string) => {
        return prisma.provider.findMany({
            where: {
                status: ProviderStatus.APPROVED,
                mainService: {
                    contains: serviceName,
                    mode: 'insensitive'
                }
            },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
    },

    assignProviderToRequest: async (requestId: string, providerId: string) => {
        return prisma.request.update({
            where: { id: requestId },
            data: { providerId },
            include: { user: true, provider: { include: { user: true } } }
        });
    },

    confirmRequestResolution: async (requestId: string) => {
        return prisma.request.update({
            where: { id: requestId },
            data: { 
                status: 'RESOLVED',
                adminConfirmedAt: new Date(),
                requiresAdminConfirmation: false
            },
            include: { user: true, provider: { include: { user: true } } }
        });
    },

    markRequestAsResolved: async (requestId: string) => {
        return prisma.request.update({
            where: { id: requestId },
            data: { 
                status: 'RESOLVED',
                adminResolvedAt: new Date(),
                requiresAdminConfirmation: false
            },
            include: { user: true, provider: { include: { user: true } } }
        });
    }
};
