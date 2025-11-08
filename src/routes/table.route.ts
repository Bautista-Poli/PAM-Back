import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { getEntriesByName } from "../controllers/get.league_table_rows.controller"

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res) => {
  try {
    const leagueName = req.query.leagueName as string;
    const rows = await getEntriesByName(leagueName);
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener league_table_row:", error);
    return res.status(500).json({ error: "Hubo un error en el servidor." });
  }
});

export default router;