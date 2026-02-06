import { PrismaClient } from "@prisma/client";
import { SaveRatingsInput } from "./post.ratings.controller";

const prisma = new PrismaClient();

export async function updateRatingsController(data: SaveRatingsInput) {
  const validRatings = data.ratings.filter((r) => r.rating > 0);
  
  if (validRatings.length === 0) {
    throw new Error("Debes calificar al menos un jugador");
  }

  return await prisma.$transaction(async (tx) => {
    await tx.player_rating.deleteMany({
      where: {
        user_id: data.userId,
        match_id: data.matchId,
      },
    });

    // 2. Insertamos los nuevos ratings
    const created = await tx.player_rating.createMany({
      data: validRatings.map((r) => ({
        user_id: data.userId,
        match_id: data.matchId,
        player_id: r.playerId,
        rating: r.rating,
      })),
    });

    return { success: true, ratingsUpdated: created.count };
  });
}