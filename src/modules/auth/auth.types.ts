import type { User } from '@prisma/client';
import type { Role } from '../../utils/prismaEnums';

export type SafeUser = Omit<User, 'passwordHash'>;

export type AuthResult = {
    user: SafeUser;
    accessToken: string;
};

export type RegisterInput = {
    email: string;
    phone?: string;
    name: string;
    password: string;
    role?: Exclude<Role, 'ADMIN'>;

    // Provider-only fields (collected on the frontend register form)
    businessName?: string;
    service?: string;
    location?: string;
    moneyRange?: string;
    services?: Array<{
        name: string;
        price: string;
        description?: string;
    }>;
};

export type LoginInput = {
    email: string;
    password: string;
};
