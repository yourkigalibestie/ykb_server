import type { RequestStatus } from '../../utils/prismaEnums';

export type CreateRequestInput = {
    description: string;
    location: string;
    preferredDate?: string | null;
    budget?: string | null;
};

export type AdminUpdateRequestInput = {
    status: RequestStatus;
    adminNotes?: string | null;
};
