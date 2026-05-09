import { AppError } from '../../utils/appError';
import { languagesRepository, type Prices } from './languages.repository';

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

const normalizePrices = (prices: Prices): Prices => {
    const normalized: Prices = {};

    for (const [rawKey, rawValue] of Object.entries(prices)) {
        const key = String(rawKey).trim();
        if (!key) continue;
        const value = typeof rawValue === 'number' ? rawValue : Number(rawValue);
        if (!Number.isFinite(value) || value <= 0) continue;
        normalized[key] = value;
    }

    return normalized;
};

export const languagesService = {
    list: async () => {
        try {
            return await languagesRepository.list();
        } catch (err) {
            if (isDbUnreachable(err)) return [];
            throw err;
        }
    },

    create: async (input: { title: string; prices: Prices }) => {
        try {
            const title = input.title.trim();
            const prices = normalizePrices(input.prices);
            if (Object.keys(prices).length === 0) {
                throw new AppError('At least one price is required', 400, 'VALIDATION_ERROR');
            }
            return await languagesRepository.create({ title, prices });
        } catch (err) {
            if (isDbUnreachable(err)) {
                throw new AppError('Database not reachable. Please check DATABASE_URL / network and try again.', 503, 'DB_UNREACHABLE');
            }
            throw err;
        }
    },

    update: async (id: number, input: { title?: string; prices?: Prices }) => {
        try {
            const existing = await languagesRepository.findById(id);
            if (!existing) throw new AppError('Language not found', 404, 'NOT_FOUND');

            const data: { title?: string; prices?: Prices } = {};
            if (typeof input.title === 'string') data.title = input.title.trim();
            if (input.prices) {
                const normalized = normalizePrices(input.prices);
                if (Object.keys(normalized).length === 0) {
                    throw new AppError('At least one price is required', 400, 'VALIDATION_ERROR');
                }
                data.prices = normalized;
            }

            return await languagesRepository.updateById(id, data);
        } catch (err) {
            if (isDbUnreachable(err)) {
                throw new AppError('Database not reachable. Please check DATABASE_URL / network and try again.', 503, 'DB_UNREACHABLE');
            }
            throw err;
        }
    },

    remove: async (id: number) => {
        try {
            const existing = await languagesRepository.findById(id);
            if (!existing) throw new AppError('Language not found', 404, 'NOT_FOUND');
            await languagesRepository.deleteById(id);
            return { ok: true } as const;
        } catch (err) {
            if (isDbUnreachable(err)) {
                throw new AppError('Database not reachable. Please check DATABASE_URL / network and try again.', 503, 'DB_UNREACHABLE');
            }
            throw err;
        }
    }
};
