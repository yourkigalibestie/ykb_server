import { AppError } from '../../utils/appError';
import { usersRepository } from './users.repository';
import { authRepository } from '../auth/auth.repository';
import type { SafeUser, UpdateMeInput, ChangeEmailInput } from './users.types';
import { sendEmail, buildVerificationEmail } from '../../utils/email';
import { randomBytes } from 'crypto';
import { prisma } from '../../config/prisma';

const toSafeUser = (user: any): SafeUser => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;
    return rest;
};

export const usersService = {
    getMe: async (userId: string): Promise<SafeUser> => {
        const user = await usersRepository.findById(userId);
        if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
        return toSafeUser(user);
    },

    updateMe: async (userId: string, input: UpdateMeInput): Promise<SafeUser> => {
        const user = await usersRepository.findById(userId);
        if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

        // Handle email change separately
        if (input.email && input.email !== user.email) {
            const existing = await usersRepository.findByEmail(input.email);
            if (existing) {
                throw new AppError('Email already in use', 409, 'CONFLICT');
            }
            // Don't update email directly - require verification
            throw new AppError('Email change requires verification. Use /users/change-email endpoint', 400, 'BAD_REQUEST');
        }

        const updateData: any = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.phone !== undefined) updateData.phone = input.phone;

        const updated = await usersRepository.updateById(userId, updateData);
        return toSafeUser(updated);
    },

    requestEmailChange: async (userId: string, newEmail: string): Promise<void> => {
        const user = await usersRepository.findById(userId);
        if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

        if (newEmail === user.email) {
            throw new AppError('New email must be different from current email', 400, 'BAD_REQUEST');
        }

        const existing = await usersRepository.findByEmail(newEmail);
        if (existing) {
            throw new AppError('Email already in use', 409, 'CONFLICT');
        }

        const code = randomBytes(3).toString('hex').toUpperCase(); // 6-char code
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await authRepository.upsertEmailVerificationRequest(newEmail, code, expiresAt);

        if (!process.env.RESEND_EMAIL_API_KEY) {
            if (process.env.NODE_ENV === 'production') {
                throw new AppError('Email service not configured', 503, 'SERVICE_UNAVAILABLE');
            }
            console.log(`[DEV] Email verification code for ${newEmail}: ${code}`);
            return;
        }

        await sendEmail({
            to: newEmail,
            subject: 'Verify your new email - Kigali Bespoke Concierge',
            html: buildVerificationEmail(user.name, code),
        });
    },

    verifyAndChangeEmail: async (userId: string, newEmail: string, code: string): Promise<SafeUser> => {
        const user = await usersRepository.findById(userId);
        if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

        const verification = await authRepository.findEmailVerificationRequest(newEmail);
        if (!verification) {
            throw new AppError('No verification request found for this email', 400, 'BAD_REQUEST');
        }

        if (verification.code !== code) {
            throw new AppError('Invalid verification code', 400, 'BAD_REQUEST');
        }

        if (verification.expiresAt < new Date()) {
            throw new AppError('Verification code has expired', 400, 'BAD_REQUEST');
        }

        const existing = await usersRepository.findByEmail(newEmail);
        if (existing && existing.id !== userId) {
            throw new AppError('Email already in use', 409, 'CONFLICT');
        }

        const updated = await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { email: newEmail }
            });

            await tx.emailVerificationRequest.delete({ where: { email: newEmail } });

            return updatedUser;
        });

        return toSafeUser(updated);
    }
};
