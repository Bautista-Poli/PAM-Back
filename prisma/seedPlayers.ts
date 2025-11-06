// prisma/seed_players_from_json.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

type PlayerById = { full_name: string; team_id: number };
type PlayerByName = { full_name: string; team_name: string };
type RawPlayer = Partial<PlayerById & PlayerByName>; // permite cualquiera de los dos



async function vieneConName(p: RawPlayer, toInsert: PlayerById[]): Promise<boolean> {
  const full_name = p?.full_name?.trim();
  const team_name = p?.team_name?.trim();
  if (!full_name || !team_name) return false;

  const club = await prisma.club.findFirst({ where: { nombre: team_name } });
  if (!club) {
    console.warn(`⚠️ Club no encontrado para team_name="${team_name}". Jugador omitido: ${full_name}`);
    return false;
  }
  toInsert.push({ full_name, team_id: club.id });
  return true;
}

function vieneConId(p: RawPlayer, toInsert: PlayerById[]): boolean {
  const full_name = p?.full_name?.trim();
  if (!full_name) return false;

  if (typeof p.team_id === 'number') {
    toInsert.push({ full_name, team_id: p.team_id });
    return true;
  }
  return false;
}


async function main() {
  //console.log('🧹 Borrando jugadores existentes...');
  //await prisma.player_table.deleteMany();

  const filePath = path.join(__dirname, '../data/player_table2.json');
  const raw = JSON.parse(await fs.readFile(filePath, 'utf-8')) as RawPlayer[];

  const toInsert: { full_name: string; team_id: number }[] = [];

  for (const p of raw) {
    if (!p?.full_name) continue;
    if (vieneConId(p, toInsert)) continue;
    if (await vieneConName(p, toInsert)) continue;
    console.warn(`⚠️ Entrada inválida (sin team_id ni team_name). Jugador omitido: ${p.full_name}`);
  }

  console.log(`📦 Insertando ${toInsert.length} jugadores...`);
  const res = await prisma.player_table.createMany({
    data: toInsert,
    skipDuplicates: true,
  });

  console.log(`✅ Insertados: ${res.count}`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
