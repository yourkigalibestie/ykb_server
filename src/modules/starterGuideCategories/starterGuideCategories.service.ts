import { AppError } from '../../utils/appError';
import {
    starterGuideCategoriesRepository,
    type StarterGuideCategoryGroup,
    type StarterGuideSubcategories
} from './starterGuideCategories.repository';

type StarterGuideTranslation = {
    language: 'en' | 'fr';
    category: string;
    description?: string | null;
    subcategories?: StarterGuideSubcategories | null;
};

const isDbUnreachable = (err: unknown): boolean => {
    const anyErr = err as any;
    const code =
        typeof anyErr?.code === 'string'
            ? anyErr.code
            : typeof anyErr?.errorCode === 'string'
                ? anyErr.errorCode
                : '';

    if (code === 'P1001') return true;

    // PrismaClientInitializationError sometimes occurs when the DB is unreachable
    // and doesn't expose a P1001 code. Detect by name or message heuristics.
    if (anyErr?.name === 'PrismaClientInitializationError') return true;

    const msg = typeof anyErr?.message === 'string' ? anyErr.message : '';
    if (msg.includes("Can't reach database server") || msg.includes('connect ECONNREFUSED') || msg.includes('getaddrinfo ENOTFOUND')) {
        return true;
    }

    return false;
};

const normalizeSubcategories = (subcategories: StarterGuideSubcategories): StarterGuideSubcategories => {
    return subcategories
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0);
};

const normalizeGroup = (group: StarterGuideCategoryGroup | undefined): StarterGuideCategoryGroup => {
    return group ?? 'OTHERS';
};

const normalizeTranslations = (translations: StarterGuideTranslation[] | undefined): StarterGuideTranslation[] | null => {
    if (!Array.isArray(translations)) return null;

    const rows = translations
        .map((row) => {
            const language = row?.language === 'fr' ? 'fr' : 'en';
            const category = typeof row?.category === 'string' ? row.category.trim() : '';
            if (!category) return null;

            const description = typeof row?.description === 'string' ? row.description.trim() || null : row?.description ?? null;
            const subcategories = Array.isArray(row?.subcategories) ? normalizeSubcategories(row.subcategories) : row?.subcategories ?? null;

            return { language, category, description, subcategories } as StarterGuideTranslation;
        })
        .filter((row): row is StarterGuideTranslation => Boolean(row));

    return rows.length > 0 ? rows : null;
};

export const starterGuideCategoriesService = {
    list: async (filters?: { isStarterKit?: boolean }) => {
        try {
            return await starterGuideCategoriesRepository.list(filters);
        } catch (err) {
            if (isDbUnreachable(err)) return [];
            throw err;
        }
    },

    create: async (input: {
        category: string;
        group?: StarterGuideCategoryGroup;
        subcategories?: StarterGuideSubcategories;
        description?: string;
        imageUrl?: string;
        imagePublicId?: string;
        isStarterKit?: boolean;
        allowProviderRegistration?: boolean;
        translations?: StarterGuideTranslation[];
    }) => {
        try {
            const category = input.category.trim();
            const group = normalizeGroup(input.group);
            const subcategories = normalizeSubcategories(input.subcategories ?? []);
            const translations = normalizeTranslations(input.translations);
            return await starterGuideCategoriesRepository.create({
                category,
                group,
                subcategories: subcategories.length > 0 ? subcategories : [],
                description: input.description?.trim() || null,
                imageUrl: input.imageUrl?.trim() || null,
                imagePublicId: input.imagePublicId?.trim() || null,
                isStarterKit: input.isStarterKit ?? true,
                allowProviderRegistration: input.allowProviderRegistration ?? false,
                translations
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
            category?: string;
            group?: StarterGuideCategoryGroup;
            subcategories?: StarterGuideSubcategories;
            description?: string;
            imageUrl?: string;
            imagePublicId?: string;
            isStarterKit?: boolean;
            allowProviderRegistration?: boolean;
            translations?: StarterGuideTranslation[];
        }
    ) => {
        try {
            const existing = await starterGuideCategoriesRepository.findById(id);
            if (!existing) throw new AppError('Starter guide category not found', 404, 'NOT_FOUND');

            const data: any = {};
            if (typeof input.category === 'string') data.category = input.category.trim();
            if (typeof input.group === 'string') data.group = input.group;
            if (input.subcategories) data.subcategories = normalizeSubcategories(input.subcategories);
            if (typeof input.description === 'string') data.description = input.description.trim() || null;
            if (typeof input.imageUrl === 'string') data.imageUrl = input.imageUrl.trim() || null;
            if (typeof input.imagePublicId === 'string') data.imagePublicId = input.imagePublicId.trim() || null;
            if (typeof input.isStarterKit === 'boolean') data.isStarterKit = input.isStarterKit;
            if (typeof input.allowProviderRegistration === 'boolean') data.allowProviderRegistration = input.allowProviderRegistration;
            if (Array.isArray(input.translations)) data.translations = normalizeTranslations(input.translations);

            return await starterGuideCategoriesRepository.updateById(id, data);
        } catch (err) {
            if (isDbUnreachable(err)) {
                throw new AppError('Database not reachable. Please check DATABASE_URL / network and try again.', 503, 'DB_UNREACHABLE');
            }
            throw err;
        }
    },

    remove: async (id: number) => {
        try {
            const existing = await starterGuideCategoriesRepository.findById(id);
            if (!existing) throw new AppError('Starter guide category not found', 404, 'NOT_FOUND');
            await starterGuideCategoriesRepository.deleteById(id);
            return { ok: true } as const;
        } catch (err) {
            if (isDbUnreachable(err)) {
                throw new AppError('Database not reachable. Please check DATABASE_URL / network and try again.', 503, 'DB_UNREACHABLE');
            }
            throw err;
        }
    }
};
