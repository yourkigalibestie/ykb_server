import { z } from 'zod';
import { ProviderStatus, RequestStatus } from '../../utils/prismaEnums';

export const verifyProviderSchema = z.object({
    params: z.object({ providerId: z.string().min(1) }),
    body: z.object({
        status: z.nativeEnum(ProviderStatus).refine((s) => s !== ProviderStatus.PENDING, { message: 'Status must be APPROVED or REJECTED' }),
        rejectionReason: z.string().max(3000).nullable().optional()
    }).superRefine((data, ctx) => {
        const isRejected = data.status === ProviderStatus.REJECTED;
        const hasReason = typeof data.rejectionReason === 'string' && data.rejectionReason.trim().length > 0;

        if (isRejected && !hasReason) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rejectionReason'],
                message: 'Rejection reason is required when rejecting a provider.'
            });
        }

        if (!isRejected && hasReason) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rejectionReason'],
                message: 'Rejection reason may only be provided when status is REJECTED.'
            });
        }
    })
});

export const updateRequestSchema = z.object({
    params: z.object({ requestId: z.string().min(1) }),
    body: z.object({
        status: z.nativeEnum(RequestStatus),
        adminNotes: z.string().max(3000).nullable().optional()
    })
});

export const assignProviderSchema = z.object({
    params: z.object({ requestId: z.string().min(1) }),
    body: z.object({
        providerId: z.string().min(1, 'Provider ID is required')
    })
});
