import { Router } from 'express';
import { Role } from '../../utils/prismaEnums';
import { protect } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { servicesController } from './services.controller';
import { addServiceImageSchema, createCategorySchema, createServiceSchema, updateServiceSchema } from './services.schema';

export const servicesRouter = Router();

servicesRouter.get('/categories', servicesController.listCategories);
servicesRouter.post('/categories', protect, requireRoles(Role.ADMIN), validate(createCategorySchema), servicesController.createCategory);

servicesRouter.get('/services', servicesController.listServices);
servicesRouter.get('/services/:serviceId', servicesController.getService);
servicesRouter.post('/services', protect, requireRoles(Role.ADMIN, Role.PROVIDER), validate(createServiceSchema), servicesController.createService);
servicesRouter.patch('/services/:serviceId', protect, requireRoles(Role.ADMIN, Role.PROVIDER), validate(updateServiceSchema), servicesController.updateService);
servicesRouter.post('/services/:serviceId/images', protect, requireRoles(Role.ADMIN, Role.PROVIDER), validate(addServiceImageSchema), servicesController.addImage);
