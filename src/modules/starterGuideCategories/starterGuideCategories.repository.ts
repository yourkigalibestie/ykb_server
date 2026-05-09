import { prisma } from '../../config/prisma';

export type StarterGuideSubcategories = string[];
export type StarterGuideCategoryGroup = 'APP' | 'INFRASTRUCTURE' | 'OTHERS';

export const starterGuideCategoriesRepository = {
    list: async () => {
        return prisma.starterGuideCategory.findMany({ orderBy: { id: 'asc' } });
    },

    create: async (data: { category: string; group?: StarterGuideCategoryGroup; subcategories?: StarterGuideSubcategories }) => {
        return prisma.starterGuideCategory.create({
            data: {
                category: data.category,
                group: data.group,
                subcategories: data.subcategories ?? []
            }
        });
    },

    findById: async (id: number) => {
        return prisma.starterGuideCategory.findUnique({ where: { id } });
    },

    updateById: async (id: number, data: { category?: string; group?: StarterGuideCategoryGroup; subcategories?: StarterGuideSubcategories }) => {
        return prisma.starterGuideCategory.update({ where: { id }, data });
    },

    deleteById: async (id: number) => {
        return prisma.starterGuideCategory.delete({ where: { id } });
    }
};
