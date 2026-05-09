import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { reviewsService } from './reviews.service';

export const reviewsController = {
    create: asyncHandler(async (req: Request, res: Response) => {
        const body = req.validated?.body;
        const review = await reviewsService.create(req.auth!, body);
        res.status(201).json({ review });
    }),

    listForProvider: asyncHandler(async (req: Request, res: Response) => {
        const providerId = req.validated?.params?.providerId;
        const reviews = await reviewsService.listForProvider(providerId);
        res.status(200).json({ reviews });
    })
};
