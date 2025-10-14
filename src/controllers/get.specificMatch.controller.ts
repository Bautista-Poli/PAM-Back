import { match_row, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/** Convierte "YYYY-MM-DD" al rango UTC [inicio, fin) del día */
function dayToUtcRange(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  const end   = new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0, 0));
  return { start, end };
}

async function fetchMatchesByDate(date: string, league?: string) {
  const { start, end } = dayToUtcRange(date);
  const where: any = { match_date: { gte: start, lt: end } };
  if (league) where.league = league;

  return prisma.match_row.findMany({
    where,
    orderBy: [{ match_date: 'asc' }, { updated_at: 'desc' }],
    take: 500,
  });
}

function collectTeamNames(matches: match_row[]) {
  const set = new Set<string>();
  for (const m of matches) {
    if (m.home_team) set.add(m.home_team);
    if (m.away_team) set.add(m.away_team);
  }
  return Array.from(set);
}

async function fetchLogoMap(teamNames: string[]): Promise<Map<string, string>> {
  const logos = await prisma.club.findMany({
    where: { nombre: { in: teamNames } },   // 👈 antes era name
    select: { nombre: true, crest_url: true },
  });

  return new Map<string, string>(
    logos.map((l: { nombre: string; crest_url: string }) => [l.nombre, l.crest_url])
  );
}


/** 4) Agrega los escudos a cada partido */
function attachCrests(matches: match_row[], logoMap: Map<string, string>) {
  const resolveCrest = (teamName?: string) => teamName ? logoMap.get(teamName) ?? null : null;

  return matches.map(m => ({
    ...m,
    home_crest: resolveCrest(m.home_team),
    away_crest: resolveCrest(m.away_team),
  }));
}

/** GET /matches/by-date?date=YYYY-MM-DD  (opcional: &league=...) */
export async function getMatchesByDateController(params: { date: string; league?: string }) {
  const matches = await fetchMatchesByDate(params.date, params.league);
  if (matches.length === 0) return [];

  const teamNames = collectTeamNames(matches);
  const logoMap = await fetchLogoMap(teamNames);

  return attachCrests(matches, logoMap);
}