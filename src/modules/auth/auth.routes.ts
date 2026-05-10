import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { authController } from './auth.controller';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, sendVerificationSchema, verifyEmailSchema } from './auth.schema';
import { protect } from '../../middlewares/auth.middleware';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.get('/me', protect, authController.me);
authRouter.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
authRouter.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
authRouter.post('/send-verification', validate(sendVerificationSchema), authController.sendVerification);
authRouter.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);

// Aliases for frontend routes
authRouter.post('/send-reset-code', validate(forgotPasswordSchema), authController.forgotPassword);
authRouter.post('/verify-reset-code', validate(resetPasswordSchema), authController.resetPassword);
authRouter.post('/send-verification-code', validate(sendVerificationSchema), authController.sendVerification);
authRouter.post('/verify-email-code', validate(verifyEmailSchema), authController.verifyEmail);
