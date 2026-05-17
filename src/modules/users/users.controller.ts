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
    }),

    requestEmailChange: asyncHandler(async (req: Request, res: Response) => {
        const newEmail = req.validated?.body?.newEmail;
        await usersService.requestEmailChange(req.auth!.userId, newEmail);
        res.status(200).json({ message: 'Verification code sent to your new email address.' });
    }),

    verifyEmailChange: asyncHandler(async (req: Request, res: Response) => {
        const newEmail = req.validated?.body?.newEmail;
        const code = req.validated?.body?.code;
        const user = await usersService.verifyAndChangeEmail(req.auth!.userId, newEmail, code);
        res.status(200).json({ user, message: 'Email changed successfully.' });
    })
};
