import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { translatorsService } from './translators.service';

export const translatorsController = {
    list: asyncHandler(async (req: Request, res: Response) => {
        const languageId = req.validated?.query?.languageId;
        const translators = await translatorsService.list({ languageId });
        res.status(200).json({ translators });
    }),

    create: asyncHandler(async (req: Request, res: Response) => {
        const body = req.validated?.body;
        const translator = await translatorsService.create(body);
        res.status(201).json({ translator });
    }),

    update: asyncHandler(async (req: Request, res: Response) => {
        const id = req.validated?.params?.id;
        const body = req.validated?.body;
        const translator = await translatorsService.update(id, body);
        res.status(200).json({ translator });
    }),

    remove: asyncHandler(async (req: Request, res: Response) => {
        const id = req.validated?.params?.id;
        const result = await translatorsService.remove(id);
        res.status(200).json(result);
    })
};
