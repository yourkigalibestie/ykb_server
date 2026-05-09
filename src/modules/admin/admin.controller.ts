import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { adminService } from './admin.service';
import { AppError } from '../../utils/appError';

export const adminController = {
    listBookings: asyncHandler(async (_req: Request, res: Response) => {
        const bookings = await adminService.listBookings();
        res.status(200).json({ bookings });
    }),

    listPayments: asyncHandler(async (_req: Request, res: Response) => {
        const payments = await adminService.listPayments();
        res.status(200).json({ payments });
    }),

    listRequests: asyncHandler(async (_req: Request, res: Response) => {
        const requests = await adminService.listRequests();
        res.status(200).json({ requests });
    }),

    listProviders: asyncHandler(async (_req: Request, res: Response) => {
        const providers = await adminService.listProviders();
        res.status(200).json({ providers });
    }),

    getProviderById: asyncHandler(async (req: Request, res: Response) => {
        const providerId = req.params.providerId;
        const provider = await adminService.getProviderById(providerId);
        if (!provider) throw new AppError('Provider not found', 404, 'NOT_FOUND');
        res.status(200).json({ provider });
    }),

    verifyProvider: asyncHandler(async (req: Request, res: Response) => {
        const providerId = req.validated?.params?.providerId;
        const status = req.validated?.body?.status;
        const rejectionReason = req.validated?.body?.rejectionReason;
        const provider = await adminService.verifyProvider(providerId, status, rejectionReason);
        res.status(200).json({ provider });
    }),

    updateRequest: asyncHandler(async (req: Request, res: Response) => {
        const requestId = req.validated?.params?.requestId;
        const status = req.validated?.body?.status;
        const adminNotes = req.validated?.body?.adminNotes;
        const request = await adminService.updateRequest(requestId, status, adminNotes);
        res.status(200).json({ request });
    }),

    listUsers: asyncHandler(async (req: Request, res: Response) => {
        const role = (req.query.role as string) || undefined;
        const users = await adminService.listUsers(role);
        res.status(200).json({ users });
    }),

    getProvidersForService: asyncHandler(async (req: Request, res: Response) => {
        const serviceName = req.query.service as string;
        if (!serviceName) {
            throw new AppError('Service name is required', 400, 'BAD_REQUEST');
        }
        const providers = await adminService.getProvidersForService(serviceName);
        res.status(200).json({ providers });
    }),

    assignProviderToRequest: asyncHandler(async (req: Request, res: Response) => {
        const requestId = req.validated?.params?.requestId;
        const providerId = req.validated?.body?.providerId;
        const request = await adminService.assignProviderToRequest(requestId, providerId);
        res.status(200).json({ request });
    }),

    confirmRequestResolution: asyncHandler(async (req: Request, res: Response) => {
        const requestId = req.params.requestId;
        const request = await adminService.confirmRequestResolution(requestId);
        res.status(200).json({ request });
    }),

    markRequestAsResolved: asyncHandler(async (req: Request, res: Response) => {
        const requestId = req.params.requestId;
        const request = await adminService.markRequestAsResolved(requestId);
        res.status(200).json({ request });
    })
};
