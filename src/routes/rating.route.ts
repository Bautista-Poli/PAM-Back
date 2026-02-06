import { Router } from "express";
import { saveRatingsController } from "../controllers/post.ratings.controller";
import { checkUserVotedController } from "../controllers/check.userVoted.controller";
import { getAverageRatingsByClubController } from "../controllers/get.averageRatings.controller";
import { getUserMatchRatingsController } from "../controllers/get.userMatchRatings.controller";
import { updateRatingsController } from "../controllers/uptade.ratings.contoller";

const router = Router();

// POST /ratings - Guardar ratings de un partido
router.post("/", async (req, res) => {
  try {
    const { userId, matchId, ratings } = req.body;

    if (!userId || !matchId || !ratings || !Array.isArray(ratings)) {
      return res.status(400).json({
        error: "Faltan datos requeridos: userId, matchId, ratings",
      });
    }

    const result = await saveRatingsController({ userId, matchId, ratings });
    return res.status(201).json(result);
  }
  catch (err: any) {
    console.error(err);
    if (err.message === "Ya has evaluado este partido anteriormente") {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /ratings/check?userId=1&matchId=5 - Verificar si el usuario ya votó
router.get("/check", async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    const matchId = parseInt(req.query.matchId as string);

    if (!userId || !matchId) {
      return res.status(400).json({
        error: "Faltan parámetros: userId y matchId",
      });
    }

    const result = await checkUserVotedController(userId, matchId);
    return res.json(result);
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /ratings/club/:clubName - Obtener ratings promedio de jugadores de un club
router.get("/club/:clubName", async (req, res) => {
  try {
    const { clubName } = req.params;

    if (!clubName) {
      return res.status(400).json({ error: "Falta el parámetro clubName" });
    }

    const ratings = await getAverageRatingsByClubController(clubName);
    return res.json(ratings);
  }
  catch (err: any) {
    console.error(err);
    if (err.message === "Club no encontrado") {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.put("/", async (req, res) => {
  try {
    const { userId, matchId, ratings } = req.body;

    if (!userId || !matchId || !ratings || !Array.isArray(ratings)) {
      return res.status(400).json({
        error: "Faltan datos requeridos: userId, matchId, ratings",
      });
    }

    const result = await updateRatingsController({ userId, matchId, ratings });
    return res.status(200).json(result);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Error al actualizar las evaluaciones" });
  }
});

// GET /ratings/user-match?userId=35&matchId=123
router.get("/user-match", async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    const matchId = parseInt(req.query.matchId as string);

    if (isNaN(userId) || isNaN(matchId)) {
      return res.status(400).json({ error: "userId y matchId deben ser números válidos" });
    }

    const ratings = await getUserMatchRatingsController(userId, matchId);
    
    // Devolvemos la lista de ratings encontrados para que el front los precargue
    return res.json(ratings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al obtener tus votos" });
  }
});

export default router;