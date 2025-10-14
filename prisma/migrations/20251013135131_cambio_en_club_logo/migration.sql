/*
  Warnings:

  - The primary key for the `club_logo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name_norm` on the `club_logo` table. All the data in the column will be lost.
  - You are about to drop the column `pais` on the `club_logo` table. All the data in the column will be lost.
  - You are about to drop the column `pais_key` on the `club_logo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[league_key,name]` on the table `club_logo` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."club_logo_pais_idx";

-- AlterTable
ALTER TABLE "club_logo" DROP CONSTRAINT "club_logo_pkey",
DROP COLUMN "name_norm",
DROP COLUMN "pais",
DROP COLUMN "pais_key",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "club_logo_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "club_logo_league_key_idx" ON "club_logo"("league_key");

-- CreateIndex
CREATE UNIQUE INDEX "club_logo_league_key_name_key" ON "club_logo"("league_key", "name");
