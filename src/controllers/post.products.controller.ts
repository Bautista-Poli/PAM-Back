import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export async function postProductController(req: Request, res: Response) {
  try {
    const { title, description, imageUrl, price } = req.body;

    if (!title || !description || !imageUrl || price === undefined) {
      return res
        .status(400)
        .json({ error: "Faltan campos obligatorios." });
    }

    const newProduct = await prisma.product.create({
      data: {
        title,
        description,
        imageUrl,
        price: Number(price),
      },
    });

    return res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error al crear el producto:", error);
    return res
      .status(500)
      .json({ error: "Hubo un error en el servidor." });
  }
}