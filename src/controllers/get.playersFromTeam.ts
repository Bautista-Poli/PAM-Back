import { match_row, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getPlayersByClubController(club: string) {
  const clubData = await prisma.club.findFirst({
    where: { nombre: club }
  });

  if (!clubData) return [];

  return prisma.player_table.findMany({
    where: { team_id: clubData.id },
    orderBy: { full_name: 'asc' }
  });
}