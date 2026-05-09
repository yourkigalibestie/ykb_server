-- CreateTable
CREATE TABLE "languages" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "prices" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "languages_title_key" ON "languages"("title");
