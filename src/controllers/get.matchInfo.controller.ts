import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getMatchEventsController(matchId: number) {
  // Buscamos todos los eventos (amarillas/rojas) asociados al ID interno
  const events = await prisma.match_event.findMany({
    where: {
      match_id: matchId,
    },
    orderBy: {
      minute: 'asc', // Para que el frontend reciba la cronología en orden
    },
    select: {
      id: true,
      type: true,
      minute: true,
      clock_display: true,
      player_name: true,
      team_name: true,
      description: true,
    },
  });

  return events;
}