import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError';
import { Prisma } from '@prisma/client';

const isPrismaKnownError = (err: unknown): err is Prisma.PrismaClientKnownRequestError => {
    return err instanceof Prisma.PrismaClientKnownRequestError;
};

const isPrismaInitError = (err: unknown): err is Prisma.PrismaClientInitializationError => {
    return err instanceof Prisma.PrismaClientInitializationError;
};

const prismaUniqueTarget = (meta: unknown): string[] => {
    const target = (meta as any)?.target;
    if (Array.isArray(target)) return target.filter((t) => typeof t === 'string') as string[];
    if (typeof target === 'string') return [target];
    return [];
};

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    // Log full error for debugging in development
    // eslint-disable-next-line no-console
    console.error(err);

    if (err instanceof ZodError) {
        return res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: err.flatten()
            }
        });
    }

    if (isPrismaKnownError(err)) {
        if (err.code === 'P2002') {
            const targets = prismaUniqueTarget(err.meta);
            const message =
                targets.includes('email')
                    ? 'Email already in use'
                    : targets.includes('phone')
                      ? 'Phone already in use'
                      : 'Unique constraint violation';
            return res.status(409).json({
                error: {
                    code: 'CONFLICT',
                    message,
                    details: err.meta
                }
            });
        }

        if (err.code === 'P2024') {
            return res.status(503).json({
                error: {
                    code: 'DB_UNAVAILABLE',
                    message: 'Database connection pool is temporarily exhausted. Please try again.'
                }
            });
        }

        return res.status(400).json({
            error: {
                code: 'DB_ERROR',
                message: err.message
            }
        });
    }

    if (isPrismaInitError(err)) {
        // Example: P1001 (Can't reach database server)
        const code = (err as any).errorCode ?? 'DB_UNAVAILABLE';
        const status = code === 'P1001' ? 503 : 500;
        return res.status(status).json({
            error: {
                code: 'DB_UNAVAILABLE',
                message: err.message
            }
        });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: {
                code: err.code,
                message: err.message
            }
        });
    }

    return res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'Something went wrong'
        }
    });
};
