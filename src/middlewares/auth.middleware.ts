import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/appError';
import { verifyAccessToken } from '../utils/jwt';

export const protect = (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
    }

    const token = authHeader.slice('Bearer '.length);
    try {
        const payload = verifyAccessToken(token);
        req.auth = { userId: payload.sub, role: payload.role };
        return next();
    } catch {
        return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
    }
};
