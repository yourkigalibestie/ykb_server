import { Prisma } from '@prisma/client';
import { ProviderStatus, Role } from '../../utils/prismaEnums';
import { AppError } from '../../utils/appError';
import { slugify } from '../../utils/slug';
import { servicesRepository } from './services.repository';
import type { AddServiceImageInput, CreateCategoryInput, CreateServiceInput, UpdateServiceInput } from './services.types';

export const servicesService = {
    listCategories: async () => {
        return servicesRepository.listCategories();
    },

    createCategory: async (input: CreateCategoryInput) => {
        const slug = slugify(input.name);
        return servicesRepository.createCategory({ name: input.name, slug });
    },

    listServices: async () => {
        return servicesRepository.listServices();
    },

    getService: async (serviceId: string) => {
        const service = await servicesRepository.findServiceById(serviceId);
        if (!service) throw new AppError('Service not found', 404, 'NOT_FOUND');
        return service;
    },

    createService: async (auth: { userId: string; role: Role }, input: CreateServiceInput) => {
        const category = await servicesRepository.findCategoryById(input.categoryId);
        if (!category) throw new AppError('Category not found', 404, 'NOT_FOUND');

        const isPlatformOwned = input.isPlatformOwned ?? false;
        if (isPlatformOwned && auth.role !== Role.ADMIN) {
            throw new AppError('Only admin can create platform-owned services', 403, 'FORBIDDEN');
        }

        let providerId: string | null | undefined = null;

        if (!isPlatformOwned) {
            if (auth.role !== Role.PROVIDER && auth.role !== Role.ADMIN) {
                throw new AppError('Only providers can create services', 403, 'FORBIDDEN');
            }

            if (auth.role === Role.PROVIDER) {
                const provider = await servicesRepository.findProviderByUserId(auth.userId);
                if (!provider) throw new AppError('Provider profile not found', 404, 'NOT_FOUND');
                if (provider.status !== ProviderStatus.APPROVED) {
                    throw new AppError('Provider is not approved', 403, 'FORBIDDEN');
                }
                providerId = provider.id;
            }
        }

        const service = await servicesRepository.createService({
            categoryId: input.categoryId,
            title: input.title,
            description: input.description,
            basePrice: new Prisma.Decimal(input.basePrice),
            currency: input.currency ?? 'RWF',
            isPlatformOwned,
            providerId
        });

        // Create service image if provided
        if (input.imageUrl && input.imagePublicId) {
            await servicesRepository.createServiceImage({
                serviceId: service.id,
                url: input.imageUrl,
                publicId: input.imagePublicId
            });
        }

        return servicesRepository.findServiceById(service.id);
    },

    updateService: async (auth: { userId: string; role: Role }, serviceId: string, input: UpdateServiceInput) => {
        const service = await servicesRepository.findServiceById(serviceId);
        if (!service) throw new AppError('Service not found', 404, 'NOT_FOUND');

        if (auth.role !== Role.ADMIN) {
            if (auth.role !== Role.PROVIDER) throw new AppError('Forbidden', 403, 'FORBIDDEN');
            const provider = await servicesRepository.findProviderByUserId(auth.userId);
            if (!provider) throw new AppError('Provider profile not found', 404, 'NOT_FOUND');
            if (service.providerId !== provider.id) throw new AppError('Forbidden', 403, 'FORBIDDEN');
        }

        if (input.categoryId) {
            const category = await servicesRepository.findCategoryById(input.categoryId);
            if (!category) throw new AppError('Category not found', 404, 'NOT_FOUND');
        }

        const data: any = {
            ...input
        };
        if (input.basePrice) data.basePrice = new Prisma.Decimal(input.basePrice);
        if (input.description === null) data.description = null;

        // Remove imageUrl and imagePublicId from the main service update data
        delete data.imageUrl;
        delete data.imagePublicId;

        // Update the service
        const updatedService = await servicesRepository.updateServiceById(serviceId, data);

        // Handle image updates
        if (input.imageUrl && input.imagePublicId) {
            // Delete existing images
            await servicesRepository.deleteServiceImages(serviceId);
            
            // Create new image
            await servicesRepository.createServiceImage({
                serviceId,
                url: input.imageUrl,
                publicId: input.imagePublicId
            });
        }

        return servicesRepository.findServiceById(serviceId);
    },

    addServiceImage: async (auth: { userId: string; role: Role }, serviceId: string, input: AddServiceImageInput) => {
        const service = await servicesRepository.findServiceById(serviceId);
        if (!service) throw new AppError('Service not found', 404, 'NOT_FOUND');

        if (auth.role !== Role.ADMIN) {
            if (auth.role !== Role.PROVIDER) throw new AppError('Forbidden', 403, 'FORBIDDEN');
            const provider = await servicesRepository.findProviderByUserId(auth.userId);
            if (!provider) throw new AppError('Provider profile not found', 404, 'NOT_FOUND');
            if (service.providerId !== provider.id) throw new AppError('Forbidden', 403, 'FORBIDDEN');
        }

        await servicesRepository.addImage(serviceId, input);
        return servicesRepository.findServiceById(serviceId);
    }
};
