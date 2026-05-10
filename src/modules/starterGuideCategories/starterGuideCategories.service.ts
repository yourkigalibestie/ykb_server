import { AppError } from '../../utils/appError';
import {
    starterGuideCategoriesRepository,
    type StarterGuideCategoryGroup,
    type StarterGuideSubcategories
} from './starterGuideCategories.repository';

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

const normalizeSubcategories = (subcategories: StarterGuideSubcategories): StarterGuideSubcategories => {
    return subcategories
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0);
};

const normalizeGroup = (group: StarterGuideCategoryGroup | undefined): StarterGuideCategoryGroup => {
    return group ?? 'OTHERS';
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
    }) => {
        try {
            const category = input.category.trim();
            const group = normalizeGroup(input.group);
            const subcategories = normalizeSubcategories(input.subcategories ?? []);
            return await starterGuideCategoriesRepository.create({
                category,
                group,
                subcategories: subcategories.length > 0 ? subcategories : [],
                description: input.description?.trim() || null,
                imageUrl: input.imageUrl?.trim() || null,
                imagePublicId: input.imagePublicId?.trim() || null,
                isStarterKit: input.isStarterKit ?? true,
                allowProviderRegistration: input.allowProviderRegistration ?? false
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
