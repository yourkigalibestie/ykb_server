import { Role } from '../../utils/prismaEnums';
import { AppError } from '../../utils/appError';
import { signAccessToken } from '../../utils/jwt';
import { hashPassword, verifyPassword } from '../../utils/password';
import { authRepository } from './auth.repository';
import type { AuthResult, LoginInput, RegisterInput, SafeUser } from './auth.types';
import { prisma } from '../../config/prisma';
import type { Prisma } from '@prisma/client';

const toSafeUser = (user: any): SafeUser => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;
    return rest;
};

export const authService = {
    register: async (input: RegisterInput): Promise<AuthResult> => {
        const existing = await authRepository.findUserByEmail(input.email);
        if (existing) {
            throw new AppError('Email already in use', 409, 'CONFLICT');
        }

        const role: Role = input.role ?? Role.CUSTOMER;

        const passwordHash = await hashPassword(input.password);

        const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const created = await tx.user.create({
                data: {
                    email: input.email,
                    phone: input.phone,
                    name: input.name,
                    passwordHash,
                    role
                }
            });

            if (role === Role.PROVIDER) {
                await tx.provider.create({
                    data: {
                        userId: created.id,
                        businessName: input.businessName,
                        mainService: input.service,
                        location: input.location,
                        moneyRange: input.moneyRange,
                        serviceOfferings: input.services ?? undefined
                    }
                });
            }

            return created;
        });

        const accessToken = signAccessToken({ sub: user.id, role: user.role });
        return { user: toSafeUser(user), accessToken };
    },

    login: async (input: LoginInput): Promise<AuthResult> => {
        const user = await authRepository.findUserByEmail(input.email);
        if (!user) {
            throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED');
        }

        const ok = await verifyPassword(input.password, user.passwordHash);
        if (!ok) {
            throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED');
        }

        const accessToken = signAccessToken({ sub: user.id, role: user.role });
        return { user: toSafeUser(user), accessToken };
    },

    me: async (userId: string): Promise<SafeUser> => {
        const user = await authRepository.findUserById(userId);
        if (!user) {
            throw new AppError('User not found', 404, 'NOT_FOUND');
        }
        return toSafeUser(user);
    }
};
