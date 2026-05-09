-- CreateTable
CREATE TABLE "translators" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "profileImageUrl" TEXT,
    "profileImagePublicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translator_languages" (
    "translatorId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,

    CONSTRAINT "translator_languages_pkey" PRIMARY KEY ("translatorId","languageId")
);

-- CreateIndex
CREATE UNIQUE INDEX "translators_email_key" ON "translators"("email");

-- CreateIndex
CREATE INDEX "translator_languages_languageId_idx" ON "translator_languages"("languageId");

-- AddForeignKey
ALTER TABLE "translator_languages" ADD CONSTRAINT "translator_languages_translatorId_fkey" FOREIGN KEY ("translatorId") REFERENCES "translators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translator_languages" ADD CONSTRAINT "translator_languages_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
