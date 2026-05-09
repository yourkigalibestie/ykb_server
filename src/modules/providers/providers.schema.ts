import { z } from 'zod';
import { ProviderStatus } from '../../utils/prismaEnums';

const serviceOfferingSchema = z.object({
    name: z.string().min(1).max(120),
    price: z.string().min(1).max(64),
    description: z.string().min(1).max(2000).optional()
});

export const updateProviderMeSchema = z.object({
    body: z.object({
        bio: z.string().max(2000).nullable().optional(),
        profileImageUrl: z.string().url().nullable().optional(),
        profileImagePublicId: z.string().min(1).nullable().optional(),

        businessName: z.string().min(2).max(200).nullable().optional(),
        mainService: z.string().min(1).max(200).nullable().optional(),
        location: z.string().min(1).max(200).nullable().optional(),
        moneyRange: z.string().min(1).max(120).nullable().optional(),
        serviceOfferings: z.array(serviceOfferingSchema).nullable().optional()
    })
});

export const verifyProviderSchema = z.object({
    params: z.object({
        providerId: z.string().min(1)
    }),
    body: z.object({
        status: z.nativeEnum(ProviderStatus).refine((s: ProviderStatus) => s !== ProviderStatus.PENDING, {
            message: 'Status must be APPROVED or REJECTED'
        }),
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
