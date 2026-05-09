-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "adminConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "adminResolvedAt" TIMESTAMP(3),
ADD COLUMN     "customerResolvedAt" TIMESTAMP(3),
ADD COLUMN     "requiresAdminConfirmation" BOOLEAN NOT NULL DEFAULT false;
