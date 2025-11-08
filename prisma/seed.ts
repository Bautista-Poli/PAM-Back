
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
/*
const prisma = new PrismaClient().$extends(withAccelerate());

async function main() {
  await prisma.user_table.create({
    data: {
      usuario: 'usuarioPrueba',
      mail: 'prueba@prueba.com',
      contrasena: '1234',
      club_id: 22
    }
  });

  console.log('🟢 Usuario de prueba creado correctamente');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

*/