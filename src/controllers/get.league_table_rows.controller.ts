import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getEntriesByName(leagueName:string) {
    const rows = await prisma.league_table_row.findMany({
        where: {league_preset: leagueName}
    });

    const rowsSinBigInt = rows.map(row => ({
        ...row,
        id: row.id.toString(),
    }));
    return rowsSinBigInt
}