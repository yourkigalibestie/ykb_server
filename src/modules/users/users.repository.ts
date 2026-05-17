import type { User } from '@prisma/client';
import { prisma } from '../../config/prisma';

export const usersRepository = {
    findById: async (id: string): Promise<User | null> => {
        return prisma.user.findUnique({ where: { id } });
    },

    findByEmail: async (email: string): Promise<User | null> => {
        return prisma.user.findUnique({ where: { email } });
    },

    updateById: async (id: string, data: { name?: string; phone?: string | null; email?: string; emailVerified?: boolean }): Promise<User> => {
        return prisma.user.update({ where: { id }, data });
    }
};
