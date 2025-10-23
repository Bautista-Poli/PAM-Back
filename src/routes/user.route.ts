import { Router } from 'express';
import { checkUserCredentialsController } from '../controllers/check.user.controller';
import { createUserController } from '../controllers/create.user.controller';

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


// POST /user/create
router.post("/create", async (req, res) => {
  const { nombre, mail, contrasena, clubId } = req.body ?? {};

  // Validaciones mínimas necesarias
  if (!nombre || !mail || !contrasena || typeof clubId !== "number") {
    return res.status(400).json({
      error: "Faltan parámetros: nombre, mail, contraseña y/o clubId",
    });
  }

  try {
    const user = await createUserController({ nombre, mail, contrasena, clubId });
    return res.status(201).json(user);
  } catch (err: any) {
    // Prisma unique constraint
    if (err?.code === "P2002") {
      // err.meta?.target puede traer ["mail"] o ["usuario"]
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(",") : "dato único";
      return res.status(409).json({ error: `Ya existe un usuario con ese ${target}` });
    }

    // Prisma foreign key constraint (club inexistente)
    if (err?.code === "P2003") {
      return res.status(400).json({ error: "clubId inválido (no existe el club)" });
    }

    console.error("Error /user/create:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
