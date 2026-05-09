import type { ProviderStatus, RequestStatus } from '../../utils/prismaEnums';
import { adminRepository } from './admin.repository';
import { AppError } from '../../utils/appError';

export const adminService = {
    listBookings: async () => adminRepository.listBookings(),
    listPayments: async () => adminRepository.listPayments(),
    listRequests: async () => adminRepository.listRequests(),
	listProviders: async () => adminRepository.listProviders(),
	getProviderById: async (providerId: string) => adminRepository.getProviderById(providerId),
    verifyProvider: async (providerId: string, status: ProviderStatus, rejectionReason?: string | null) =>
        adminRepository.updateProviderStatus(providerId, status, rejectionReason),
    updateRequest: async (requestId: string, status: RequestStatus, adminNotes?: string | null) =>
        adminRepository.updateRequest(requestId, { status, adminNotes }),
    listUsers: async (role?: string) => adminRepository.listUsers(role),
    
    getProvidersForService: async (serviceName: string) => {
        return adminRepository.getProvidersForService(serviceName);
    },
    
    assignProviderToRequest: async (requestId: string, providerId: string) => {
        const request = await adminRepository.findRequestById(requestId);
        if (!request) throw new AppError('Request not found', 404, 'NOT_FOUND');
        
        const provider = await adminRepository.getProviderById(providerId);
        if (!provider) throw new AppError('Provider not found', 404, 'NOT_FOUND');
        
        return adminRepository.assignProviderToRequest(requestId, providerId);
    },

    confirmRequestResolution: async (requestId: string) => {
        const request = await adminRepository.findRequestById(requestId);
        if (!request) throw new AppError('Request not found', 404, 'NOT_FOUND');
        if (!request.providerResolvedAt) {
            throw new AppError('Provider has not marked this request as resolved yet', 400, 'BAD_REQUEST');
        }
        return adminRepository.confirmRequestResolution(requestId);
    },

    markRequestAsResolved: async (requestId: string) => {
        const request = await adminRepository.findRequestById(requestId);
        if (!request) throw new AppError('Request not found', 404, 'NOT_FOUND');
        if (request.status !== 'IN_REVIEW') {
            throw new AppError('Only IN_REVIEW requests can be marked as resolved', 403, 'FORBIDDEN');
        }
        return adminRepository.markRequestAsResolved(requestId);
    }
};
