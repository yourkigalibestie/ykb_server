import { Router } from 'express';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { providersRouter } from './modules/providers/providers.routes';
import { servicesRouter } from './modules/services/services.routes';
import { bookingsRouter } from './modules/bookings/bookings.routes';
import { paymentsRouter } from './modules/payments/payments.routes';
import { requestsRouter } from './modules/requests/requests.routes';
import { reviewsRouter } from './modules/reviews/reviews.routes';
import { uploadsRouter } from './modules/uploads/uploads.routes';
import { adminRouter } from './modules/admin/admin.routes';
import { publicServicesRouter } from './modules/publicServices/publicServices.routes';
import { languagesRouter } from './modules/languages/languages.routes';
import { translatorsRouter } from './modules/translators/translators.routes';
import { starterGuideCategoriesRouter } from './modules/starterGuideCategories/starterGuideCategories.routes';
import { plansRouter } from './modules/plans/plans.routes';
import { subscriptionsRouter } from './modules/subscriptions/subscriptions.routes';

export const routes = Router();

routes.use('/auth', authRouter);
routes.use('/users', usersRouter);
routes.use('/providers', providersRouter);
routes.use('/service-catalog', servicesRouter);
routes.use('/bookings', bookingsRouter);
routes.use('/payments', paymentsRouter);
routes.use('/requests', requestsRouter);
routes.use('/reviews', reviewsRouter);
routes.use('/uploads', uploadsRouter);
routes.use('/admin', adminRouter);
routes.use('/plans', plansRouter);
routes.use('/subscriptions', subscriptionsRouter);

// Simple services list for the frontend marketing/UI.
routes.use('/services', publicServicesRouter);

/**
 * Translator languages + dynamic pricing.
 */
routes.use('/languages', languagesRouter);

/**
 * Translator management (create translators + assign languageIds).
 */
routes.use('/translators', translatorsRouter);

// Starter guide categories + optional subcategories.
routes.use('/starter-guide-categories', starterGuideCategoriesRouter);
