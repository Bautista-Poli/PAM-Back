import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUserMatchRatingsController(userId: number, match_id: number) {
  // Solo consultamos los datos, no borramos ni editamos nada aquí
  const ratings = await prisma.player_rating.findMany({
    where: {
      user_id: userId,
      match_id: match_id,
    },
    select: {
      player_id: true,
      rating: true,
    },
  });

  return ratings;
}