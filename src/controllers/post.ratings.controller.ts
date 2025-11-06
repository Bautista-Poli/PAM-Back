import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type RatingInput = {
  playerId: number;
  rating: number;
};

export type SaveRatingsInput = {
  userId: number;
  matchId: number;
  ratings: RatingInput[];
};

export async function saveRatingsController(data: SaveRatingsInput) {
  // Verificar si el usuario ya votó en este partido
  const existingVotes = await prisma.player_rating.findFirst({
    where: {
      user_id: data.userId,
      match_id: data.matchId,
    },
  });
  if (existingVotes) {
    throw new Error("Ya has evaluado este partido anteriormente");
  }

  const validRatings = data.ratings.filter((r) => r.rating > 0);
  if (validRatings.length === 0) {
    throw new Error("Debes calificar al menos un jugador");
  }

  // Crear todos los ratings en una transacción
  const created = await prisma.player_rating.createMany({
    data: validRatings.map((r) => ({
      user_id: data.userId,
      match_id: data.matchId,
      player_id: r.playerId,
      rating: r.rating,
    })),
  });

  return { success: true, ratingsCreated: created.count };
}