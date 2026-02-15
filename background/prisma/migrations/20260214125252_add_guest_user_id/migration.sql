-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "Guest_tableId_userId_idx" ON "Guest"("tableId", "userId");

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
