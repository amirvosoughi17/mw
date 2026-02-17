-- CreateEnum
CREATE TYPE "PinType" AS ENUM ('STOCK', 'CRYPTO', 'POLYMARKET');

-- CreateTable
CREATE TABLE "pinned_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PinType" NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT,
    "imageUrl" TEXT,
    "value" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pinned_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pinned_items_userId_type_externalId_key" ON "pinned_items"("userId", "type", "externalId");

-- AddForeignKey
ALTER TABLE "pinned_items" ADD CONSTRAINT "pinned_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
