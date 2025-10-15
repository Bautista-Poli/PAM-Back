import { Router } from 'express';
import { checkUserCredentialsController } from '../controllers/check.user.controller';

const router = Router();

router.post('/', async (req, res) => {
  const { mail, contrasena } = req.body;

  if (!mail || !contrasena) {
    return res.status(400).json({ error: 'Faltan parámetros: mail y/o contraseña' });
  }

  try {
    const user = await checkUserCredentialsController(mail, contrasena);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
