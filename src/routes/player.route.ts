import { Router } from 'express';
import { getPlayersByClubController } from '../controllers/get.playersFromTeam';

const router = Router();


router.get('/', async (req, res) => {
  const club = req.query.club as string;
  if (!club) {
    return res.status(400).json({ error: 'Falta el parámetro club' });
  }

  try {
    const players = await getPlayersByClubController(club);
    return res.json(players);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;