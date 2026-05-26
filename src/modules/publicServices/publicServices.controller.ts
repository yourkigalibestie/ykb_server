import { Request, Response } from 'express';
import { starterGuideCategoriesService } from '../starterGuideCategories/starterGuideCategories.service';

function normalizeTitle(value: string) {
    return value.trim().replace(/\s+/g, ' ');
}

function buildCategoryDescription(category: any) {
    const subcategories = Array.isArray(category.subcategories)
        ? category.subcategories.map((item: string) => item.trim()).filter((item: string) => item.length > 0)
        : [];

    if (subcategories.length > 0) {
        return `Explore ${normalizeTitle(category.category)} and its related options in ${category.group ?? 'other services'}.`;
    }

    return `Explore ${normalizeTitle(category.category)} services in ${category.group ?? 'other services'}.`;
}

function toNegativeId(seed: number): number {
    return -Math.abs(seed);
}

export const publicServicesController = {
    list: async (_req: Request, res: Response) => {
        const categories = await starterGuideCategoriesService.list();

        const services: Array<any> = [];

        categories.forEach((category: any) => {
            if (!category.allowProviderRegistration) return;

            const categoryTitle = normalizeTitle(category.category);
            services.push({
                id: toNegativeId(category.id * 1000 + 1),
                title: categoryTitle,
                description: buildCategoryDescription(category),
                group: category.group ?? null,
                allowProviderRegistration: category.allowProviderRegistration
            });

            const subcategories = Array.isArray(category.subcategories) ? category.subcategories : [];
            subcategories.forEach((subcategory: string, index: number) => {
                const cleanSub = normalizeTitle(subcategory);
                if (!cleanSub) return;
                services.push({
                    id: toNegativeId(category.id * 1000 + index + 2),
                    title: cleanSub,
                    description: `Explore ${cleanSub} services under ${categoryTitle}.`,
                    group: category.group ?? null,
                    allowProviderRegistration: category.allowProviderRegistration
                });
            });
        });

        res.json({ services });
    }
};
