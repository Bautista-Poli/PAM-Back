import { PrismaClient } from "@prisma/client";
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const getClubsController = async (req: Request, res: Response) => {

  try {
    const clubs = await prisma.club.findMany({
      orderBy: {
        nombre: 'asc',
      },
      select: {
        id: true,
        nombre: true,
        crest_url: true,
      }
    });
    return res.status(200).json(clubs);
  } catch (error) {
    console.error('Error al obtener los clubes:', error);
    return res.status(500).json({ error: 'Hubo un error al obtener los clubes.' });
  }
};