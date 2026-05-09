import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { addMyRequestNoteSchema, createRequestSchema, updateMyRequestSchema, rateRequestSchema } from './requests.schema';
import { requestsController } from './requests.controller';

export const requestsRouter = Router();

requestsRouter.post('/', protect, validate(createRequestSchema), requestsController.create);
requestsRouter.get('/me', protect, requestsController.listMine);
requestsRouter.get('/assigned/me', protect, requestsController.listAssignedToMe);
requestsRouter.patch('/:requestId', protect, validate(updateMyRequestSchema), requestsController.updateMine);
requestsRouter.post('/:requestId/notes', protect, validate(addMyRequestNoteSchema), requestsController.addNoteMine);
requestsRouter.post('/:requestId/provider-mark-resolved', protect, requestsController.providerMarkResolved);
requestsRouter.post('/:requestId/rate', protect, validate(rateRequestSchema), requestsController.customerRateRequest);
