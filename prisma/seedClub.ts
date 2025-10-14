// prisma/seedMatchRows.ts
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

  const data = raw
    .filter(r => r.name && r.crest_url)
    .map(r => ({
      league_key: r.league_key ?? 'global',
      nombre: r.name,          
      crest_url: r.crest_url,
    }));

  console.log(`📦 Intentando insertar ${data.length} clubes...`);

  // 2) Insertar usando el nuevo modelo `club`
  const res = await prisma.club.createMany({
    data,
    skipDuplicates: true, // evita duplicados por unique([league_key, nombre])
  });

  console.log(`✅ Insertados: ${res.count}`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
