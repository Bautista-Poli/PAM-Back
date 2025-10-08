import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { getMatchesController } from "../controllers/get.matches.controller";

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (_req, res) => {
    try {
        const matches = await getMatchesController(); // <- sin req.query
        return res.status(200).json(matches);
    } catch (error) {
        console.error("Error al obtener match_row:", error);
        return res.status(500).json({ error: "Hubo un error al obtener los partidos." });
    }
});

export default router;