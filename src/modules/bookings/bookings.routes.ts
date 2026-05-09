import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { bookingsController } from './bookings.controller';
import { bookingIdParamSchema, createBookingSchema } from './bookings.schema';

export const bookingsRouter = Router();

bookingsRouter.post('/', protect, validate(createBookingSchema), bookingsController.create);
bookingsRouter.get('/me', protect, bookingsController.listMine);
bookingsRouter.get('/:bookingId', protect, validate(bookingIdParamSchema), bookingsController.get);

bookingsRouter.patch('/:bookingId/confirm', protect, validate(bookingIdParamSchema), bookingsController.confirm);
bookingsRouter.patch('/:bookingId/complete', protect, validate(bookingIdParamSchema), bookingsController.complete);
bookingsRouter.patch('/:bookingId/cancel', protect, validate(bookingIdParamSchema), bookingsController.cancel);
