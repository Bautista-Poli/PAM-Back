// prisma/seedTableRows.ts

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, '../data/league_table_row.json');
  const jsonData = await fs.readFile(filePath, 'utf-8');
  const tableRows = JSON.parse(jsonData);

  // Optional: limpiamos la tabla antes
  await prisma.league_table_row.deleteMany({});

  await prisma.league_table_row.createMany({
    data: tableRows.map((row: any) => ({
      id: BigInt(row.id), // 👈 necesario porque `id` es BigInt
      league_preset: row.league_preset,
      table_index: row.table_index,
      table_title: row.table_title,
      team: row.team,
      pts: row.pts,
      played: row.played,
      wins: row.wins,
      draws: row.draws,
      losses: row.losses,
      gf: row.gf,
      ga: row.ga,
      updated_at: new Date(row.updated_at),
    })),
    skipDuplicates: true, // 👈 para evitar errores si ya existen
  });

  console.log('✅ Datos insertados correctamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error al insertar datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
