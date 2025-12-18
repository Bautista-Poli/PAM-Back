import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type CreateUserInput = {
  nombre: string;
  mail: string;
  contrasena: string;
  clubId: number;
};

export async function createUserController({
  nombre,
  mail,
  contrasena,
  clubId,
}: CreateUserInput) {
  const user = await prisma.user_table.create({
    data: {
      usuario: nombre,
      mail,
      contrasena,
      club_id: clubId,
    },
    select: {
      id: true,
      usuario: true,
      mail: true,
      club_id: true,
      club: {
        select: { id: true, nombre: true, crest_url: true },
      },
    },
  });
  return user;
}
