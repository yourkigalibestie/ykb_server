import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { servicesService } from './services.service';

export const servicesController = {
    listCategories: asyncHandler(async (_req: Request, res: Response) => {
        const categories = await servicesService.listCategories();
        res.status(200).json({ categories });
    }),

    createCategory: asyncHandler(async (req: Request, res: Response) => {
        const body = req.validated?.body;
        const category = await servicesService.createCategory(body);
        res.status(201).json({ category });
    }),

    listServices: asyncHandler(async (_req: Request, res: Response) => {
        const services = await servicesService.listServices();
        res.status(200).json({ services });
    }),

    getService: asyncHandler(async (req: Request, res: Response) => {
        const service = await servicesService.getService(req.params.serviceId);
        res.status(200).json({ service });
    }),

    createService: asyncHandler(async (req: Request, res: Response) => {
        const body = req.validated?.body;
        const service = await servicesService.createService(req.auth!, body);
        res.status(201).json({ service });
    }),

    updateService: asyncHandler(async (req: Request, res: Response) => {
        const serviceId = req.validated?.params?.serviceId;
        const body = req.validated?.body;
        const service = await servicesService.updateService(req.auth!, serviceId, body);
        res.status(200).json({ service });
    }),

    addImage: asyncHandler(async (req: Request, res: Response) => {
        const serviceId = req.validated?.params?.serviceId;
        const body = req.validated?.body;
        const service = await servicesService.addServiceImage(req.auth!, serviceId, body);
        res.status(200).json({ service });
    })
};
