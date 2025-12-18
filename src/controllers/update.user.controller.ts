import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type UpdateUserInput = {
  nombre?: string;
  clubId?: number;
};

export async function updateUserController(
  userId: number,
  { nombre, clubId }: UpdateUserInput
) {
  const updateData: any = {};
  
  if (nombre) {
    updateData.usuario = nombre;
  }
  
  if (clubId) {
    updateData.club_id = clubId;
  }

  const updatedUser = await prisma.user_table.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      usuario: true,
      mail: true,
      club_id: true,
      club: {
        select: {
          id: true,
          nombre: true,
          crest_url: true,
        },
      },
    },
  });

  return updatedUser;
}