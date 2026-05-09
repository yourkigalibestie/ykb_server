import { z } from 'zod';
import { Role } from '../../utils/prismaEnums';

const providerServiceOfferingSchema = z.object({
    name: z.string().min(1).max(120),
    price: z.string().min(1).max(64),
    description: z.string().min(1).max(2000).optional()
});

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email(),
        phone: z.string().min(6).max(32).optional(),
        name: z.string().min(2).max(120),
        password: z.string().min(8).max(200),
        role: z.enum([Role.CUSTOMER, Role.PROVIDER]).optional(),

        // Provider-only fields (frontend collects these when registering as a provider)
        businessName: z.string().min(2).max(200).optional(),
        service: z.string().min(1).max(200).optional(),
        location: z.string().min(1).max(200).optional(),
        moneyRange: z.string().min(1).max(120).optional(),
        services: z.array(providerServiceOfferingSchema).optional()
    }).superRefine((value, ctx) => {
        const role = value.role ?? Role.CUSTOMER;
        if (role !== Role.PROVIDER) return;

        if (!value.businessName) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'businessName is required for providers', path: ['businessName'] });
        }
        if (!value.service) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'service is required for providers', path: ['service'] });
        }
        if (!value.location) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'location is required for providers', path: ['location'] });
        }
        if (!value.moneyRange) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'moneyRange is required for providers', path: ['moneyRange'] });
        }

        const offerings = value.services ?? [];
        if (offerings.length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'services is required for providers', path: ['services'] });
        }
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(8).max(200)
    })
});
