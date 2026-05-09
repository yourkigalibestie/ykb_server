import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { starterGuideCategoriesService } from './starterGuideCategories.service';

export const starterGuideCategoriesController = {
    list: asyncHandler(async (_req: Request, res: Response) => {
        const categories = await starterGuideCategoriesService.list();
        res.status(200).json({ categories });
    }),

    create: asyncHandler(async (req: Request, res: Response) => {
        const body = req.validated?.body;
        const category = await starterGuideCategoriesService.create(body);
        res.status(201).json({ category });
    }),

    update: asyncHandler(async (req: Request, res: Response) => {
        const id = req.validated?.params?.id;
        const body = req.validated?.body;
        const category = await starterGuideCategoriesService.update(id, body);
        res.status(200).json({ category });
    }),

    remove: asyncHandler(async (req: Request, res: Response) => {
        const id = req.validated?.params?.id;
        const result = await starterGuideCategoriesService.remove(id);
        res.status(200).json(result);
    })
};
