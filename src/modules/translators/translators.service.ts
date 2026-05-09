import { AppError } from '../../utils/appError';
import { translatorsRepository } from './translators.repository';

const isDbUnreachable = (err: unknown): boolean => {
    const anyErr = err as any;
    const code =
        typeof anyErr?.code === 'string'
            ? anyErr.code
            : typeof anyErr?.errorCode === 'string'
                ? anyErr.errorCode
                : '';

    return code === 'P1001';
};

const normalizeLanguageIds = (ids: number[]): number[] => {
    const out: number[] = [];
    for (const id of ids) {
        const n = typeof id === 'number' ? id : Number(id);
        if (!Number.isInteger(n) || n <= 0) continue;
        out.push(n);
    }
    return Array.from(new Set(out));
};

export const translatorsService = {
    list: async (filter?: { languageId?: number }) => {
        try {
            return await translatorsRepository.list(filter);
        } catch (err) {
            if (isDbUnreachable(err)) return [];
            throw err;
        }
    },

    create: async (input: {
        name: string;
        email: string;
        phone: string;
        profileImageUrl?: string | null;
        profileImagePublicId?: string | null;
        languageIds: number[];
    }) => {
        try {
            const name = input.name.trim();
            const email = input.email.trim().toLowerCase();
            const phone = input.phone.trim();

            if (!name) throw new AppError('Name is required', 400, 'VALIDATION_ERROR');
            if (!email) throw new AppError('Email is required', 400, 'VALIDATION_ERROR');
            if (!phone) throw new AppError('Phone is required', 400, 'VALIDATION_ERROR');

            const languageIds = normalizeLanguageIds(input.languageIds ?? []);

            return await translatorsRepository.create({
                name,
                email,
                phone,
                profileImageUrl: input.profileImageUrl ?? null,
                profileImagePublicId: input.profileImagePublicId ?? null,
                languageIds
            });
        } catch (err) {
            if (isDbUnreachable(err)) {
                throw new AppError('Database not reachable. Please check DATABASE_URL / network and try again.', 503, 'DB_UNREACHABLE');
            }
            throw err;
        }
    },

    update: async (
        id: number,
        input: {
            name?: string;
            email?: string;
            phone?: string;
            profileImageUrl?: string | null;
            profileImagePublicId?: string | null;
            languageIds?: number[];
        }
    ) => {
        try {
            const existing = await translatorsRepository.findById(id);
            if (!existing) throw new AppError('Translator not found', 404, 'NOT_FOUND');

            const data: any = {};
            if (typeof input.name === 'string') data.name = input.name.trim();
            if (typeof input.email === 'string') data.email = input.email.trim().toLowerCase();
            if (typeof input.phone === 'string') data.phone = input.phone.trim();
            if (input.profileImageUrl !== undefined) data.profileImageUrl = input.profileImageUrl;
            if (input.profileImagePublicId !== undefined) data.profileImagePublicId = input.profileImagePublicId;
            if (Array.isArray(input.languageIds)) data.languageIds = normalizeLanguageIds(input.languageIds);

            return await translatorsRepository.updateById(id, data);
        } catch (err) {
            if (isDbUnreachable(err)) {
                throw new AppError('Database not reachable. Please check DATABASE_URL / network and try again.', 503, 'DB_UNREACHABLE');
            }
            throw err;
        }
    },

    remove: async (id: number) => {
        try {
            const existing = await translatorsRepository.findById(id);
            if (!existing) throw new AppError('Translator not found', 404, 'NOT_FOUND');
            await translatorsRepository.deleteById(id);
            return { ok: true } as const;
        } catch (err) {
            if (isDbUnreachable(err)) {
                throw new AppError('Database not reachable. Please check DATABASE_URL / network and try again.', 503, 'DB_UNREACHABLE');
            }
            throw err;
        }
    }
};
