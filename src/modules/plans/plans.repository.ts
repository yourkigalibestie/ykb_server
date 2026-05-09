import { prisma } from '../../config/prisma';
import type { CreatePlanInput, UpdatePlanInput } from './plans.types';

export class PlansRepository {
  static async create(data: CreatePlanInput) {
    return prisma.plan.create({
      data: {
        title: data.title,
        features: data.features,
        feeRwf: data.feeRwf,
        feeUsd: data.feeUsd,
      },
    });
  }

  static async getById(id: string) {
    return prisma.plan.findUnique({
      where: { id },
    });
  }

  static async getAll() {
    return prisma.plan.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async update(id: string, data: UpdatePlanInput) {
    return prisma.plan.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.features && { features: data.features }),
        ...(data.feeRwf && { feeRwf: data.feeRwf }),
        ...(data.feeUsd && { feeUsd: data.feeUsd }),
      },
    });
  }

  static async delete(id: string) {
    return prisma.plan.delete({
      where: { id },
    });
  }
}
