import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { usersController } from './users.controller';
import { updateMeSchema } from './users.schema';

export const usersRouter = Router();

usersRouter.get('/me', protect, usersController.me);
usersRouter.patch('/me', protect, validate(updateMeSchema), usersController.updateMe);
