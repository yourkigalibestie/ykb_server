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

    findUserByResetToken: async (token: string): Promise<User | null> => {
        return prisma.user.findUnique({ where: { passwordResetToken: token } });
    },

    findUserByVerificationToken: async (token: string): Promise<User | null> => {
        return prisma.user.findUnique({ where: { emailVerificationToken: token } });
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

    updateUser: async (id: string, data: Partial<User>): Promise<User> => {
        return prisma.user.update({ where: { id }, data });
    },

    upsertEmailVerificationRequest: async (email: string, code: string, expiresAt: Date) => {
        return prisma.emailVerificationRequest.upsert({
            where: { email },
            create: { email, code, expiresAt },
            update: { code, expiresAt, verifiedAt: null }
        });
    },

    findEmailVerificationRequest: async (email: string) => {
        return prisma.emailVerificationRequest.findUnique({ where: { email } });
    },

    markEmailVerificationRequestVerified: async (email: string) => {
        return prisma.emailVerificationRequest.update({
            where: { email },
            data: { verifiedAt: new Date() }
        });
    },

    deleteEmailVerificationRequest: async (email: string) => {
        return prisma.emailVerificationRequest.delete({ where: { email } });
    }
};
