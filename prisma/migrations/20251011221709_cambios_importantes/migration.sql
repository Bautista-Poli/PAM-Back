/*
  Warnings:

  - You are about to drop the column `crest` on the `league_table_row` table. All the data in the column will be lost.
  - You are about to drop the column `diff` on the `league_table_row` table. All the data in the column will be lost.
  - You are about to drop the column `pos` on the `league_table_row` table. All the data in the column will be lost.
  - You are about to drop the column `source_url` on the `league_table_row` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `match_row` table. All the data in the column will be lost.
  - The `match_date` column on the `match_row` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `pais` on table `club_logo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pais_key` on table `club_logo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gf` on table `league_table_row` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ga` on table `league_table_row` required. This step will fail if there are existing NULL values in that column.
  - Made the column `league` on table `match_row` required. This step will fail if there are existing NULL values in that column.
  - Made the column `home_team` on table `match_row` required. This step will fail if there are existing NULL values in that column.
  - Made the column `away_team` on table `match_row` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."idx_league_order";

-- AlterTable
ALTER TABLE "club_logo" ALTER COLUMN "pais" SET NOT NULL,
ALTER COLUMN "pais_key" SET NOT NULL;

-- AlterTable
ALTER TABLE "league_table_row" DROP COLUMN "crest",
DROP COLUMN "diff",
DROP COLUMN "pos",
DROP COLUMN "source_url",
ALTER COLUMN "gf" SET NOT NULL,
ALTER COLUMN "gf" SET DEFAULT 0,
ALTER COLUMN "ga" SET NOT NULL,
ALTER COLUMN "ga" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "match_row" DROP COLUMN "status",
DROP COLUMN "match_date",
ADD COLUMN     "match_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "league" SET NOT NULL,
ALTER COLUMN "home_team" SET NOT NULL,
ALTER COLUMN "away_team" SET NOT NULL;
