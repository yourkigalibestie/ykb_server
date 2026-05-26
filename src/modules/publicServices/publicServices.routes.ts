import { Router } from 'express';
import { publicServicesController } from './publicServices.controller';

export const publicServicesRouter = Router();

publicServicesRouter.get('/', publicServicesController.list);
