import type { ProviderStatus } from '../../utils/prismaEnums';

export type UpdateProviderMeInput = {
    bio?: string | null;
    profileImageUrl?: string | null;
    profileImagePublicId?: string | null;

    businessName?: string | null;
    mainService?: string | null;
    location?: string | null;
    moneyRange?: string | null;
    serviceOfferings?: any;
};

export type VerifyProviderInput = {
    status: ProviderStatus;
    rejectionReason?: string | null;
};
