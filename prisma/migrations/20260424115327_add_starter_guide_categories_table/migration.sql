-- CreateTable
CREATE TABLE "starter_guide_categories" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "subcategories" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "starter_guide_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "starter_guide_categories_category_key" ON "starter_guide_categories"("category");
