//parseASpecificMatch.ts

import { PrismaClient } from '@prisma/client';
import { syncMatchCardsByEspnId } from './parseHelper';

// Definimos la estructura mínima que devuelve el Summary de ESPN
interface ESPSummaryResponse {
  header: {
    competitions: Array<{
      date: string;
      competitors: Array<{
        homeAway: 'home' | 'away';
        score: string;
        team: { displayName: string };
      }>;
    }>;
  };
  leagues: Array<{ name: string }>;
}

export async function forceLoadPastMatch(leagueUrl: string, eventId: string, prisma: PrismaClient) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueUrl}/summary?event=${eventId}`;
  
  console.log(`🔍 Buscando partido histórico: ${eventId}...`);

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
    
    // Casteamos la respuesta a nuestra interfaz
    const data = (await res.json()) as ESPSummaryResponse;

    // Validamos que la data básica exista antes de acceder
    if (!data.header || !data.header.competitions?.[0]) {
        throw new Error("La API de ESPN no devolvió información del encabezado del partido.");
    }

    const competition = data.header.competitions[0];
    const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
    const awayTeam = competition.competitors.find(c => c.homeAway === 'away');
    const leagueName = data.leagues?.[0]?.name || "Liga Desconocida";

    if (!homeTeam || !awayTeam) throw new Error("No se encontraron los equipos en la respuesta.");

    // Buscamos los IDs de los clubes en nuestra DB
    const clubs = await prisma.club.findMany({
      where: {
        nombre: { in: [homeTeam.team.displayName, awayTeam.team.displayName] }
      }
    });

    const homeClubId = clubs.find(c => c.nombre === homeTeam.team.displayName)?.id;
    const awayClubId = clubs.find(c => c.nombre === awayTeam.team.displayName)?.id;

    // 1. Guardar o actualizar el partido en match_row
    const savedMatch = await prisma.match_row.upsert({
      where: { espn_id: eventId },
      update: {
        score_home: parseInt(homeTeam.score) || 0,
        score_away: parseInt(awayTeam.score) || 0,
      },
      create: {
        espn_id: eventId,
        league: leagueName,
        home_team: homeTeam.team.displayName,
        away_team: awayTeam.team.displayName,
        home_club_id: homeClubId,
        away_club_id: awayClubId,
        score_home: parseInt(homeTeam.score) || 0,
        score_away: parseInt(awayTeam.score) || 0,
        match_date: new Date(competition.date),
        updated_at: new Date()
      }
    });

    console.log(`✅ Partido guardado: ${savedMatch.home_team} ${savedMatch.score_home} - ${savedMatch.score_away} ${savedMatch.away_team}`);

    // 2. Ahora que el partido existe en match_row, cargamos las tarjetas
    await syncMatchCardsByEspnId(eventId, leagueUrl, prisma);

  } catch (error) {
    console.error("❌ Error cargando el partido:", error);
  }
}

// Bloque de ejecución
(async () => {
    const prisma = new PrismaClient();
    const ESPN_ID = "762848"; 
    const LEAGUE_SLUG = "arg.1"; 

    await forceLoadPastMatch(LEAGUE_SLUG, ESPN_ID, prisma);
    await prisma.$disconnect();
    console.log("🏁 Proceso finalizado.");
})();