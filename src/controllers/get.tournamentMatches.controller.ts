import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getTournamentMatchesController(leagueName: string) {
  return prisma.match_row.findMany({
    where: {
      league: {
        equals: leagueName,
        mode: 'insensitive',
      },
    },
    orderBy: [
      { match_date: 'asc' },
    ],
  });
}