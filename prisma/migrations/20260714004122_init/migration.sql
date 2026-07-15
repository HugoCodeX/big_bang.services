/*
  Warnings:

  - You are about to drop the column `providerAccountId` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `tokenType` on the `account` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "account_providerId_providerAccountId_key";

-- AlterTable
ALTER TABLE "account" DROP COLUMN "providerAccountId",
DROP COLUMN "tokenType";
