import { prisma } from '../../config/prisma';

export type StarterGuideSubcategories = string[];
export type StarterGuideCategoryGroup = 'APP' | 'INFRASTRUCTURE' | 'OTHERS';

export const starterGuideCategoriesRepository = {
    list: async (filters?: { isStarterKit?: boolean }) => {
        return prisma.starterGuideCategory.findMany({
            where: filters?.isStarterKit !== undefined ? { isStarterKit: filters.isStarterKit } : {},
            orderBy: { id: 'asc' }
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
    }) => {
        return prisma.starterGuideCategory.create({
            data: {
                category: data.category,
                group: data.group,
                subcategories: data.subcategories ?? [],
                description: data.description,
                imageUrl: data.imageUrl,
                imagePublicId: data.imagePublicId,
                isStarterKit: data.isStarterKit ?? true,
                allowProviderRegistration: data.allowProviderRegistration ?? false
            }
        });
    },

    findById: async (id: number) => {
        return prisma.starterGuideCategory.findUnique({ where: { id } });
    },

    updateById: async (id: number, data: any) => {
        return prisma.starterGuideCategory.update({ where: { id }, data });
    },

    deleteById: async (id: number) => {
        return prisma.starterGuideCategory.delete({ where: { id } });
    }
};
