import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { usersController } from './users.controller';
import { updateMeSchema, changeEmailSchema, verifyEmailChangeSchema } from './users.schema';

export const usersRouter = Router();

usersRouter.get('/me', protect, usersController.me);
usersRouter.patch('/me', protect, validate(updateMeSchema), usersController.updateMe);
usersRouter.post('/change-email', protect, validate(changeEmailSchema), usersController.requestEmailChange);
usersRouter.post('/verify-email-change', protect, validate(verifyEmailChangeSchema), usersController.verifyEmailChange);
