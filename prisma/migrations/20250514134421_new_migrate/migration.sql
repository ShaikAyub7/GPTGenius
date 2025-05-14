/*
  Warnings:

  - You are about to drop the `Chat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Chat";

-- CreateTable
CREATE TABLE "Token" (
    "clerkId" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL DEFAULT 1000,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("clerkId")
);
