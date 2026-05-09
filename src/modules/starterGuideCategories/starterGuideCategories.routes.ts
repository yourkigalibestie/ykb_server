import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { starterGuideCategoriesController } from './starterGuideCategories.controller';
import { createStarterGuideCategorySchema, starterGuideCategoryIdSchema, updateStarterGuideCategorySchema } from './starterGuideCategories.schema';

export const starterGuideCategoriesRouter = Router();

starterGuideCategoriesRouter.get('/', starterGuideCategoriesController.list);
starterGuideCategoriesRouter.post('/', validate(createStarterGuideCategorySchema), starterGuideCategoriesController.create);
starterGuideCategoriesRouter.patch('/:id', validate(updateStarterGuideCategorySchema), starterGuideCategoriesController.update);
starterGuideCategoriesRouter.delete('/:id', validate(starterGuideCategoryIdSchema), starterGuideCategoriesController.remove);
