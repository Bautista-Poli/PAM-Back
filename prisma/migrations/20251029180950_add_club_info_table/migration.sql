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

-- CreateIndex
CREATE UNIQUE INDEX "Club_Info_clubId_key" ON "Club_Info"("clubId");

-- AddForeignKey
ALTER TABLE "Club_Info" ADD CONSTRAINT "Club_Info_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
