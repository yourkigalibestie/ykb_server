import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { providersController } from './providers.controller';
import { updateProviderMeSchema, verifyProviderSchema } from './providers.schema';
import { Role } from '../../utils/prismaEnums';

export const providersRouter = Router();

providersRouter.get('/me/profile', protect, requireRoles(Role.PROVIDER), providersController.me);
providersRouter.patch('/me/profile', protect, requireRoles(Role.PROVIDER), validate(updateProviderMeSchema), providersController.updateMe);

providersRouter.get('/', providersController.list);
providersRouter.get('/:providerId', providersController.getById);

providersRouter.patch('/:providerId/verify', protect, requireRoles(Role.ADMIN), validate(verifyProviderSchema), providersController.verify);
