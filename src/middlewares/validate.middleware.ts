import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const parsed = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query
        });

        if (!parsed.success) {
            return next(parsed.error);
        }

        (req as any).validated = parsed.data;
        return next();
    };
};
