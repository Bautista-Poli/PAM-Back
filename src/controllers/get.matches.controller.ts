import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllMatchesController() {
  return prisma.match_row.findMany({
    orderBy: [{ updated_at: "desc" }, { match_date: "desc" }],
    take: 200,
  });
}