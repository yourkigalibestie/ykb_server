import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { providersService } from './providers.service';

export const providersController = {
    list: asyncHandler(async (_req: Request, res: Response) => {
        const providers = await providersService.listPublic();
        res.status(200).json({ providers });
    }),

    getById: asyncHandler(async (req: Request, res: Response) => {
        const provider = await providersService.getById(req.params.providerId);
        res.status(200).json({ provider });
    }),

    me: asyncHandler(async (req: Request, res: Response) => {
        const provider = await providersService.me(req.auth!.userId);
        res.status(200).json({ provider });
    }),

    updateMe: asyncHandler(async (req: Request, res: Response) => {
        const body = req.validated?.body;
        const provider = await providersService.updateMe(req.auth!.userId, body);
        res.status(200).json({ provider });
    }),

    verify: asyncHandler(async (req: Request, res: Response) => {
        const providerId = req.validated?.params?.providerId;
        const status = req.validated?.body?.status;
        const rejectionReason = req.validated?.body?.rejectionReason;
        const provider = await providersService.verify(providerId, status, rejectionReason);
        res.status(200).json({ provider });
    })
};
