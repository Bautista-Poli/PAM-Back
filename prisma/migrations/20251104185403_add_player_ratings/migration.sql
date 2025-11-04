-- CreateTable
CREATE TABLE "player_rating" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "match_id" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "player_rating_player_id_idx" ON "player_rating"("player_id");

-- CreateIndex
CREATE INDEX "player_rating_match_id_idx" ON "player_rating"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "player_rating_user_id_match_id_player_id_key" ON "player_rating"("user_id", "match_id", "player_id");

-- AddForeignKey
ALTER TABLE "player_rating" ADD CONSTRAINT "player_rating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_rating" ADD CONSTRAINT "player_rating_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match_row"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_rating" ADD CONSTRAINT "player_rating_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
