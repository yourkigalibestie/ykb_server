import type { Request, Response } from 'express';
import { authService } from './auth.service';
import { asyncHandler } from '../../utils/asyncHandler';

export const authController = {
    register: asyncHandler(async (req: Request, res: Response) => {
        const body = req.validated?.body;
        const result = await authService.register(body);
        res.status(201).json(result);
    }),

    login: asyncHandler(async (req: Request, res: Response) => {
        const body = req.validated?.body;
        const result = await authService.login(body);
        res.status(200).json(result);
    }),

    me: asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.me(req.auth!.userId);
        res.status(200).json({ user: result });
    })
};
