-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "mainService" TEXT,
ADD COLUMN     "moneyRange" TEXT,
ADD COLUMN     "serviceOfferings" JSONB;
