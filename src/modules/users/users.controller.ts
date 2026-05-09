import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { usersService } from './users.service';

export const usersController = {
    me: asyncHandler(async (req: Request, res: Response) => {
        const user = await usersService.getMe(req.auth!.userId);
        res.status(200).json({ user });
    }),

    updateMe: asyncHandler(async (req: Request, res: Response) => {
        const body = req.validated?.body;
        const user = await usersService.updateMe(req.auth!.userId, body);
        res.status(200).json({ user });
    })
};
