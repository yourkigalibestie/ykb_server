import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { SubscriptionsService } from './subscriptions.service';
import { AppError } from '../../utils/appError';
import { providersRepository } from '../providers/providers.repository';

export const subscriptionsController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth!.userId;
    const provider = await providersRepository.findByUserId(userId);
    if (!provider) {
      throw new AppError('Provider profile not found', 404, 'NOT_FOUND');
    }
    const body = req.validated?.body;

    const result = await SubscriptionsService.createSubscription(provider.id, {
      planId: body.planId,
      currency: body.currency,
      paymentMethod: body.paymentMethod,
      paymentDetails: body.paymentDetails,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
    });

    res.status(201).json(result);
  }),

  getMySubscriptions: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth!.userId;
    const provider = await providersRepository.findByUserId(userId);
    if (!provider) {
      throw new AppError('Provider profile not found', 404, 'NOT_FOUND');
    }
    const subscriptions = await SubscriptionsService.getProviderSubscriptions(provider.id);
    res.status(200).json({ subscriptions });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.validated?.params;
    const subscription = await SubscriptionsService.getSubscriptionById(id);

    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }

    // Verify that the user is the subscription owner or an admin
    if (req.auth!.role !== 'ADMIN') {
      const provider = await providersRepository.findByUserId(req.auth!.userId);
      if (!provider || provider.id !== subscription.providerId) {
        throw new AppError('Unauthorized access to this subscription', 403);
      }
    }

    res.status(200).json({ subscription });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.validated?.params;
    const body = req.validated?.body;

    const subscription = await SubscriptionsService.getSubscriptionById(id);
    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }

    // Only admins can update subscriptions
    if (req.auth!.role !== 'ADMIN') {
      throw new AppError('Only admins can update subscriptions', 403);
    }

    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.pesapalOrderTrackingId) updateData.pesapalOrderTrackingId = body.pesapalOrderTrackingId;
    if (body.pesapalMerchantReference) updateData.pesapalMerchantReference = body.pesapalMerchantReference;
    if (body.pesapalStatus) updateData.pesapalStatus = body.pesapalStatus;
    if (body.paymentDetails) updateData.paymentDetails = body.paymentDetails;
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.endDate) updateData.endDate = new Date(body.endDate);

    const updated = await SubscriptionsService.updateSubscription(id, updateData);
    res.status(200).json({ subscription: updated });
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.validated?.params;
    const subscription = await SubscriptionsService.getSubscriptionById(id);

    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }

    // Verify that the user is the subscription owner or an admin
    if (req.auth!.role !== 'ADMIN') {
      const provider = await providersRepository.findByUserId(req.auth!.userId);
      if (!provider || provider.id !== subscription.providerId) {
        throw new AppError('Unauthorized to cancel this subscription', 403);
      }
    }

    const cancelled = await SubscriptionsService.cancelSubscription(id);
    res.status(200).json({ subscription: cancelled });
  }),

  pesapalCallback: asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;

    // In a real application, you should verify the callback signature
    // For now, we'll just process the callback
    try {
      await SubscriptionsService.handlePesapalCallback(data);
      res.status(200).json({ message: 'Callback processed successfully' });
    } catch (error: any) {
      throw new AppError(error.message, 400);
    }
  }),
};
