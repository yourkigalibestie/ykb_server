import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { bookingsService } from './bookings.service';

export const bookingsController = {
    create: asyncHandler(async (req: Request, res: Response) => {
        const body = req.validated?.body;
        const booking = await bookingsService.create(req.auth!, body);
        res.status(201).json({ booking });
    }),

    listMine: asyncHandler(async (req: Request, res: Response) => {
        const bookings = await bookingsService.listForMe(req.auth!);
        res.status(200).json({ bookings });
    }),

    get: asyncHandler(async (req: Request, res: Response) => {
        const bookingId = req.validated?.params?.bookingId;
        const booking = await bookingsService.get(req.auth!, bookingId);
        res.status(200).json({ booking });
    }),

    confirm: asyncHandler(async (req: Request, res: Response) => {
        const bookingId = req.validated?.params?.bookingId;
        const booking = await bookingsService.confirm(req.auth!, bookingId);
        res.status(200).json({ booking });
    }),

    complete: asyncHandler(async (req: Request, res: Response) => {
        const bookingId = req.validated?.params?.bookingId;
        const booking = await bookingsService.complete(req.auth!, bookingId);
        res.status(200).json({ booking });
    }),

    cancel: asyncHandler(async (req: Request, res: Response) => {
        const bookingId = req.validated?.params?.bookingId;
        const booking = await bookingsService.cancel(req.auth!, bookingId);
        res.status(200).json({ booking });
    })
};
