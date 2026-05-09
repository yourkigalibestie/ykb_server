import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { Role } from '../../utils/prismaEnums';
import { subscriptionsController } from './subscriptions.controller';
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  getSubscriptionSchema,
  cancelSubscriptionSchema,
} from './subscriptions.schema';

export const subscriptionsRouter = Router();

// Create a subscription (providers only)
subscriptionsRouter.post(
  '/',
  protect,
  requireRoles(Role.PROVIDER),
  validate(createSubscriptionSchema),
  subscriptionsController.create
);

// Get my subscriptions (providers only)
subscriptionsRouter.get(
  '/me',
  protect,
  requireRoles(Role.PROVIDER),
  subscriptionsController.getMySubscriptions
);

// Get subscription by ID (provider or admin)
subscriptionsRouter.get(
  '/:id',
  protect,
  validate(getSubscriptionSchema),
  subscriptionsController.getById
);

// Update subscription (admin only)
subscriptionsRouter.put(
  '/:id',
  protect,
  requireRoles(Role.ADMIN),
  validate(updateSubscriptionSchema),
  subscriptionsController.update
);

// Cancel subscription (provider or admin)
subscriptionsRouter.delete(
  '/:id',
  protect,
  requireRoles(Role.PROVIDER, Role.ADMIN),
  validate(cancelSubscriptionSchema),
  subscriptionsController.cancel
);

// Pesapal callback (public - should be secured with signature verification)
subscriptionsRouter.post(
  '/callback/pesapal',
  subscriptionsController.pesapalCallback
);
