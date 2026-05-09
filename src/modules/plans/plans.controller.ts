import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { PlansService } from './plans.service';
import { AppError } from '../../utils/appError';

export const plansController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body;
    const plan = await PlansService.createPlan({
      title: body.title,
      features: body.features,
      feeRwf: parseFloat(body.feeRwf),
      feeUsd: parseFloat(body.feeUsd),
    });
    res.status(201).json({ plan });
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const plans = await PlansService.getAllPlans();
    res.status(200).json({ plans });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.validated?.params;
    const plan = await PlansService.getPlanById(id);
    if (!plan) {
      throw new AppError('Plan not found', 404);
    }
    res.status(200).json({ plan });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.validated?.params;
    const body = req.validated?.body;

    const existingPlan = await PlansService.getPlanById(id);
    if (!existingPlan) {
      throw new AppError('Plan not found', 404);
    }

    const updateData: any = {};
    if (body.title) updateData.title = body.title;
    if (body.features) updateData.features = body.features;
    if (body.feeRwf) updateData.feeRwf = parseFloat(body.feeRwf);
    if (body.feeUsd) updateData.feeUsd = parseFloat(body.feeUsd);

    const plan = await PlansService.updatePlan(id, updateData);
    res.status(200).json({ plan });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.validated?.params;
    const plan = await PlansService.getPlanById(id);
    if (!plan) {
      throw new AppError('Plan not found', 404);
    }
    await PlansService.deletePlan(id);
    res.status(200).json({ message: 'Plan deleted successfully' });
  }),
};
