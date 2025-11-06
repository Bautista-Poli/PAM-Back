import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function checkUserVotedController(userId: number, matchId: number) {
  const vote = await prisma.player_rating.findFirst({
    where: {
      user_id: userId,
      match_id: matchId,
    },
  });

  return { hasVoted: !!vote };
}