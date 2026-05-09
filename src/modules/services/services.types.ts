export type CreateCategoryInput = {
    name: string;
};

export type CreateServiceInput = {
    categoryId: string;
    title: string;
    description?: string | null;
    basePrice: string;
    currency?: string;
    isPlatformOwned?: boolean;
    imageUrl?: string | null;
    imagePublicId?: string | null;
};

export type UpdateServiceInput = Partial<CreateServiceInput>;

export type AddServiceImageInput = {
    url: string;
    publicId: string;
};
