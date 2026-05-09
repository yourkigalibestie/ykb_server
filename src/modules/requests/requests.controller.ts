import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requestsService } from './requests.service';

export const requestsController = {
    create: asyncHandler(async (req: Request, res: Response) => {
        const body = req.validated?.body;
        const request = await requestsService.create(req.auth!, body);
        res.status(201).json({ request });
    }),

    listMine: asyncHandler(async (req: Request, res: Response) => {
        const requests = await requestsService.listMine(req.auth!);
        res.status(200).json({ requests });
    }),

    listAssignedToMe: asyncHandler(async (req: Request, res: Response) => {
        const requests = await requestsService.listAssignedToMe(req.auth!);
        res.status(200).json({ requests });
    }),

    updateMine: asyncHandler(async (req: Request, res: Response) => {
        const requestId = req.validated?.params?.requestId;
        const body = req.validated?.body;
        const request = await requestsService.updateMine(req.auth!, requestId, body);
        res.status(200).json({ request });
    }),

    addNoteMine: asyncHandler(async (req: Request, res: Response) => {
        const requestId = req.validated?.params?.requestId;
        const note = req.validated?.body?.note;
        const request = await requestsService.addNoteMine(req.auth!, requestId, note);
        res.status(200).json({ request });
    }),

    providerMarkResolved: asyncHandler(async (req: Request, res: Response) => {
        const requestId = req.params.requestId;
        const request = await requestsService.providerMarkResolved(req.auth!, requestId);
        res.status(200).json({ request });
    }),

    customerRateRequest: asyncHandler(async (req: Request, res: Response) => {
        const requestId = req.params.requestId;
        const rating = req.validated?.body?.rating;
        const request = await requestsService.customerRateRequest(req.auth!, requestId, rating);
        res.status(200).json({ request });
    })
};
