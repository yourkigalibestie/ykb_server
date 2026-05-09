import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { Role } from '../../utils/prismaEnums';
import { translatorsController } from './translators.controller';
import { createTranslatorSchema, listTranslatorsSchema, translatorIdSchema, updateTranslatorSchema } from './translators.schema';

export const translatorsRouter = Router();

translatorsRouter.get('/', validate(listTranslatorsSchema), translatorsController.list);

translatorsRouter.post('/', protect, requireRoles(Role.ADMIN), validate(createTranslatorSchema), translatorsController.create);

translatorsRouter.patch('/:id', protect, requireRoles(Role.ADMIN), validate(updateTranslatorSchema), translatorsController.update);

translatorsRouter.delete('/:id', protect, requireRoles(Role.ADMIN), validate(translatorIdSchema), translatorsController.remove);
