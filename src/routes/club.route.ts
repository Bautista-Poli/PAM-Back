import { Router } from 'express';
import { getAllClubsController } from '../controllers/get.clubs.controller';

const router = Router();


router.get('/', async (req, res) => {
  try {
    const matches = await getAllClubsController();
    return res.status(200).json(matches);
  } catch (error) {
    console.error('Error al obtener todos los clubes:', error);
    return res.status(500).json({ error: 'Hubo un error al obtener los clubes.' });
  }
});

export default router;
