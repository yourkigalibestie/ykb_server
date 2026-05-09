import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { publicServicesController } from './publicServices.controller';
import { createPublicServiceSchema, publicServiceIdSchema, updatePublicServiceSchema } from './publicServices.schema';

export const publicServicesRouter = Router();

publicServicesRouter.get('/', publicServicesController.list);
publicServicesRouter.post('/', validate(createPublicServiceSchema), publicServicesController.create);
publicServicesRouter.patch('/:id', validate(updatePublicServiceSchema), publicServicesController.update);

// If you prefer a separate validation for params-only, uncomment and use:
// publicServicesRouter.get('/:id', validate(publicServiceIdSchema), ...)
