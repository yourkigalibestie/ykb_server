import { prisma } from '../../config/prisma';

export type Prices = Record<string, number>;

export const languagesRepository = {
    list: async () => {
        return prisma.language.findMany({ orderBy: { id: 'asc' } });
    },

    create: async (data: { title: string; prices: Prices }) => {
        return prisma.language.create({ data: { title: data.title, prices: data.prices } });
    },

    findById: async (id: number) => {
        return prisma.language.findUnique({ where: { id } });
    },

    updateById: async (id: number, data: { title?: string; prices?: Prices }) => {
        return prisma.language.update({ where: { id }, data });
    },

    deleteById: async (id: number) => {
        return prisma.language.delete({ where: { id } });
    }
};
