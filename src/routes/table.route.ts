import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/league-table", async (req, res) => {
  try {
    const league_preset = (req.query.league_preset as string) ?? undefined;
    const table_index = req.query.table_index
      ? Number(req.query.table_index)
      : undefined;

    const rows = await prisma.league_table_row.findMany({
      where: {
        ...(league_preset ? { league_preset } : {}),
        ...(table_index ? { table_index } : {}),
      },
      orderBy: [
        { pos: "asc" },          // filas con pos primero
        { team: "asc" },         // luego por team
      ],
    });

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener league_table_row:", error);
    return res.status(500).json({ error: "Hubo un error en el servidor." });
  }
});

export default router;