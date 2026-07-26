import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getClub = async (req: Request, res: Response) => {
  const { nombre } = req.params;

  try {
    const club = await prisma.club.findFirst({
      where: {

        nombre: {
          equals: nombre as string,
          mode: 'insensitive',
        }
      },
      include: {
        clubInfo: true,
      },
    });

    if (!club) {
      return res.status(404).json({ error: `Club no encontrado: ${nombre}` });
    }

    const equipoInfo = {
      nombre: club.nombre,
      escudo: club.crest_url,
      titulosNacionales: club.clubInfo?.titulosNacionales ?? 'N/A',
      titulosInternacionales: club.clubInfo?.titulosInternac ?? 'N/A',
      nombreEstadio: club.clubInfo?.nombreEstadio ?? 'N/A',
      capacidadEstadio: club.clubInfo?.capacidadEstadio ?? 'N/A',
      ciudad: club.clubInfo?.ciudad ?? 'N/A',
      colores: club.clubInfo?.colores ?? 'N/A',
      añoFundacion: club.clubInfo?.añoFundacion ?? 'N/A',
      entrenador: club.clubInfo?.entrenador ?? 'N/A',
    };

    res.json(equipoInfo);

  } catch (error) {
    console.error('Error al obtener la información del club:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};