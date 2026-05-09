import { prisma } from '../../config/prisma';

export const publicServicesRepository = {
    list: async () => {
        return prisma.publicService.findMany({ orderBy: { id: 'asc' } });
    },

    create: async (data: { title: string; description: string; imageUrl?: string | null; imagePublicId?: string | null }) => {
        return prisma.publicService.create({ data });
    },

    findById: async (id: number) => {
        return prisma.publicService.findUnique({ where: { id } });
    },

    updateById: async (id: number, data: { title?: string; description?: string; imageUrl?: string | null; imagePublicId?: string | null }) => {
        return prisma.publicService.update({ where: { id }, data });
    }
};
