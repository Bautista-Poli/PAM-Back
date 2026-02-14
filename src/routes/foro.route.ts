import { Router } from 'express';
import { createCommentController, getCommentsController } from '../controllers/get.foroMessages.controller';

const router = Router();

/** GET /foro/:matchId */
router.get('/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    if (!matchId) {
      return res.status(400).json({ error: 'Falta el parámetro "matchId".' });
    }
    
    const comments = await getCommentsController(Number(matchId));
    return res.status(200).json(comments);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    return res.status(500).json({ error: 'Hubo un error al obtener los comentarios.' });
  }
});

/** POST /foro */
router.post('/', async (req, res) => {
  try {
    const { matchId, userId, text } = req.body;
    
    // Validación de parámetros obligatorios según tu estilo
    if (!matchId || !userId || !text) {
      return res.status(400).json({ error: 'Faltan datos obligatorios (matchId, userId o text).' });
    }

    const newComment = await createCommentController(Number(matchId), Number(userId), text);
    return res.status(201).json(newComment);
  } catch (error) {
    console.error('Error al crear comentario:', error);
    return res.status(500).json({ error: 'Hubo un error al publicar el comentario.' });
  }
});

export default router;