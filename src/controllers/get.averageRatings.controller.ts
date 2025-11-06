import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAverageRatingsByClubController(clubName: string) {
  const club = await prisma.club.findFirst({
    where: { nombre: clubName },
  });

  if (!club) {
    throw new Error("Club no encontrado");
  }

  // Obtener todos los jugadores del club con sus ratings
  const players = await prisma.player_table.findMany({
    where: { team_id: club.id },
    include: {
      ratings: {
        select: {
          rating: true,
        },
      },
    },
    orderBy: { full_name: "asc" },
  });

  // Calcular el promedio de ratings para cada jugador
  const playersWithAverage = players.map((player) => {
    const ratings = player.ratings.map((r) => r.rating);
    const average =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;

    return {
      id: player.id,
      full_name: player.full_name,
      team_id: player.team_id,
      averageRating: Math.round(average * 10) / 10,
      totalVotes: ratings.length,
    };
  });

  return playersWithAverage;
}