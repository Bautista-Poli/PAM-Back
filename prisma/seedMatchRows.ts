// prisma/seedMatchRows.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, '../data/match_row.json');
  const jsonData = await fs.readFile(filePath, 'utf-8');
  const matchRows = JSON.parse(jsonData);

  console.log(`⏳ Insertando ${matchRows.length} partidos...`);

  // Opcional: limpiar la tabla antes
  await prisma.match_row.deleteMany();

  await prisma.match_row.createMany({
    data: matchRows.map((row: any) => ({
      id: row.id,
      league: row.league,
      home_team: row.home_team,
      away_team: row.away_team,
      score_home: row.score_home,
      score_away: row.score_away,
      minute: row.minute,
      source_url: row.source_url,
      last_hash: row.last_hash,
      match_date: row.match_date ? new Date(row.match_date) : undefined,
      first_seen: row.first_seen ? new Date(row.first_seen) : undefined,
      updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
    })),
    skipDuplicates: true,
  });

  console.log("✅ Partidos insertados correctamente.");
}

main()
  .catch((e) => {
    console.error('❌ Error al insertar partidos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
