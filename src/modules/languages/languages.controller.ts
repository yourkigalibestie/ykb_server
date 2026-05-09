import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { languagesService } from './languages.service';

export const languagesController = {
    list: asyncHandler(async (_req: Request, res: Response) => {
        const languages = await languagesService.list();
        res.status(200).json({ languages });
    }),

    create: asyncHandler(async (req: Request, res: Response) => {
        const body = req.validated?.body;
        const language = await languagesService.create(body);
        res.status(201).json({ language });
    }),

    update: asyncHandler(async (req: Request, res: Response) => {
        const id = req.validated?.params?.id;
        const body = req.validated?.body;
        const language = await languagesService.update(id, body);
        res.status(200).json({ language });
    }),

    remove: asyncHandler(async (req: Request, res: Response) => {
        const id = req.validated?.params?.id;
        const result = await languagesService.remove(id);
        res.status(200).json(result);
    })
};
