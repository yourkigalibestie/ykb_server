import type { User } from '@prisma/client';

export type SafeUser = Omit<User, 'passwordHash'>;

export type UpdateMeInput = {
    name?: string;
    phone?: string | null;
};
