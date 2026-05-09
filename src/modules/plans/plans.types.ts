export type CreatePlanInput = {
  title: string;
  features: string[];
  feeRwf: number;
  feeUsd: number;
};

export type UpdatePlanInput = Partial<CreatePlanInput>;

export type PlanDTO = {
  id: string;
  title: string;
  features: string[];
  feeRwf: number;
  feeUsd: number;
  createdAt: string;
  updatedAt: string;
};
