import type { User } from '@prisma/client';
import type { Role } from '../../utils/prismaEnums';
import { prisma } from '../../config/prisma';

export const authRepository = {
    findUserByEmail: async (email: string): Promise<User | null> => {
        return prisma.user.findUnique({ where: { email } });
    },

    findUserById: async (id: string): Promise<User | null> => {
        return prisma.user.findUnique({ where: { id } });
    },

    createUser: async (data: {
        email: string;
        phone?: string;
        name: string;
        passwordHash: string;
        role: Role;
    }): Promise<User> => {
        return prisma.user.create({ data });
    },

    createProviderForUser: async (userId: string) => {
        return prisma.provider.create({ data: { userId } });
    }
};
