import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { publicServicesService } from './publicServices.service';

export const publicServicesController = {
    list: asyncHandler(async (_req: Request, res: Response) => {
        const services = await publicServicesService.list();
        res.status(200).json({ services });
    }),

    create: asyncHandler(async (req: Request, res: Response) => {
        const body = req.validated?.body;
        const service = await publicServicesService.create(body);
        res.status(201).json({ service });
    }),

    update: asyncHandler(async (req: Request, res: Response) => {
        const id = req.validated?.params?.id;
        const body = req.validated?.body;
        const service = await publicServicesService.update(id, body);
        res.status(200).json({ service });
    })
};
