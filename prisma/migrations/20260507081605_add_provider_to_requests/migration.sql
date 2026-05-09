-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "providerId" TEXT;

-- CreateIndex
CREATE INDEX "Request_providerId_idx" ON "Request"("providerId");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
