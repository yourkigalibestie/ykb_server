import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { paymentsController } from './payments.controller';
import { createPaymentSchema } from './payments.schema';

export const paymentsRouter = Router();

paymentsRouter.post('/', protect, validate(createPaymentSchema), paymentsController.create);
paymentsRouter.get('/me', protect, paymentsController.listMine);
