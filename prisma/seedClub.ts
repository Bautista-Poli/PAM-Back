import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

type RawLogo = {
  league_key?: string;
  name: string;
  crest_url: string;
  // el JSON trae más campos, pero no los usamos
};

async function main() {
  const filePath = path.join(__dirname, '../data/club_logo.json'); // asegurate que existe
  const raw = JSON.parse(await fs.readFile(filePath, 'utf-8')) as RawLogo[];

  const clubsToSeed = raw
    .filter(r => r.name && r.crest_url)
    .map(r => ({
      league_key: r.league_key ?? 'global',
      nombre: r.name,
      crest_url: r.crest_url,
    }));

  console.log(`📦 Intentando crear o actualizar ${clubsToSeed.length} clubes...`);


  for (const clubData of clubsToSeed) {
    const club = await prisma.club.upsert({
      where: {
        
        league_key_nombre: {
          league_key: clubData.league_key,
          nombre: clubData.nombre,
        },
      },
      // Si el club se encuentra, actualiza estos campos:
      update: {
        crest_url: clubData.crest_url,
      },
      // Si el club no se encuentra, créalo con esta data:
      create: {
        league_key: clubData.league_key,
        nombre: clubData.nombre,
        crest_url: clubData.crest_url,
      },
    });
    console.log(`  -> Procesado: ${club.nombre}`);
  }

  console.log(`✅ Proceso de seed finalizado.`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });