import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { Role } from '../../utils/prismaEnums';
import { plansController } from './plans.controller';
import {
  createPlanSchema,
  updatePlanSchema,
  getPlanSchema,
  deletePlanSchema,
} from './plans.schema';

export const plansRouter = Router();

// Public routes
plansRouter.get('/', plansController.getAll);
plansRouter.get('/:id', validate(getPlanSchema), plansController.getById);

// Admin only routes
plansRouter.post(
  '/',
  protect,
  requireRoles(Role.ADMIN),
  validate(createPlanSchema),
  plansController.create
);

plansRouter.put(
  '/:id',
  protect,
  requireRoles(Role.ADMIN),
  validate(updatePlanSchema),
  plansController.update
);

plansRouter.delete(
  '/:id',
  protect,
  requireRoles(Role.ADMIN),
  validate(deletePlanSchema),
  plansController.delete
);
