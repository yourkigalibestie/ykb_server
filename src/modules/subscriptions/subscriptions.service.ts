import type { CreateSubscriptionInput, UpdateSubscriptionInput, SubscriptionDTO } from './subscriptions.types';
import { SubscriptionsRepository } from './subscriptions.repository';
import { submitOrder, getTransactionStatus } from '../../utils/pesapal';
import { env } from '../../config/env';
import { v4 as uuidv4 } from 'uuid';

export class SubscriptionsService {
  static async createSubscription(providerId: string, data: CreateSubscriptionInput): Promise<SubscriptionDTO & { paymentUrl: string }> {
    const plan = await SubscriptionsRepository.getPlanById(data.planId);
    if (!plan) throw new Error('Plan not found');

    const amount = data.currency === 'RWF' ? plan.feeRwf : plan.feeUsd;
    const merchantReference = this.generateMerchantReference();
    const callbackUrl = env.PESAPAY_CALLBACK_URL || `${env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:4000'}/api/subscriptions/callback/pesapal`;

    const orderResult = await submitOrder({
      id: merchantReference,
      currency: data.currency,
      amount: Number(amount),
      description: `Subscription to ${plan.title}`,
      callback_url: callbackUrl,
      notification_id: env.PESAPAY_IPN_ID || '',
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
    const merchantReference = data.merchantReference || data.merchant_reference;
    const orderTrackingId = data.orderTrackingId || data.order_tracking_id;

    const subscription = await SubscriptionsRepository.getByPesapalReference(merchantReference);
    if (!subscription) {
      throw new Error('Subscription not found for this merchant reference');
    }

    // Verify status with Pesapal API for security
    let pesapalStatus = data.status;
    if (orderTrackingId) {
      try {
        const statusResult = await getTransactionStatus(orderTrackingId);
        pesapalStatus = statusResult.payment_status_description;
      } catch {
        // If status check fails, fall back to callback data
      }
    }

    const updateData: UpdateSubscriptionInput = {
      pesapalOrderTrackingId: orderTrackingId,
      pesapalStatus: pesapalStatus,
      paymentDetails: data,
    };

    // If payment is successful, update subscription status to ACTIVE
    if (pesapalStatus === 'COMPLETED' || pesapalStatus === 'PENDING') {
      updateData.status = pesapalStatus === 'COMPLETED' ? 'ACTIVE' : 'PENDING';
      if (pesapalStatus === 'COMPLETED') {
        updateData.startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        updateData.endDate = endDate;
      }
    }

    await SubscriptionsRepository.update(subscription.id, updateData);
  }

  private static mapToDTO(subscription: any): SubscriptionDTO {
    return {
      id: subscription.id,
      providerId: subscription.providerId,
      planId: subscription.planId,
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
    return `SUB-${Date.now()}-${uuidv4().substring(0, 8)}`;
  }
}
