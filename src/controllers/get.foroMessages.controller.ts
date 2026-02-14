import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getCommentsController(matchId: number) {
  return await prisma.match_comment.findMany({
    where: { match_id: matchId },
    include: {
      user: {
        select: { 
          usuario: true, 
          club: { select: { crest_url: true } } 
        }
      }
    },
    orderBy: { created_at: 'asc' }
  });
}

export async function createCommentController(matchId: number, userId: number, text: string) {
  // La validación de contenido vacío ya está en el modelo/frontend, 
  // pero aquí ejecutamos la creación pura
  return await prisma.match_comment.create({
    data: {
      match_id: matchId,
      user_id: userId,
      text: text.trim()
    }
  });
}