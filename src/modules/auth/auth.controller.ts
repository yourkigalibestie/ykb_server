import type { Request, Response } from 'express';
import { authService } from './auth.service';
import { asyncHandler } from '../../utils/asyncHandler';

export const authController = {
    register: asyncHandler(async (req: Request, res: Response) => {
        const body = req.validated?.body;
        const result = await authService.register(body);
        res.status(201).json(result);
    }),

    login: asyncHandler(async (req: Request, res: Response) => {
        const body = req.validated?.body;
        const result = await authService.login(body);
        res.status(200).json(result);
    }),

    me: asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.me(req.auth!.userId);
        res.status(200).json({ user: result });
    }),

    forgotPassword: asyncHandler(async (req: Request, res: Response) => {
        const { email } = req.validated?.body;
        await authService.requestPasswordReset(email);
        res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });
    }),

    resetPassword: asyncHandler(async (req: Request, res: Response) => {
        const { token, password } = req.validated?.body;
        await authService.resetPassword(token, password);
        res.status(200).json({ message: 'Password reset successfully.' });
    }),

    sendVerification: asyncHandler(async (req: Request, res: Response) => {
        const { email } = req.validated?.body;
        await authService.sendVerificationEmail(email);
        res.status(200).json({ message: 'Verification code sent.' });
    }),

    verifyEmail: asyncHandler(async (req: Request, res: Response) => {
        const { email, code } = req.validated?.body;
        await authService.verifyEmail(email, code);
        res.status(200).json({ message: 'Email verified successfully.' });
    }),

    sendResetCode: asyncHandler(async (req: Request, res: Response) => {
        const { email } = req.validated?.body;
        await authService.sendResetCode(email);
        res.status(200).json({ message: 'If an account exists, a reset code has been sent.' });
    }),

    verifyResetCode: asyncHandler(async (req: Request, res: Response) => {
        const { email, code } = req.validated?.body;
        await authService.verifyResetCode(email, code);
        res.status(200).json({ message: 'Code verified successfully.' });
    }),

    resetPasswordWithCode: asyncHandler(async (req: Request, res: Response) => {
        const { email, code, password } = req.validated?.body;
        await authService.resetPasswordWithCode(email, code, password);
        res.status(200).json({ message: 'Password reset successfully.' });
    })
};
