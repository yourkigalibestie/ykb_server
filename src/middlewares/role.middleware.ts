import type { NextFunction, Request, Response } from 'express';
import type { Role } from '../utils/prismaEnums';
import { AppError } from '../utils/appError';

export const requireRoles = (...roles: Role[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.auth) {
            return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
        }
        if (!roles.includes(req.auth.role)) {
            return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
        }
        return next();
    };
};
