/*
  Warnings:

  - The primary key for the `match_row` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `first_seen` on the `match_row` table. All the data in the column will be lost.
  - You are about to drop the column `last_hash` on the `match_row` table. All the data in the column will be lost.
  - You are about to drop the column `source_url` on the `match_row` table. All the data in the column will be lost.
  - The `id` column on the `match_row` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "match_row" DROP CONSTRAINT "match_row_pkey",
DROP COLUMN "first_seen",
DROP COLUMN "last_hash",
DROP COLUMN "source_url",
ADD COLUMN     "away_club_id" INTEGER,
ADD COLUMN     "home_club_id" INTEGER,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "match_row_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "match_row_home_club_id_idx" ON "match_row"("home_club_id");

-- CreateIndex
CREATE INDEX "match_row_away_club_id_idx" ON "match_row"("away_club_id");

-- AddForeignKey
ALTER TABLE "match_row" ADD CONSTRAINT "match_row_home_club_id_fkey" FOREIGN KEY ("home_club_id") REFERENCES "club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_row" ADD CONSTRAINT "match_row_away_club_id_fkey" FOREIGN KEY ("away_club_id") REFERENCES "club"("id") ON DELETE SET NULL ON UPDATE CASCADE;
