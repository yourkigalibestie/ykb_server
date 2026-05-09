import { Prisma } from '@prisma/client';
import { Role } from '../../utils/prismaEnums';
import { AppError } from '../../utils/appError';
import { requestsRepository } from './requests.repository';
import type { AdminUpdateRequestInput, CreateRequestInput } from './requests.types';
import { RequestStatus } from '../../utils/prismaEnums';

export const requestsService = {
    create: async (auth: { userId: string; role: Role }, input: CreateRequestInput) => {
        if (auth.role !== Role.CUSTOMER && auth.role !== Role.ADMIN && auth.role !== Role.PROVIDER) {
            throw new AppError('Only customers and service providers can create requests', 403, 'FORBIDDEN');
        }

        const preferredDate = input.preferredDate ? new Date(input.preferredDate) : null;
        const budget = input.budget ? new Prisma.Decimal(input.budget) : null;

        return requestsRepository.create({
            userId: auth.userId,
            description: input.description,
            location: input.location,
            preferredDate,
            budget
        });
    },

    listMine: async (auth: { userId: string; role: Role }) => {
        return requestsRepository.listMine(auth.userId);
    },

    listAssignedToMe: async (auth: { userId: string; role: Role }) => {
        if (auth.role !== Role.PROVIDER) {
            throw new AppError('Only providers can view assigned requests', 403, 'FORBIDDEN');
        }
        return requestsRepository.listAssignedToProvider(auth.userId);
    },

    listAll: async () => {
        return requestsRepository.listAll();
    },

    updateMine: async (
        auth: { userId: string; role: Role },
        requestId: string,
        input: { description?: string; location?: string; preferredDate?: string | null; budget?: string | null }
    ) => {
        if (auth.role !== Role.CUSTOMER && auth.role !== Role.ADMIN && auth.role !== Role.PROVIDER) {
            throw new AppError('Only customers and service providers can update requests', 403, 'FORBIDDEN');
        }

        const existing = await requestsRepository.findById(requestId);
        if (!existing) throw new AppError('Request not found', 404, 'NOT_FOUND');
        if (existing.userId !== auth.userId) throw new AppError('Not allowed', 403, 'FORBIDDEN');

        if (existing.status !== RequestStatus.PENDING) {
            throw new AppError('Only pending requests can be edited', 403, 'FORBIDDEN');
        }

        const data: any = {};
        if (typeof input.description === 'string') data.description = input.description;
        if (typeof input.location === 'string') data.location = input.location;
        if (input.preferredDate !== undefined) data.preferredDate = input.preferredDate ? new Date(input.preferredDate) : null;
        if (input.budget !== undefined) data.budget = input.budget ? new Prisma.Decimal(input.budget) : null;

        return requestsRepository.updateById(requestId, data);
    },

    addNoteMine: async (auth: { userId: string; role: Role }, requestId: string, note: string) => {
        if (auth.role !== Role.CUSTOMER && auth.role !== Role.ADMIN && auth.role !== Role.PROVIDER) {
            throw new AppError('Only customers and service providers can add notes', 403, 'FORBIDDEN');
        }

        const existing = await requestsRepository.findById(requestId);
        if (!existing) throw new AppError('Request not found', 404, 'NOT_FOUND');
        if (existing.userId !== auth.userId) throw new AppError('Not allowed', 403, 'FORBIDDEN');

        if (existing.status === RequestStatus.PENDING) {
            throw new AppError('Add notes after the request is received', 403, 'FORBIDDEN');
        }
        if (existing.status === RequestStatus.CANCELLED) {
            throw new AppError('Cancelled requests cannot be updated', 403, 'FORBIDDEN');
        }

        const stamp = new Date().toISOString();
        const entry = `[${stamp}] ${note.trim()}`;
        const nextCustomerNotes = existing.customerNotes?.trim()
            ? `${existing.customerNotes.trim()}\n\n${entry}`
            : entry;

        const nextStatus = existing.status === RequestStatus.RESOLVED ? RequestStatus.IN_REVIEW : existing.status;

        return requestsRepository.updateById(requestId, {
            customerNotes: nextCustomerNotes,
            status: nextStatus
        });
    },

    adminUpdate: async (requestId: string, input: AdminUpdateRequestInput) => {
        const existing = await requestsRepository.findById(requestId);
        if (!existing) throw new AppError('Request not found', 404, 'NOT_FOUND');

        return requestsRepository.updateById(requestId, {
            status: input.status,
            adminNotes: input.adminNotes
        });
    },

    providerMarkResolved: async (auth: { userId: string; role: Role }, requestId: string) => {
        if (auth.role !== Role.PROVIDER && auth.role !== Role.CUSTOMER) {
            throw new AppError('Only providers and customers can mark requests as resolved', 403, 'FORBIDDEN');
        }

        const existing = await requestsRepository.findById(requestId);
        if (!existing) throw new AppError('Request not found', 404, 'NOT_FOUND');

        // Check if user owns this request (by userId - for customer/starter)
        const isOwner = existing.userId === auth.userId;

        // Check if user is assigned as provider to this request
        let isAssignedProvider = false;
        if (existing.providerId) {
            const provider = await requestsRepository.findProviderByUserId(auth.userId);
            isAssignedProvider = !!(provider && existing.providerId === provider.id);
        }

        // Allow if user owns the request OR is the assigned provider
        if (!isOwner && !isAssignedProvider) {
            throw new AppError('You do not have permission to mark this request as resolved', 403, 'FORBIDDEN');
        }

        if (existing.status !== RequestStatus.IN_REVIEW) {
            throw new AppError('Only IN_REVIEW requests can be marked as resolved', 403, 'FORBIDDEN');
        }

        // If CUSTOMER (requester) marks as resolved -> immediately resolve
        if (isOwner && auth.role === Role.CUSTOMER) {
            return requestsRepository.updateById(requestId, {
                customerResolvedAt: new Date(),
                status: RequestStatus.RESOLVED
            });
        }

        // If PROVIDER marks as resolved -> needs admin confirmation
        if (isAssignedProvider && auth.role === Role.PROVIDER) {
            return requestsRepository.updateById(requestId, {
                providerResolvedAt: new Date(),
                requiresAdminConfirmation: true
            });
        }

        throw new AppError('Unable to process resolution', 400, 'BAD_REQUEST');
    },

    adminConfirmResolution: async (requestId: string) => {
        const existing = await requestsRepository.findById(requestId);
        if (!existing) throw new AppError('Request not found', 404, 'NOT_FOUND');

        if (!existing.providerResolvedAt) {
            throw new AppError('Provider has not marked this request as resolved yet', 400, 'BAD_REQUEST');
        }

        return requestsRepository.updateById(requestId, {
            status: RequestStatus.RESOLVED,
            adminConfirmedAt: new Date(),
            requiresAdminConfirmation: false
        });
    },

    adminMarkResolved: async (requestId: string) => {
        const existing = await requestsRepository.findById(requestId);
        if (!existing) throw new AppError('Request not found', 404, 'NOT_FOUND');

        if (existing.status !== RequestStatus.IN_REVIEW) {
            throw new AppError('Only IN_REVIEW requests can be marked as resolved', 403, 'FORBIDDEN');
        }

        return requestsRepository.updateById(requestId, {
            adminResolvedAt: new Date(),
            status: RequestStatus.RESOLVED,
            requiresAdminConfirmation: false
        });
    },

    customerRateRequest: async (auth: { userId: string; role: Role }, requestId: string, rating: number) => {
        if (rating < 1 || rating > 10 || !Number.isInteger(rating)) {
            throw new AppError('Rating must be an integer between 1 and 10', 400, 'BAD_REQUEST');
        }

        const existing = await requestsRepository.findById(requestId);
        if (!existing) throw new AppError('Request not found', 404, 'NOT_FOUND');

        // Check if user can rate: must be either the requester OR the assigned provider
        const isRequester = existing.userId === auth.userId;
        
        let isAssignedProvider = false;
        if (existing.providerId) {
            const provider = await requestsRepository.findProviderByUserId(auth.userId);
            isAssignedProvider = !!(provider && existing.providerId === provider.id);
        }

        if (!isRequester && !isAssignedProvider) {
            throw new AppError('You do not have permission to rate this request', 403, 'FORBIDDEN');
        }

        // Check if request is resolved
        const isResolved = existing.customerResolvedAt || existing.providerResolvedAt || existing.adminResolvedAt;
        if (!isResolved) {
            throw new AppError('Only resolved requests can be rated', 403, 'FORBIDDEN');
        }

        return requestsRepository.updateById(requestId, {
            rating
        });
    }
};
