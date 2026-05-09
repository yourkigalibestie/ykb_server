import { prisma } from '../../config/prisma';

export const servicesRepository = {
    listCategories: async () => {
        return prisma.serviceCategory.findMany({ orderBy: { name: 'asc' } });
    },

    createCategory: async (data: { name: string; slug: string }) => {
        return prisma.serviceCategory.create({ data });
    },

    findCategoryById: async (categoryId: string) => {
        return prisma.serviceCategory.findUnique({ where: { id: categoryId } });
    },

    listServices: async () => {
        return prisma.service.findMany({
            include: { category: true, provider: { include: { user: true } }, images: true },
            orderBy: { createdAt: 'desc' }
        });
    },

    findServiceById: async (serviceId: string) => {
        return prisma.service.findUnique({
            where: { id: serviceId },
            include: { category: true, provider: { include: { user: true } }, images: true }
        });
    },

    createService: async (data: {
        categoryId: string;
        title: string;
        description?: string | null;
        basePrice: any;
        currency: string;
        isPlatformOwned: boolean;
        providerId?: string | null;
    }) => {
        return prisma.service.create({
            data,
            include: { category: true, provider: { include: { user: true } }, images: true }
        });
    },

    updateServiceById: async (serviceId: string, data: any) => {
        return prisma.service.update({
            where: { id: serviceId },
            data,
            include: { category: true, provider: { include: { user: true } }, images: true }
        });
    },

    createServiceImage: async (data: { serviceId: string; url: string; publicId: string }) => {
        return prisma.serviceImage.create({
            data,
            include: { service: true }
        });
    },

    deleteServiceImages: async (serviceId: string) => {
        return prisma.serviceImage.deleteMany({
            where: { serviceId }
        });
    },

    addImage: async (serviceId: string, data: { url: string; publicId: string }) => {
        return prisma.serviceImage.create({ data: { serviceId, ...data } });
    },

    findProviderByUserId: async (userId: string) => {
        return prisma.provider.findUnique({ where: { userId } });
    }
};
