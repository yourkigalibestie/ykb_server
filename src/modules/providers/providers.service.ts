import type { ProviderStatus } from '../../utils/prismaEnums';
import { AppError } from '../../utils/appError';
import { providersRepository } from './providers.repository';
import type { UpdateProviderMeInput } from './providers.types';

export const providersService = {
    listPublic: async () => {
        return providersRepository.findPublic();
    },

    getById: async (providerId: string) => {
        const provider = await providersRepository.findById(providerId);
        if (!provider) throw new AppError('Provider not found', 404, 'NOT_FOUND');
        return provider;
    },

    me: async (userId: string) => {
        const provider = await providersRepository.findByUserId(userId);
        if (!provider) throw new AppError('Provider profile not found', 404, 'NOT_FOUND');
        return provider;
    },

    updateMe: async (userId: string, input: UpdateProviderMeInput) => {
        const provider = await providersRepository.updateByUserId(userId, input);
        return provider;
    },

    verify: async (providerId: string, status: ProviderStatus, rejectionReason?: string | null) => {
        const provider = await providersRepository.updateStatus(providerId, status, rejectionReason);
        return provider;
    }
};
