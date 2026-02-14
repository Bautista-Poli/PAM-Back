-- CreateTable
CREATE TABLE "match_comment" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "match_comment_match_id_idx" ON "match_comment"("match_id");

-- AddForeignKey
ALTER TABLE "match_comment" ADD CONSTRAINT "match_comment_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match_row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_comment" ADD CONSTRAINT "match_comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_table"("id") ON DELETE CASCADE ON UPDATE CASCADE;
