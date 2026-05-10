-- AlterTable
ALTER TABLE "starter_guide_categories" ADD COLUMN     "allowProviderRegistration" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "imagePublicId" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isStarterKit" BOOLEAN NOT NULL DEFAULT true;
