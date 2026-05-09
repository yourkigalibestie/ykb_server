import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { authController } from './auth.controller';
import { loginSchema, registerSchema } from './auth.schema';
import { protect } from '../../middlewares/auth.middleware';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.get('/me', protect, authController.me);
