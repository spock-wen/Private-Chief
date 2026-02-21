-- CreateEnum
CREATE TYPE "Category" AS ENUM ('HOT_DISH', 'COLD_DISH', 'SOUP', 'STAPLE', 'DRINK');

-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('PLANNING', 'VOTING', 'LOCKED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Dish" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "category" "Category" NOT NULL,
    "tags" TEXT[],
    "allergens" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "status" "TableStatus" NOT NULL DEFAULT 'PLANNING',
    "totalExpense" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "preferences" TEXT,
    "tableId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CandidateDishes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_FinalDishes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Guest_sessionId_idx" ON "Guest"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_guestId_dishId_tableId_key" ON "Vote"("guestId", "dishId", "tableId");

-- CreateIndex
CREATE UNIQUE INDEX "_CandidateDishes_AB_unique" ON "_CandidateDishes"("A", "B");

-- CreateIndex
CREATE INDEX "_CandidateDishes_B_index" ON "_CandidateDishes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FinalDishes_AB_unique" ON "_FinalDishes"("A", "B");

-- CreateIndex
CREATE INDEX "_FinalDishes_B_index" ON "_FinalDishes"("B");

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CandidateDishes" ADD CONSTRAINT "_CandidateDishes_A_fkey" FOREIGN KEY ("A") REFERENCES "Dish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CandidateDishes" ADD CONSTRAINT "_CandidateDishes_B_fkey" FOREIGN KEY ("B") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FinalDishes" ADD CONSTRAINT "_FinalDishes_A_fkey" FOREIGN KEY ("A") REFERENCES "Dish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FinalDishes" ADD CONSTRAINT "_FinalDishes_B_fkey" FOREIGN KEY ("B") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;
