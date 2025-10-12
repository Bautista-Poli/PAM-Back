-- CreateTable
CREATE TABLE "club_logo" (
    "league_key" TEXT NOT NULL DEFAULT 'global',
    "name" TEXT NOT NULL,
    "name_norm" TEXT NOT NULL,
    "crest_url" TEXT NOT NULL,
    "pais" TEXT,
    "pais_key" TEXT,

    CONSTRAINT "club_logo_pkey" PRIMARY KEY ("league_key","name_norm")
);

-- CreateTable
CREATE TABLE "league_table_row" (
    "id" BIGSERIAL NOT NULL,
    "league_preset" TEXT NOT NULL,
    "table_index" INTEGER NOT NULL DEFAULT 1,
    "table_title" TEXT,
    "pos" INTEGER,
    "team" TEXT NOT NULL,
    "crest" TEXT,
    "pts" INTEGER,
    "played" INTEGER,
    "wins" INTEGER,
    "draws" INTEGER,
    "losses" INTEGER,
    "gf" INTEGER,
    "ga" INTEGER,
    "diff" INTEGER,
    "source_url" TEXT,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "league_table_row_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_row" (
    "id" TEXT NOT NULL,
    "match_date" TEXT NOT NULL,
    "league" TEXT,
    "home_team" TEXT,
    "away_team" TEXT,
    "score_home" INTEGER,
    "score_away" INTEGER,
    "status" TEXT,
    "minute" INTEGER,
    "source_url" TEXT,
    "last_hash" TEXT,
    "first_seen" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_row_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "club_logo_pais_idx" ON "club_logo"("pais_key", "name_norm");

-- CreateIndex
CREATE INDEX "idx_league_order" ON "league_table_row"("league_preset", "table_index", "pos");

-- CreateIndex
CREATE UNIQUE INDEX "league_table_row_league_preset_table_index_team_key" ON "league_table_row"("league_preset", "table_index", "team");
