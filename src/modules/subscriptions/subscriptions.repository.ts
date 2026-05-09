import { prisma } from '../../config/prisma';
import type { CreateSubscriptionInput, UpdateSubscriptionInput } from './subscriptions.types';

export class SubscriptionsRepository {
  static async getPlanById(id: string) {
    return prisma.plan.findUnique({ where: { id } });
  }

  static async create(providerId: string, data: CreateSubscriptionInput & { pesapalMerchantReference?: string; pesapalOrderTrackingId?: string }) {
    const plan = await prisma.plan.findUnique({
      where: { id: data.planId },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    const amount = data.currency === 'RWF' ? plan.feeRwf : plan.feeUsd;

    return prisma.subscription.create({
      data: {
        providerId,
        planId: data.planId,
        currency: data.currency,
        amount,
        status: 'PENDING',
        paymentMethod: data.paymentMethod,
        paymentDetails: data.paymentDetails || {},
        pesapalMerchantReference: data.pesapalMerchantReference || null,
        pesapalOrderTrackingId: data.pesapalOrderTrackingId || null,
      },
    });
  }

  static async getById(id: string) {
    return prisma.subscription.findUnique({
      where: { id },
      include: {
        plan: true,
        provider: true,
      },
    });
  }

  static async getByProviderId(providerId: string) {
    return prisma.subscription.findMany({
      where: { providerId },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getByPesapalReference(merchantReference: string) {
    return prisma.subscription.findFirst({
      where: { pesapalMerchantReference: merchantReference },
    });
  }

  static async update(id: string, data: UpdateSubscriptionInput) {
    return prisma.subscription.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.pesapalOrderTrackingId && { pesapalOrderTrackingId: data.pesapalOrderTrackingId }),
        ...(data.pesapalMerchantReference && { pesapalMerchantReference: data.pesapalMerchantReference }),
        ...(data.pesapalStatus && { pesapalStatus: data.pesapalStatus }),
        ...(data.paymentDetails && { paymentDetails: data.paymentDetails }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate && { endDate: data.endDate }),
      },
    });
  }

  static async cancel(id: string) {
    return prisma.subscription.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
