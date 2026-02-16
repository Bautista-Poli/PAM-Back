import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getPlayerHistoryController(playerId: number) {
  const ratings = await prisma.player_rating.findMany({
    where: { 
      player_id: playerId,
      match: { isNot: null } 
    },
    include: {
      match: true,
      player: true
    }
  });


  const historyMap = new Map();

  ratings.forEach(r => {
    const matchId = r.match_id;
    const match = r.match!;
    
    if (!historyMap.has(matchId)) {
      const isHome = match.home_club_id === r.player?.team_id;
      historyMap.set(matchId, {
        date: match.match_date,
        opponent: isHome ? match.away_team : match.home_team,
        competition: match.league || "Liga",
        totalRating: 0,
        count: 0,
        goals: 0, 
        assists: 0,
        minutesPlayed: 90 
      });
    }

    const current = historyMap.get(matchId);
    current.totalRating += r.rating;
    current.count += 1;
  });

  return Array.from(historyMap.values())
    .map(item => ({
      ...item,
      rating: item.totalRating / item.count,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}