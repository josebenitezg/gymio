/*
  Warnings:

  - A unique constraint covering the columns `[userId,weekStartDate]` on the table `Week` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Week` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Week_weekStartDate_key";

-- AlterTable
ALTER TABLE "public"."Week" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "public"."User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Week_userId_weekStartDate_key" ON "public"."Week"("userId", "weekStartDate");

-- AddForeignKey
ALTER TABLE "public"."Week" ADD CONSTRAINT "Week_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
