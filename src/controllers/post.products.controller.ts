import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export type NewProductInput = {
  title: string;
  description: string; 
  imageUrl: string;
  price: number;
};

export async function postProductController(product: NewProductInput) {

    const created = await prisma.product.create({
    data: {
      title: product.title,
      description: product.description,
      imageUrl: product.imageUrl,
      price: product.price, 
    },
  });
  return created;

   
}