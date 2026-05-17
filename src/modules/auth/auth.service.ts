import { randomBytes } from 'crypto';
import { Role } from '../../utils/prismaEnums';
import { AppError } from '../../utils/appError';
import { signAccessToken } from '../../utils/jwt';
import { hashPassword, verifyPassword } from '../../utils/password';
import { authRepository } from './auth.repository';
import type { AuthResult, LoginInput, RegisterInput, SafeUser } from './auth.types';
import { prisma } from '../../config/prisma';
import type { Prisma } from '@prisma/client';
import { sendEmail, buildVerificationEmail, buildPasswordResetEmail } from '../../utils/email';

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
            const verificationMaxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
            const verifiedRequest = await tx.emailVerificationRequest.findUnique({
                where: { email: input.email }
            });
            const emailVerified = Boolean(
                verifiedRequest?.verifiedAt &&
                    verifiedRequest.verifiedAt.getTime() > Date.now() - verificationMaxAgeMs
            );

            const created = await tx.user.create({
                data: {
                    email: input.email,
                    phone: input.phone,
                    name: input.name,
                    passwordHash,
                    role,
                    emailVerified
                }
            });

            if (emailVerified) {
                await tx.emailVerificationRequest.delete({ where: { email: input.email } });
            }

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
    },

    requestPasswordReset: async (email: string): Promise<void> => {
        const user = await authRepository.findUserByEmail(email);
        if (!user) return;

        const token = randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await authRepository.updateUser(user.id, {
            passwordResetToken: token,
            passwordResetExpires: expires,
        });

        const resetUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/reset-password?token=${token}`;
        await sendEmail({
            to: user.email,
            subject: 'Reset your password - Kigali Bespoke Concierge',
            html: buildPasswordResetEmail(user.name, resetUrl),
        });
    },

    resetPassword: async (token: string, newPassword: string): Promise<void> => {
        const user = await authRepository.findUserByResetToken(token);
        if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
            throw new AppError('Invalid or expired reset token', 400, 'BAD_REQUEST');
        }

        const passwordHash = await hashPassword(newPassword);
        await authRepository.updateUser(user.id, {
            passwordHash,
            passwordResetToken: null,
            passwordResetExpires: null,
        });
    },

    sendVerificationEmail: async (email: string): Promise<void> => {
        const user = await authRepository.findUserByEmail(email);
        const code = randomBytes(3).toString('hex').toUpperCase(); // 6-char code

        if (user) {
            if (user.emailVerified) {
                throw new AppError('Email already verified', 400, 'BAD_REQUEST');
            }

            await authRepository.updateUser(user.id, {
                emailVerificationToken: code,
            });
        } else {
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            await authRepository.upsertEmailVerificationRequest(email, code, expiresAt);
        }

        if (!process.env.RESEND_EMAIL_API_KEY) {
            if (process.env.NODE_ENV === 'production') {
                throw new AppError('Email service not configured', 503, 'SERVICE_UNAVAILABLE');
            }

            console.warn('RESEND_EMAIL_API_KEY not set. Email not sent.');
            console.log(`[DEV] Email verification code for ${email}: ${code}`);
            return;
        }

        await sendEmail({
            to: email,
            subject: 'Verify your email - Kigali Bespoke Concierge',
            html: buildVerificationEmail(user?.name ?? email, code),
        });
    },

    verifyEmail: async (email: string, code: string): Promise<void> => {
        const user = await authRepository.findUserByEmail(email);
        const normalizedCode = code.toUpperCase();

        if (user) {
            if (user.emailVerificationToken !== normalizedCode) {
                throw new AppError('Invalid verification code', 400, 'BAD_REQUEST');
            }

            await authRepository.updateUser(user.id, {
                emailVerified: true,
                emailVerificationToken: null,
            });
            return;
        }

        const request = await authRepository.findEmailVerificationRequest(email);
        if (!request) {
            throw new AppError('Invalid verification code', 400, 'BAD_REQUEST');
        }
        if (request.expiresAt < new Date()) {
            throw new AppError('Verification code expired', 400, 'BAD_REQUEST');
        }
        if (request.code !== normalizedCode) {
            throw new AppError('Invalid verification code', 400, 'BAD_REQUEST');
        }

        await authRepository.markEmailVerificationRequestVerified(email);
    },

    sendResetCode: async (email: string): Promise<void> => {
        const user = await authRepository.findUserByEmail(email);
        if (!user) return; // Don't reveal if email exists

        const code = randomBytes(3).toString('hex').toUpperCase(); // 6-char code
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await authRepository.updateUser(user.id, {
            passwordResetToken: code,
            passwordResetExpires: expires,
        });

        if (!process.env.RESEND_EMAIL_API_KEY) {
            if (process.env.NODE_ENV === 'production') {
                throw new AppError('Email service not configured', 503, 'SERVICE_UNAVAILABLE');
            }

            console.warn('RESEND_EMAIL_API_KEY not set. Email not sent.');
            console.log(`[DEV] Password reset code for ${user.email}: ${code}`);
            return;
        }

        await sendEmail({
            to: user.email,
            subject: 'Your password reset code - Kigali Bespoke Concierge',
            html: buildPasswordResetEmail(user.name, code),
        });
    },

    verifyResetCode: async (email: string, code: string): Promise<void> => {
        const user = await authRepository.findUserByEmail(email);
        if (!user) {
            throw new AppError('User not found', 404, 'NOT_FOUND');
        }
        if (user.passwordResetToken !== code) {
            throw new AppError('Invalid reset code', 400, 'BAD_REQUEST');
        }
        if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
            throw new AppError('Reset code expired', 400, 'BAD_REQUEST');
        }
    },

    resetPasswordWithCode: async (email: string, code: string, newPassword: string): Promise<void> => {
        const user = await authRepository.findUserByEmail(email);
        if (!user) {
            throw new AppError('User not found', 404, 'NOT_FOUND');
        }
        if (user.passwordResetToken !== code) {
            throw new AppError('Invalid reset code', 400, 'BAD_REQUEST');
        }
        if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
            throw new AppError('Reset code expired', 400, 'BAD_REQUEST');
        }

        const passwordHash = await hashPassword(newPassword);
        await authRepository.updateUser(user.id, {
            passwordHash,
            passwordResetToken: null,
            passwordResetExpires: null,
        });
    }
};
