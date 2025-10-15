-- CreateTable
CREATE TABLE "user_table" (
    "id" SERIAL NOT NULL,
    "usuario" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "club_id" INTEGER NOT NULL,
    "contrasena" TEXT NOT NULL,

    CONSTRAINT "user_table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_table_usuario_key" ON "user_table"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "user_table_mail_key" ON "user_table"("mail");

-- AddForeignKey
ALTER TABLE "user_table" ADD CONSTRAINT "user_table_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
