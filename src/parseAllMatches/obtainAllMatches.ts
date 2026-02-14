import { PrismaClient } from '@prisma/client';
import { ApiMatchesResponse } from '../apiMatchesInterfaces';

interface leagueUrlAndName { url: string; name: string };

function checkApiResponseType(apiResponse: any) {
    return (apiResponse && Array.isArray(apiResponse.events));
}

export async function obtainAllMatches(leagueData: leagueUrlAndName, prisma: PrismaClient) {
    // Usamos el año actual. Para ligas europeas en agosto, podrías usar 20242025.
    // El limit=1000 asegura que traiga todos los partidos (aprox 380 por liga).
    const currentYear = new Date().getFullYear();
    const espnApiUrl = `https://site.web.api.espn.com/apis/site/v2/sports/soccer/${leagueData.url}/scoreboard?dates=${currentYear}&limit=1000`;
    
    const response = await fetch(espnApiUrl);
    const data = await response.json() as ApiMatchesResponse;

    if (!checkApiResponseType(data)) {
        console.error(`Error en API para ${leagueData.name}`);
        return;
    }

    const allEvents = data.events || [];
    const leagueName = leagueData.name;
    
    // Optimizamos búsqueda de clubs
    const clubs = await prisma.club.findMany({
        select: { id: true, league_key: true, nombre: true },
    });

    const key = (league: string, name: string) =>
        `${(league ?? '').trim().toLowerCase()}|${(name ?? '').trim().toLowerCase()}`;

    const clubIdByKey = new Map<string, number>();
    for (const c of clubs) clubIdByKey.set(key(c.league_key, c.nombre), c.id);

    console.log(`Procesando ${allEvents.length} partidos para ${leagueName}...`);

    for (const event of allEvents) {
        const competition = event.competitions[0];
        const homeTeamData = competition.competitors[0];
        const awayTeamData = competition.competitors[1];

        const homeTeamName = homeTeamData.team.displayName;
        const awayTeamName = awayTeamData.team.displayName;
        
        const homeId = clubIdByKey.get(key(leagueName, homeTeamName));
        const awayId = clubIdByKey.get(key(leagueName, awayTeamName));

        let match_date = new Date(event.date);
        if (leagueName === 'Liga Profesional Argentina') {
            match_date.setHours(match_date.getHours() - 3);
        }

        // UPSERT: Si existe (por equipos y fecha), actualiza. Si no, crea.
        await prisma.match_row.upsert({
            where: {
                home_team_away_team_match_date: {
                    home_team: homeTeamName,
                    away_team: awayTeamName,
                    match_date: match_date,
                }
            },
            update: {
                score_home: parseInt(homeTeamData.score) || 0,
                score_away: parseInt(awayTeamData.score) || 0,
                updated_at: new Date()
            },
            create: {
                espn_id: event.id,
                league: leagueName,
                home_team: homeTeamName,
                away_team: awayTeamName,
                home_club_id: homeId,
                away_club_id: awayId,
                score_home: parseInt(homeTeamData.score) || 0,
                score_away: parseInt(awayTeamData.score) || 0,
                minute: null,
                match_date: match_date,
                updated_at: new Date()
            }
        });
    }
}