// prisma/seedMatchRows.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

const key = (league: string, name: string) =>
  `${(league ?? '').trim().toLowerCase()}|${(name ?? '').trim().toLowerCase()}`;

async function main() {
  const filePath = path.join(__dirname, '../data/match_row.json');
  const jsonData = await fs.readFile(filePath, 'utf-8');
  const matchRows: any[] = JSON.parse(jsonData);

  // 1) Armamos un mapa (league_key, nombre) -> club.id
  const clubs = await prisma.club.findMany({
    select: { id: true, league_key: true, nombre: true },
  });

  const clubIdByKey = new Map<string, number>();
  for (const c of clubs) clubIdByKey.set(key(c.league_key, c.nombre), c.id);

  console.log(`🔎 Clubes cargados: ${clubs.length}`);

  // 2) Opcional: limpiar la tabla
  await prisma.match_row.deleteMany();

  // 3) Preparamos los datos resolviendo IDs
  const data = matchRows.map((row) => {
    const homeId = clubIdByKey.get(key(row.league, row.home_team));
    const awayId = clubIdByKey.get(key(row.league, row.away_team));

    return {
      league: row.league,
      home_team: row.home_team,
      away_team: row.away_team,

      // ← nuevas FKs (opcionales en esta etapa)
      home_club_id: homeId,
      away_club_id: awayId,

      score_home: row.score_home,
      score_away: row.score_away,
      minute: row.minute,
      match_date: row.match_date ? new Date(row.match_date) : undefined,
      updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
    };
  });

  console.log(`⏳ Insertando ${data.length} partidos...`);

  await prisma.match_row.createMany({
    data,
    skipDuplicates: true,
  });

  console.log('✅ Partidos insertados con IDs de club (cuando matchearon).');
}

main()
  .catch((e) => {
    console.error('❌ Error al insertar partidos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

