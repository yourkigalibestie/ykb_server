-- CreateEnum
CREATE TYPE "StarterGuideCategoryGroup" AS ENUM ('APP', 'INFRASTRUCTURE', 'OTHERS');

-- AlterTable
ALTER TABLE "starter_guide_categories" ADD COLUMN     "group" "StarterGuideCategoryGroup" NOT NULL DEFAULT 'OTHERS';
