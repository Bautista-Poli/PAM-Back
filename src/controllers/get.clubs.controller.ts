import { PrismaClient } from "@prisma/client";
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const getClubsController = async (req: Request, res: Response) => {

  const { league_key } = req.query;

  try {

    const whereClause: { league_key?: string } = {};
    if (typeof league_key === 'string' && league_key) {
      whereClause.league_key = league_key;
    }

    const clubs = await prisma.club.findMany({
      where: whereClause,
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