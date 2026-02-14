-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "match_event_type" AS ENUM ('YELLOW_CARD', 'RED_CARD', 'GOAL', 'SUBSTITUTION');

-- CreateTable
CREATE TABLE "club" (
    "id" SERIAL NOT NULL,
    "league_key" TEXT NOT NULL DEFAULT 'global',
    "nombre" TEXT NOT NULL,
    "crest_url" TEXT NOT NULL,

    CONSTRAINT "club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Club_Info" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "titulosNacionales" INTEGER NOT NULL DEFAULT 0,
    "titulosInternac" INTEGER NOT NULL DEFAULT 0,
    "añoFundacion" INTEGER NOT NULL,
    "nombreEstadio" VARCHAR(100) NOT NULL,
    "capacidadEstadio" INTEGER NOT NULL,
    "ciudad" VARCHAR(50) NOT NULL,
    "colores" VARCHAR(100) NOT NULL,
    "entrenador" VARCHAR(100) NOT NULL,

    CONSTRAINT "Club_Info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "league_table_row" (
    "id" BIGSERIAL NOT NULL,
    "league_preset" TEXT NOT NULL,
    "table_index" INTEGER NOT NULL DEFAULT 1,
    "table_title" TEXT,
    "team" TEXT NOT NULL,
    "pts" INTEGER,
    "played" INTEGER,
    "wins" INTEGER,
    "draws" INTEGER,
    "losses" INTEGER,
    "gf" INTEGER NOT NULL DEFAULT 0,
    "ga" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "league_table_row_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_row" (
    "league" TEXT NOT NULL,
    "home_team" TEXT NOT NULL,
    "away_team" TEXT NOT NULL,
    "score_home" INTEGER,
    "score_away" INTEGER,
    "minute" INTEGER,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "match_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "away_club_id" INTEGER,
    "home_club_id" INTEGER,
    "id" SERIAL NOT NULL,
    "espn_id" TEXT,

    CONSTRAINT "match_row_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_event" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "espn_id" TEXT,
    "type" TEXT NOT NULL,
    "minute" INTEGER,
    "clock_display" TEXT,
    "description" TEXT,
    "team_name" TEXT,
    "player_name" TEXT,

    CONSTRAINT "match_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_table" (
    "id" SERIAL NOT NULL,
    "usuario" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "club_id" INTEGER NOT NULL,
    "contrasena" TEXT NOT NULL,

    CONSTRAINT "user_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_table" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "team_id" INTEGER NOT NULL,

    CONSTRAINT "player_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_rating" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "match_id" INTEGER,
    "player_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "club_league_key_idx" ON "club"("league_key");

-- CreateIndex
CREATE UNIQUE INDEX "club_league_key_nombre_key" ON "club"("league_key", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Club_Info_clubId_key" ON "Club_Info"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "league_table_row_league_preset_table_index_team_key" ON "league_table_row"("league_preset", "table_index", "team");

-- CreateIndex
CREATE UNIQUE INDEX "match_row_espn_id_key" ON "match_row"("espn_id");

-- CreateIndex
CREATE INDEX "match_row_home_club_id_idx" ON "match_row"("home_club_id");

-- CreateIndex
CREATE INDEX "match_row_away_club_id_idx" ON "match_row"("away_club_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_row_home_team_away_team_match_date_key" ON "match_row"("home_team", "away_team", "match_date");

-- CreateIndex
CREATE INDEX "match_event_match_id_idx" ON "match_event"("match_id");

-- CreateIndex
CREATE INDEX "match_event_espn_id_idx" ON "match_event"("espn_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_event_match_id_type_minute_player_name_key" ON "match_event"("match_id", "type", "minute", "player_name");

-- CreateIndex
CREATE UNIQUE INDEX "user_table_usuario_key" ON "user_table"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "user_table_mail_key" ON "user_table"("mail");

-- CreateIndex
CREATE INDEX "player_table_team_id_idx" ON "player_table"("team_id");

-- CreateIndex
CREATE INDEX "player_rating_player_id_idx" ON "player_rating"("player_id");

-- CreateIndex
CREATE INDEX "player_rating_match_id_idx" ON "player_rating"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "player_rating_user_id_match_id_player_id_key" ON "player_rating"("user_id", "match_id", "player_id");

-- AddForeignKey
ALTER TABLE "Club_Info" ADD CONSTRAINT "Club_Info_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_row" ADD CONSTRAINT "match_row_away_club_id_fkey" FOREIGN KEY ("away_club_id") REFERENCES "club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_row" ADD CONSTRAINT "match_row_home_club_id_fkey" FOREIGN KEY ("home_club_id") REFERENCES "club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_table" ADD CONSTRAINT "user_table_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_table" ADD CONSTRAINT "player_table_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_rating" ADD CONSTRAINT "player_rating_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match_row"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_rating" ADD CONSTRAINT "player_rating_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_rating" ADD CONSTRAINT "player_rating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

