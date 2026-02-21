/*
  Warnings:

  - You are about to drop the column `hostSessionId` on the `Table` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sessionId,tableId]` on the table `Guest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdBy` to the `Dish` table without a default value. This is not possible if the table is not empty.
  - Added the required column `familyId` to the `Dish` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `Table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `familyId` to the `Table` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FamilyMemberRole" AS ENUM ('OWNER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "Guest" DROP CONSTRAINT "Guest_tableId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_dishId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_guestId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_tableId_fkey";

-- AlterTable
ALTER TABLE "Dish" ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "familyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Table" DROP COLUMN "hostSessionId",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "addressDetail" TEXT,
ADD COLUMN     "creatorId" TEXT NOT NULL,
ADD COLUMN     "familyId" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "wechatOpenId" TEXT,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "avatar" TEXT,
    "address" TEXT,
    "addressDetail" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "FamilyMemberRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyInvitation" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FamilyInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationUsage" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvitationUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_wechatOpenId_key" ON "User"("wechatOpenId");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_wechatOpenId_idx" ON "User"("wechatOpenId");

-- CreateIndex
CREATE INDEX "Family_ownerId_idx" ON "Family"("ownerId");

-- CreateIndex
CREATE INDEX "FamilyMember_userId_idx" ON "FamilyMember"("userId");

-- CreateIndex
CREATE INDEX "FamilyMember_familyId_idx" ON "FamilyMember"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMember_familyId_userId_key" ON "FamilyMember"("familyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyInvitation_inviteCode_key" ON "FamilyInvitation"("inviteCode");

-- CreateIndex
CREATE INDEX "FamilyInvitation_inviteCode_idx" ON "FamilyInvitation"("inviteCode");

-- CreateIndex
CREATE INDEX "FamilyInvitation_familyId_idx" ON "FamilyInvitation"("familyId");

-- CreateIndex
CREATE INDEX "InvitationUsage_invitationId_idx" ON "InvitationUsage"("invitationId");

-- CreateIndex
CREATE INDEX "InvitationUsage_userId_idx" ON "InvitationUsage"("userId");

-- CreateIndex
CREATE INDEX "Dish_familyId_idx" ON "Dish"("familyId");

-- CreateIndex
CREATE INDEX "Dish_createdBy_idx" ON "Dish"("createdBy");

-- CreateIndex
CREATE INDEX "Guest_tableId_idx" ON "Guest"("tableId");

-- CreateIndex
CREATE UNIQUE INDEX "Guest_sessionId_tableId_key" ON "Guest"("sessionId", "tableId");

-- CreateIndex
CREATE INDEX "Table_familyId_idx" ON "Table"("familyId");

-- CreateIndex
CREATE INDEX "Table_creatorId_idx" ON "Table"("creatorId");

-- CreateIndex
CREATE INDEX "Vote_tableId_idx" ON "Vote"("tableId");

-- CreateIndex
CREATE INDEX "Vote_dishId_idx" ON "Vote"("dishId");

-- AddForeignKey
ALTER TABLE "Family" ADD CONSTRAINT "Family_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyInvitation" ADD CONSTRAINT "FamilyInvitation_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationUsage" ADD CONSTRAINT "InvitationUsage_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "FamilyInvitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dish" ADD CONSTRAINT "Dish_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dish" ADD CONSTRAINT "Dish_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;
