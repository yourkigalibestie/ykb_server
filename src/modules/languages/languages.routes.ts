import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { Role } from '../../utils/prismaEnums';
import { languagesController } from './languages.controller';
import { createLanguageSchema, languageIdSchema, updateLanguageSchema } from './languages.schema';

export const languagesRouter = Router();

languagesRouter.get('/', languagesController.list);
languagesRouter.post('/', protect, requireRoles(Role.ADMIN), validate(createLanguageSchema), languagesController.create);
languagesRouter.patch('/:id', protect, requireRoles(Role.ADMIN), validate(updateLanguageSchema), languagesController.update);
languagesRouter.delete('/:id', protect, requireRoles(Role.ADMIN), validate(languageIdSchema), languagesController.remove);
