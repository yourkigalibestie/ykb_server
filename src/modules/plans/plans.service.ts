import type { CreatePlanInput, UpdatePlanInput, PlanDTO } from './plans.types';
import { PlansRepository } from './plans.repository';

export class PlansService {
  static async createPlan(data: CreatePlanInput): Promise<PlanDTO> {
    const plan = await PlansRepository.create(data);
    return this.mapToDTO(plan);
  }

  static async getPlanById(id: string): Promise<PlanDTO | null> {
    const plan = await PlansRepository.getById(id);
    return plan ? this.mapToDTO(plan) : null;
  }

  static async getAllPlans(): Promise<PlanDTO[]> {
    const plans = await PlansRepository.getAll();
    return plans.map(plan => this.mapToDTO(plan));
  }

  static async updatePlan(id: string, data: UpdatePlanInput): Promise<PlanDTO> {
    const plan = await PlansRepository.update(id, data);
    return this.mapToDTO(plan);
  }

  static async deletePlan(id: string): Promise<void> {
    await PlansRepository.delete(id);
  }

  private static mapToDTO(plan: any): PlanDTO {
    return {
      id: plan.id,
      title: plan.title,
      features: Array.isArray(plan.features) ? plan.features : [],
      feeRwf: Number(plan.feeRwf),
      feeUsd: Number(plan.feeUsd),
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };
  }
}
