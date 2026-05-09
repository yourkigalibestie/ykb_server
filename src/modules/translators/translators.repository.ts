import { prisma } from '../../config/prisma';

export type TranslatorCreateInput = {
    name: string;
    email: string;
    phone: string;
    profileImageUrl?: string | null;
    profileImagePublicId?: string | null;
    languageIds: number[];
};

export type TranslatorUpdateInput = Partial<TranslatorCreateInput>;

export const translatorsRepository = {
    list: async (filter?: { languageId?: number }) => {
        const languageId = filter?.languageId;

        return prisma.translator.findMany({
            where: languageId
                ? {
                      languages: {
                          some: {
                              languageId
                          }
                      }
                  }
                : undefined,
            include: {
                languages: {
                    include: {
                        language: true
                    }
                }
            },
            orderBy: { id: 'asc' }
        });
    },

    findById: async (id: number) => {
        return prisma.translator.findUnique({
            where: { id },
            include: {
                languages: {
                    include: { language: true }
                }
            }
        });
    },

    create: async (data: TranslatorCreateInput) => {
        return prisma.translator.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                profileImageUrl: data.profileImageUrl ?? null,
                profileImagePublicId: data.profileImagePublicId ?? null,
                languages: {
                    create: data.languageIds.map((languageId) => ({ languageId }))
                }
            },
            include: {
                languages: {
                    include: { language: true }
                }
            }
        });
    },

    updateById: async (id: number, data: TranslatorUpdateInput) => {
        const languageIds = Array.isArray(data.languageIds) ? data.languageIds : null;

        return prisma.translator.update({
            where: { id },
            data: {
                ...(typeof data.name === 'string' ? { name: data.name } : {}),
                ...(typeof data.email === 'string' ? { email: data.email } : {}),
                ...(typeof data.phone === 'string' ? { phone: data.phone } : {}),
                ...(data.profileImageUrl !== undefined ? { profileImageUrl: data.profileImageUrl ?? null } : {}),
                ...(data.profileImagePublicId !== undefined ? { profileImagePublicId: data.profileImagePublicId ?? null } : {}),
                ...(languageIds
                    ? {
                          languages: {
                              deleteMany: {},
                              create: languageIds.map((languageId) => ({ languageId }))
                          }
                      }
                    : {})
            },
            include: {
                languages: {
                    include: { language: true }
                }
            }
        });
    },

    deleteById: async (id: number) => {
        return prisma.translator.delete({ where: { id } });
    }
};
