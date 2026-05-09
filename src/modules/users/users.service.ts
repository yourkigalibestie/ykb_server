import { AppError } from '../../utils/appError';
import { usersRepository } from './users.repository';
import type { SafeUser, UpdateMeInput } from './users.types';

const toSafeUser = (user: any): SafeUser => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;
    return rest;
};

export const usersService = {
    getMe: async (userId: string): Promise<SafeUser> => {
        const user = await usersRepository.findById(userId);
        if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
        return toSafeUser(user);
    },

    updateMe: async (userId: string, input: UpdateMeInput): Promise<SafeUser> => {
        const user = await usersRepository.updateById(userId, input);
        return toSafeUser(user);
    }
};
