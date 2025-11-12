import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function checkUserCredentialsController(mail: string, contrasena: string) {
  const user = await prisma.user_table.findFirst({
    where: {
      mail,
      contrasena
    },
    select: {
      id: true,
      usuario: true,
      mail: true,
      club_id: true,
      club: {
        select: {
          nombre: true,
          crest_url: true
        }
      }
    }
  });

  return user;
}
