import type { ProviderStatus, RequestStatus } from '../../utils/prismaEnums';

export type VerifyProviderInput = {
    status: ProviderStatus;
    rejectionReason?: string | null;
};

export type UpdateRequestInput = {
    status: RequestStatus;
    adminNotes?: string | null;
};
