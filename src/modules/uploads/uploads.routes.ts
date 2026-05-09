import { Router } from 'express';
import multer from 'multer';
import { protect } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/role.middleware';
import { Role } from '../../utils/prismaEnums';
import { uploadsController } from './uploads.controller';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadsRouter = Router();

uploadsRouter.post(
    '/provider-profile-image',
    protect,
    requireRoles(Role.PROVIDER),
    upload.single('file'),
    uploadsController.uploadProviderProfileImage
);

uploadsRouter.post(
    '/service-image',
    protect,
    requireRoles(Role.PROVIDER, Role.ADMIN),
    upload.single('file'),
    uploadsController.uploadServiceImage
);
