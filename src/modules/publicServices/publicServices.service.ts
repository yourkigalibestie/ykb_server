import { AppError } from '../../utils/appError';
import { publicServicesRepository } from './publicServices.repository';

const isDbUnreachable = (err: unknown): boolean => {
    const anyErr = err as any;
    const code =
        typeof anyErr?.code === 'string'
            ? anyErr.code
            : typeof anyErr?.errorCode === 'string'
                ? anyErr.errorCode
                : '';

    // Prisma connectivity error: P1001 (can't reach DB).
    return code === 'P1001';
};

export const publicServicesService = {
    list: async () => {
        try {
            return await publicServicesRepository.list();
        } catch (err) {
            // Allow the frontend to still render the 11 default slots.
            if (isDbUnreachable(err)) return [];
            throw err;
        }
    },

    create: async (input: { title: string; description: string; imageUrl?: string | null; imagePublicId?: string | null }) => {
        try {
            return await publicServicesRepository.create({
                title: input.title.trim(),
                description: input.description.trim(),
                imageUrl: input.imageUrl?.trim() || null,
                imagePublicId: input.imagePublicId?.trim() || null
            });
        } catch (err) {
            if (isDbUnreachable(err)) {
                throw new AppError('Database not reachable. Please check DATABASE_URL / network and try again.', 503, 'DB_UNREACHABLE');
            }
            throw err;
        }
    },

    update: async (id: number, input: { title?: string; description?: string; imageUrl?: string | null; imagePublicId?: string | null }) => {
        try {
            const existing = await publicServicesRepository.findById(id);
            if (!existing) throw new AppError('Service not found', 404, 'NOT_FOUND');

            return await publicServicesRepository.updateById(id, {
                title: input.title?.trim(),
                description: input.description?.trim(),
                imageUrl: input.imageUrl !== undefined ? (input.imageUrl?.trim() || null) : undefined,
                imagePublicId: input.imagePublicId !== undefined ? (input.imagePublicId?.trim() || null) : undefined
            });
        } catch (err) {
            if (isDbUnreachable(err)) {
                throw new AppError('Database not reachable. Please check DATABASE_URL / network and try again.', 503, 'DB_UNREACHABLE');
            }
            throw err;
        }
    }
};
