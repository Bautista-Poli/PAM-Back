import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/** Convierte "YYYY-MM-DD" al rango UTC [inicio, fin) del día */
function dayToUtcRange(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  const end   = new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0, 0));
  return { start, end };
}

/** GET /matches/by-date?date=YYYY-MM-DD  (opcional: &league=...) */
export async function getMatchesByDateController(params: { date: string; league?: string }) {
  const { start, end } = dayToUtcRange(params.date);
  const where: any = { match_date: { gte: start, lt: end } };
  if (params.league) where.league = params.league;

  return prisma.match_row.findMany({
    where,
    orderBy: [{ match_date: 'asc' }, { updated_at: 'desc' }],
    take: 500,
  });
}