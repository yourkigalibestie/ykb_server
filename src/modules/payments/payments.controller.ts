import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { paymentsService } from './payments.service';

export const paymentsController = {
    create: asyncHandler(async (req: Request, res: Response) => {
        const body = req.validated?.body;
        const payment = await paymentsService.create(req.auth!, body);
        res.status(201).json({ payment });
    }),

    listMine: asyncHandler(async (req: Request, res: Response) => {
        const payments = await paymentsService.listMine(req.auth!);
        res.status(200).json({ payments });
    })
};
