import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getMatchesByTeamController(teamName: string) {
  const matches = await prisma.match_row.findMany({
    where: {
      OR: [
        { home_team: { contains: teamName } },
        { away_team: { contains: teamName } }
      ]
    },
    orderBy: {
      match_date: 'desc',
    },
    select: {
      id: true,
      espn_id: true,
      league: true,
      home_team: true,
      away_team: true,
      score_home: true,
      score_away: true,
      match_date: true,
    },
  });

  return matches;
}