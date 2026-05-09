import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { uploadsService } from './uploads.service';

export const uploadsController = {
    uploadProviderProfileImage: asyncHandler(async (req: Request, res: Response) => {
        console.log('Upload provider image request:', {
            fileSize: req.file?.size,
            fileType: req.file?.mimetype,
            userId: (req as any).auth?.userId,
            userRole: (req as any).auth?.role,
        });
        const upload = await uploadsService.uploadImage(req.file, 'you-kigali-bestie/providers');
        console.log('Upload result:', upload);
        res.status(201).json({ upload });
    }),

    uploadServiceImage: asyncHandler(async (req: Request, res: Response) => {
        console.log('Upload service image request:', {
            fileSize: req.file?.size,
            fileType: req.file?.mimetype,
            userId: (req as any).auth?.userId,
            userRole: (req as any).auth?.role,
        });
        const upload = await uploadsService.uploadImage(req.file, 'you-kigali-bestie/services');
        console.log('Upload result:', upload);
        res.status(201).json({ upload });
    })
};
