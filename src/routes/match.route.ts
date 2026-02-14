import { Router } from "express";
import { getAllMatchesController } from "../controllers/get.matches.controller";
import { getMatchesByDateController } from "../controllers/get.specificMatch.controller";
import { getMatchEventsController } from "../controllers/get.matchInfo.controller";
import { getMatchesByTeamController } from "../controllers/get.teamMatches.controller";
import { getTournamentMatchesController } from "../controllers/get.tournamentMatches.controller";

const router = Router();

router.get('/', async (req, res) => {
  try {
    const matches = await getAllMatchesController();
    return res.status(200).json(matches);
  } catch (error) {
    console.error('Error al obtener partidos:', error);
    return res.status(500).json({ error: 'Hubo un error al obtener los partidos.' });
  }
});

/** GET /matches/by-date?date=YYYY-MM-DD&league=... */
router.get('/by-date', async (req, res) => {
  try {
    const { date, league } = req.query as { date?: string; league?: string };
    if (!date) {           // solo control de presencia del parámetro
      return res.status(400).json({ error: 'Falta el parámetro "date" (YYYY-MM-DD).' });
    }
    const matches = await getMatchesByDateController({ date, league });
    return res.status(200).json(matches);
  } catch (error) {
    console.error('Error al obtener partidos por fecha:', error);
    return res.status(500).json({ error: 'Hubo un error al obtener los partidos.' });
  }
});


router.get('/:id/events', async (req, res) => {
  const { id } = req.params;

  try {
    const events = await getMatchEventsController(Number(id));
    return res.status(200).json(events);
  } catch (error) {
    console.error('ERROR REAL EN EL BACKEND:', error); // ESTO TE DIRÁ EL PROBLEMA
    return res.status(500).json({ error: String(error) });
  }
});

router.get('/team/:name', async (req, res) => {
  const { name } = req.params;

  try {
    if (!name) {
      return res.status(400).json({ error: 'El nombre del equipo es obligatorio.' });
    }

    const matches = await getMatchesByTeamController(name);
    
    if (matches.length === 0) {
      return res.status(404).json({ message: 'No se encontraron partidos para ese equipo.' });
    }

    return res.status(200).json(matches);
  } catch (error) {
    console.error('Error al obtener partidos del equipo:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

router.get('/by-league/:leagueName', async (req, res) => {
  const { leagueName } = req.params;

  try {
    if (!leagueName) {
      return res.status(400).json({ error: 'El nombre de la liga es obligatorio.' });
    }

    const matches = await getTournamentMatchesController(leagueName);

    if (matches.length === 0) {
      return res.status(404).json({ message: 'No se encontraron partidos para ese torneo.' });
    }

    return res.status(200).json(matches);
  } catch (error) {
    console.error('Error al obtener partidos del torneo:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

export default router;