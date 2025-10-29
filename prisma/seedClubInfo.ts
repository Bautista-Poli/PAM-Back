import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

type ClubInfoData = {
  club_nombre: string;
  titulosNacionales: number;
  titulosInternacionales: number;
  nombreEstadio: string;
  capacidadEstadio: number;
  ciudad: string;
  colores: string;
  añoFundacion: number;
  entrenador: string;
};

async function main() {
  console.log('🧹 Borrando la información de clubes existente...');
  await prisma.club_Info.deleteMany();

  const filePath = path.join(__dirname, '../data/club_info.json');
  const rawData = JSON.parse(await fs.readFile(filePath, 'utf-8')) as ClubInfoData[];

  const toInsert = [];

  for (const info of rawData) {
    const club_nombre = info?.club_nombre?.trim();
    if (!club_nombre) {
      console.warn(`⚠️ Entrada sin 'club_nombre'. Se omitirá.`);
      continue;
    }

    const club = await prisma.club.findFirst({
      where: { nombre: club_nombre },
    });

    if (!club) {
      console.warn(`⚠️ Club no encontrado para nombre="${club_nombre}". Se omitirá la información.`);
      continue;
    }

    const { club_nombre: _, ...dataSinNombre } = info;
    
    toInsert.push({
      ...dataSinNombre,
      clubId: club.id,
    });
  }

  if (toInsert.length > 0) {
    console.log(`📦 Insertando información para ${toInsert.length} clubes...`);
    const res = await prisma.club_Info.createMany({
      data: toInsert,
      skipDuplicates: true,
    });
    console.log(`✅ Insertados: ${res.count}`);
  } else {
    console.log('No se encontró información de clubes para insertar.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed de Club_Info:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());