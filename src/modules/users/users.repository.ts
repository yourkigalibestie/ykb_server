import type { User } from '@prisma/client';
import { prisma } from '../../config/prisma';

export const usersRepository = {
    findById: async (id: string): Promise<User | null> => {
        return prisma.user.findUnique({ where: { id } });
    },

    updateById: async (id: string, data: { name?: string; phone?: string | null }): Promise<User> => {
        return prisma.user.update({ where: { id }, data });
    }
};
