-- AlterTable
ALTER TABLE "match_row" ADD COLUMN     "group_name" TEXT,
ADD COLUMN     "leg" INTEGER DEFAULT 1,
ADD COLUMN     "round" TEXT;
