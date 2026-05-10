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
    // Handle both GET (query params) and POST (body) from Pesapal
    const queryData = req.query as Record<string, any>;
    const bodyData = req.body as Record<string, any> || {};

    // Merge both sources, prioritizing POST body over GET query
    const data = { ...queryData, ...bodyData };

    // Extract with proper naming - handle both capitalized and lowercase
    const orderTrackingId = data.OrderTrackingId || data.order_tracking_id || data.orderTrackingId;
    const merchantReference = data.OrderMerchantReference || data.merchant_reference || data.merchantReference;
    const status = data.OrderStatus || data.order_status || data.status;

    console.log('=== PESAPAL CALLBACK RECEIVED ===');
    console.log('Raw Query:', queryData);
    console.log('Raw Body:', bodyData);
    console.log('Extracted - OrderTrackingId:', orderTrackingId);
    console.log('Extracted - MerchantReference:', merchantReference);
    console.log('Extracted - Status:', status);
    console.log('All data keys:', Object.keys(data));
    console.log('===================================');

    const callbackData = {
      order_tracking_id: orderTrackingId,
      merchant_reference: merchantReference,
      status: status,
      ...data,
    };

    try {
      await SubscriptionsService.handlePesapalCallback(callbackData);
      res.status(200).json({ message: 'Callback processed successfully' });
    } catch (error: any) {
      console.error('Pesapal callback error:', error);
      throw new AppError(error.message, 400);
    }
  }),

  checkPaymentStatus: asyncHandler(async (req: Request, res: Response) => {
    const orderTrackingId = req.query.orderTrackingId as string;

    if (!orderTrackingId) {
      throw new AppError('Order tracking ID is required', 400);
    }

    const subscription = await SubscriptionsService.checkPaymentStatus(orderTrackingId);
    res.status(200).json(subscription);
  }),
};
