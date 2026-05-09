import type { BookingStatus } from '../../utils/prismaEnums';

export type CreateBookingInput = {
    providerId?: string | null;
    serviceId: string;
    date: string;
    location: string;
    notes?: string | null;
};

export type UpdateBookingStatusInput = {
    status: BookingStatus;
};
