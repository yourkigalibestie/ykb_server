import { prisma } from '../../config/prisma';
import type { Prisma } from '@prisma/client';

export type StarterGuideSubcategories = string[];
export type StarterGuideCategoryGroup = 'APP' | 'INFRASTRUCTURE' | 'OTHERS';

let hasTranslationsColumn: boolean | null = null;
let hasTranslationsColumnCheckedAt: number | null = null;

const TRANSLATIONS_COLUMN_TTL_MS = 30_000;

const BASE_SELECT = {
    id: true,
    category: true,
    group: true,
    subcategories: true,
    description: true,
    imageUrl: true,
    imagePublicId: true,
    isStarterKit: true,
    allowProviderRegistration: true,
    createdAt: true,
    updatedAt: true
} satisfies Prisma.StarterGuideCategorySelect;

const ensureTranslationsColumn = async (): Promise<boolean> => {
    if (
        hasTranslationsColumn !== null &&
        hasTranslationsColumnCheckedAt !== null &&
        Date.now() - hasTranslationsColumnCheckedAt < TRANSLATIONS_COLUMN_TTL_MS
    ) {
        return hasTranslationsColumn;
    }

    try {
        const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'starter_guide_categories'
                  AND column_name = 'translations'
            ) AS "exists";
        `;

        hasTranslationsColumn = rows?.[0]?.exists ?? false;
        hasTranslationsColumnCheckedAt = Date.now();
    } catch {
        hasTranslationsColumn = false;
        hasTranslationsColumnCheckedAt = Date.now();
    }

    return hasTranslationsColumn;
};

const getSelect = async () => {
    const includeTranslations = await ensureTranslationsColumn();
    return {
        ...BASE_SELECT,
        ...(includeTranslations ? { translations: true } : {})
    } as Prisma.StarterGuideCategorySelect;
};

export const starterGuideCategoriesRepository = {
    list: async (filters?: { isStarterKit?: boolean }) => {
        const select = await getSelect();
        return prisma.starterGuideCategory.findMany({
            where: filters?.isStarterKit !== undefined ? { isStarterKit: filters.isStarterKit } : {},
            orderBy: { id: 'asc' },
            select
        });
    },

    create: async (data: {
        category: string;
        group?: StarterGuideCategoryGroup;
        subcategories?: StarterGuideSubcategories;
        description?: string | null;
        imageUrl?: string | null;
        imagePublicId?: string | null;
        isStarterKit?: boolean;
        allowProviderRegistration?: boolean;
        translations?: unknown;
    }) => {
        if (data.translations !== undefined && hasTranslationsColumn === false) {
            hasTranslationsColumn = null;
            hasTranslationsColumnCheckedAt = null;
        }

        const includeTranslations = await ensureTranslationsColumn();
        const select = await getSelect();

        const prismaData: Prisma.StarterGuideCategoryCreateInput = {
            category: data.category,
            group: data.group,
            subcategories: data.subcategories ?? [],
            description: data.description,
            imageUrl: data.imageUrl,
            imagePublicId: data.imagePublicId,
            isStarterKit: data.isStarterKit ?? true,
            allowProviderRegistration: data.allowProviderRegistration ?? false
        };

        if (includeTranslations && data.translations !== undefined) {
            (prismaData as any).translations = data.translations;
        }

        return prisma.starterGuideCategory.create({
            data: prismaData,
            select
        });
    },

    findById: async (id: number) => {
        const select = await getSelect();
        return prisma.starterGuideCategory.findUnique({ where: { id }, select });
    },

    updateById: async (id: number, data: any) => {
        if (data?.translations !== undefined && hasTranslationsColumn === false) {
            hasTranslationsColumn = null;
            hasTranslationsColumnCheckedAt = null;
        }

        const includeTranslations = await ensureTranslationsColumn();
        const select = await getSelect();

        const prismaData = { ...data };
        if (!includeTranslations) {
            delete prismaData.translations;
        }

        return prisma.starterGuideCategory.update({ where: { id }, data: prismaData, select });
    },

    deleteById: async (id: number) => {
        const select = await getSelect();
        return prisma.starterGuideCategory.delete({ where: { id }, select });
    }
};
