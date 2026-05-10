import type { CreateSubscriptionInput, UpdateSubscriptionInput, SubscriptionDTO } from './subscriptions.types';
import { SubscriptionsRepository } from './subscriptions.repository';
import { submitOrder, getTransactionStatus } from '../../utils/pesapal';
import { env } from '../../config/env';
import { randomUUID } from 'crypto';

export class SubscriptionsService {
  static async createSubscription(providerId: string, data: CreateSubscriptionInput): Promise<SubscriptionDTO & { paymentUrl: string }> {
    const plan = await SubscriptionsRepository.getPlanById(data.planId);
    if (!plan) throw new Error('Plan not found');

    const amount = data.currency === 'RWF' ? plan.feeRwf : plan.feeUsd;
    const merchantReference = this.generateMerchantReference();
    const callbackUrl = env.PESAPAY_CALLBACK_URL || `${env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:4000'}/api/subscriptions/callback/pesapal`;

    // Determine payment method for Pesapal
    let paymentMethod = undefined;
    if (data.paymentMethod === 'mobileMoney') {
      // Map to Pesapal's mobile money identifiers
      const network = data.paymentDetails?.network;
      if (network === 'MTN MoMo') {
        paymentMethod = 'MTN';
      } else if (network === 'Airtel Money') {
        paymentMethod = 'AIRTEL';
      } else {
        paymentMethod = 'MOBILE_MONEY';
      }
    } else if (data.paymentMethod === 'card') {
      paymentMethod = 'CARD';
    }

    const orderResult = await submitOrder({
      id: merchantReference,
      currency: data.currency,
      amount: Number(amount),
      description: `Subscription to ${plan.title}`,
      callback_url: callbackUrl,
      notification_id: env.PESAPAY_IPN_ID || '',
      payment_method: paymentMethod,
      billing_address: {
        email_address: data.email,
        phone_number: data.phone || undefined,
        country_code: 'RW',
        first_name: data.firstName || undefined,
        last_name: data.lastName || undefined,
      },
    });

    const subscription = await SubscriptionsRepository.create(providerId, {
      ...data,
      pesapalMerchantReference: orderResult.merchant_reference,
      pesapalOrderTrackingId: orderResult.order_tracking_id,
    });

    // Generate return URL with order tracking ID
    const returnUrl = `${env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:5173'}/payment-callback?order_tracking_id=${orderResult.order_tracking_id}&merchant_ref=${orderResult.merchant_reference}`;

    return {
      ...this.mapToDTO(subscription),
      paymentUrl: orderResult.redirect_url,
    };
  }

  static async getSubscriptionById(id: string): Promise<SubscriptionDTO | null> {
    const subscription = await SubscriptionsRepository.getById(id);
    return subscription ? this.mapToDTO(subscription) : null;
  }

  static async getProviderSubscriptions(providerId: string): Promise<SubscriptionDTO[]> {
    const subscriptions = await SubscriptionsRepository.getByProviderId(providerId);
    return subscriptions.map(sub => this.mapToDTO(sub));
  }

  static async updateSubscription(id: string, data: UpdateSubscriptionInput): Promise<SubscriptionDTO> {
    const subscription = await SubscriptionsRepository.update(id, data);
    return this.mapToDTO(subscription);
  }

  static async cancelSubscription(id: string): Promise<SubscriptionDTO> {
    const subscription = await SubscriptionsRepository.cancel(id);
    return this.mapToDTO(subscription);
  }

  static async handlePesapalCallback(data: any): Promise<void> {
    // Handle both POST body and GET query parameter naming conventions
    const merchantReference = data.merchant_reference || 
                             data.OrderMerchantReference ||
                             data.merchantReference;
    const orderTrackingId = data.order_tracking_id || 
                           data.OrderTrackingId ||
                           data.orderTrackingId;

    console.log('Processing Pesapal callback:', { merchantReference, orderTrackingId, data });

    if (!merchantReference || !orderTrackingId) {
      console.error('Pesapal callback data:', data);
      throw new Error(`Missing merchant reference (${merchantReference}) or order tracking ID (${orderTrackingId})`);
    }

    const subscription = await SubscriptionsRepository.getByPesapalReference(merchantReference);
    if (!subscription) {
      throw new Error('Subscription not found for this merchant reference');
    }

    console.log('Found subscription:', subscription.id);

    // Verify status with Pesapal API for security
    let pesapalStatus = data.status || data.OrderStatus || 'PENDING';
    console.log('Initial pesapal status from data:', pesapalStatus);

    if (orderTrackingId) {
      try {
        const statusResult = await getTransactionStatus(orderTrackingId);
        pesapalStatus = statusResult.payment_status_description;
        console.log('Pesapal API status result:', statusResult);
      } catch (error) {
        console.error('Failed to get status from Pesapal API:', error);
        // If status check fails, fall back to callback data
      }
    }

    console.log('Final pesapal status:', pesapalStatus);

    const updateData: UpdateSubscriptionInput = {
      pesapalOrderTrackingId: orderTrackingId,
      pesapalStatus: pesapalStatus,
      paymentDetails: data,
    };

    // If payment is successful, update subscription status to ACTIVE
    // Pesapal returns "COMPLETED" for successful payments
    if (pesapalStatus && pesapalStatus.toUpperCase() === 'COMPLETED') {
      console.log('Payment COMPLETED - Setting subscription to ACTIVE');
      updateData.status = 'ACTIVE';
      updateData.startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      updateData.endDate = endDate;
    } else if (pesapalStatus && pesapalStatus.toUpperCase() === 'PENDING') {
      console.log('Payment PENDING - Keeping subscription as PENDING');
      updateData.status = 'PENDING';
    } else if (pesapalStatus && pesapalStatus.toUpperCase() === 'FAILED') {
      console.log('Payment FAILED - Cancelling subscription');
      updateData.status = 'CANCELLED';
    } else {
      console.log('Unknown payment status:', pesapalStatus);
    }

    console.log('Updating subscription with:', updateData);
    await SubscriptionsRepository.update(subscription.id, updateData);
    console.log('Subscription updated successfully');
  }

  static async checkPaymentStatus(orderTrackingId: string): Promise<SubscriptionDTO> {
    const subscription = await SubscriptionsRepository.getByOrderTrackingId(orderTrackingId);
    if (!subscription) {
      throw new Error('Subscription not found for this order');
    }

    // Verify and update status from Pesapal API
    try {
      const statusResult = await getTransactionStatus(orderTrackingId);
      const pesapalStatus = statusResult.payment_status_description;
      
      console.log('Checking payment status for order:', orderTrackingId);
      console.log('Pesapal status:', pesapalStatus);
      console.log('Current subscription status:', subscription.status);

      // Update subscription if status changed or is still pending
      if (subscription.status === 'PENDING') {
        const updateData: UpdateSubscriptionInput = {
          pesapalStatus: pesapalStatus,
        };

        if (pesapalStatus && pesapalStatus.toUpperCase() === 'COMPLETED') {
          console.log('Payment completed - activating subscription');
          updateData.status = 'ACTIVE';
          updateData.startDate = new Date();
          const endDate = new Date();
          endDate.setFullYear(endDate.getFullYear() + 1);
          updateData.endDate = endDate;
        } else if (pesapalStatus && pesapalStatus.toUpperCase() === 'FAILED') {
          console.log('Payment failed - cancelling subscription');
          updateData.status = 'CANCELLED';
        }

        if (updateData.status) {
          console.log('Updating subscription:', updateData);
          await SubscriptionsRepository.update(subscription.id, updateData);
          const updated = await SubscriptionsRepository.getById(subscription.id);
          return this.mapToDTO(updated as any);
        }
      }
    } catch (error) {
      console.error('Failed to check status with Pesapal:', error);
      // If Pesapal check fails, return current status
    }

    return this.mapToDTO(subscription);
  }

  private static mapToDTO(subscription: any): SubscriptionDTO {
    return {
      id: subscription.id,
      providerId: subscription.providerId,
      planId: subscription.planId,
      plan: subscription.plan ? {
        id: subscription.plan.id,
        title: subscription.plan.title,
        feeRwf: subscription.plan.feeRwf,
        feeUsd: subscription.plan.feeUsd,
      } : undefined,
      currency: subscription.currency,
      amount: Number(subscription.amount),
      status: subscription.status,
      paymentMethod: subscription.paymentMethod,
      pesapalOrderTrackingId: subscription.pesapalOrderTrackingId,
      pesapalMerchantReference: subscription.pesapalMerchantReference,
      pesapalStatus: subscription.pesapalStatus,
      paymentDetails: subscription.paymentDetails || {},
      startDate: subscription.startDate ? subscription.startDate.toISOString() : null,
      endDate: subscription.endDate ? subscription.endDate.toISOString() : null,
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString(),
    };
  }

  static generateMerchantReference(): string {
    return `SUB-${Date.now()}-${randomUUID().substring(0, 8)}`;
  }
}
