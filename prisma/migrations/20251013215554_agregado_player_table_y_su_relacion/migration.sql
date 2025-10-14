/*
  Warnings:

  - You are about to drop the `club_logo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."club_logo";

-- CreateTable
CREATE TABLE "club" (
    "id" SERIAL NOT NULL,
    "league_key" TEXT NOT NULL DEFAULT 'global',
    "nombre" TEXT NOT NULL,
    "crest_url" TEXT NOT NULL,

    CONSTRAINT "club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_table" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "team_id" INTEGER NOT NULL,

    CONSTRAINT "player_table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "club_league_key_idx" ON "club"("league_key");

-- CreateIndex
CREATE UNIQUE INDEX "club_league_key_nombre_key" ON "club"("league_key", "nombre");

-- CreateIndex
CREATE INDEX "player_table_team_id_idx" ON "player_table"("team_id");

-- AddForeignKey
ALTER TABLE "player_table" ADD CONSTRAINT "player_table_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
