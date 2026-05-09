import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createReviewSchema, providerIdParamSchema } from './reviews.schema';
import { reviewsController } from './reviews.controller';

export const reviewsRouter = Router();

reviewsRouter.post('/', protect, validate(createReviewSchema), reviewsController.create);
reviewsRouter.get('/provider/:providerId', validate(providerIdParamSchema), reviewsController.listForProvider);
