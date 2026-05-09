import { Router } from 'express';
import { Role } from '../../utils/prismaEnums';
import { protect } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { adminController } from './admin.controller';
import { updateRequestSchema, verifyProviderSchema, assignProviderSchema } from './admin.schema';

export const adminRouter = Router();

adminRouter.use(protect, requireRoles(Role.ADMIN));

adminRouter.get('/users', adminController.listUsers);
adminRouter.get('/bookings', adminController.listBookings);
adminRouter.get('/payments', adminController.listPayments);
adminRouter.get('/requests', adminController.listRequests);
adminRouter.get('/providers', adminController.listProviders);
adminRouter.get('/providers/:providerId', adminController.getProviderById);
adminRouter.patch('/providers/:providerId/verify', validate(verifyProviderSchema), adminController.verifyProvider);
adminRouter.patch('/requests/:requestId', validate(updateRequestSchema), adminController.updateRequest);
adminRouter.get('/requests/:requestId/providers', adminController.getProvidersForService);
adminRouter.patch('/requests/:requestId/assign-provider', validate(assignProviderSchema), adminController.assignProviderToRequest);
adminRouter.post('/requests/:requestId/confirm-resolution', adminController.confirmRequestResolution);
adminRouter.post('/requests/:requestId/mark-resolved', adminController.markRequestAsResolved);
