//parseMatchApiData.ts
import { PrismaClient } from '@prisma/client'
import { ApiMatchesResponse, Event } from './apiMatchesInterfaces';

interface leagueUrlAndName {url: string; name: string};

function checkApiResponseType(apiResponse: any) {
    return (apiResponse && Array.isArray(apiResponse.events) && Array.isArray(apiResponse.leagues))
}

export async function updateMatches(leagueData: leagueUrlAndName, prisma: PrismaClient) {

    const espnApiUrl = 'https://site.web.api.espn.com/apis/site/v2/sports/soccer/'+leagueData.url+'/scoreboard';
    
    // 1. Obtener datos de ESPN (Ayer, Hoy, Mañana)
    const [resToday, resYesterday, resTomorrow] = await Promise.all([
        fetch(espnApiUrl),
        fetch(`${espnApiUrl}?dates=${new Date(Date.now() - 86400000).toISOString().split('T')[0].replace(/-/g, '')}`),
        fetch(`${espnApiUrl}?dates=${new Date(Date.now() + 86400000).toISOString().split('T')[0].replace(/-/g, '')}`)
    ]);

    const dataToday = await resToday.json() as ApiMatchesResponse;
    const dataYesterday = await resYesterday.json() as ApiMatchesResponse;
    const dataTomorrow = await resTomorrow.json() as ApiMatchesResponse;

    if (!checkApiResponseType(dataToday) || !checkApiResponseType(dataYesterday) || !checkApiResponseType(dataTomorrow)) {
        throw new Error("Invalid Response, incorrect datatype for matches")
    }

    // 2. Combinar eventos y mapear
    const allEvents = [...(dataToday.events || []), ...(dataYesterday.events || []), ...(dataTomorrow.events || [])];
    const leagueName = leagueData.name ?? 'Liga Desconocida';
    
    const key = (league: string, name: string) =>
        `${(league ?? '').trim().toLowerCase()}|${(name ?? '').trim().toLowerCase()}`;

    const clubs = await prisma.club.findMany({
        select: { id: true, league_key: true, nombre: true },
    });

    const clubIdByKey = new Map<string, number>();
    for (const c of clubs) clubIdByKey.set(key(c.league_key, c.nombre), c.id);

    const matches = allEvents.map((event: Event) => {
        const homeTeamName = event.competitions[0].competitors[0].team.displayName;
        const awayTeamName = event.competitions[0].competitors[1].team.displayName;
        const homeId = clubIdByKey.get(key(leagueName, homeTeamName));
        const awayId = clubIdByKey.get(key(leagueName, awayTeamName));

        let match_date = new Date(event.date);
        if (leagueName === 'Liga Profesional Argentina') {
            match_date.setHours(match_date.getHours() - 3);
        }

        return {
            espn_id: event.id,
            league: leagueName,
            home_team: homeTeamName,
            away_team: awayTeamName,
            home_club_id: homeId,
            away_club_id: awayId,
            score_home: parseInt(event.competitions[0].competitors[0].score) || 0,
            score_away: parseInt(event.competitions[0].competitors[1].score) || 0,
            minute: null,
            match_date: match_date,
            updated_at: new Date()
        };
    });

    // 3. Filtrar duplicados en memoria antes de ir a DB
    const seenMatches = new Set<string>();
    const uniqueMatches = matches.filter(match => {
        const matchIdentifier = `${match.home_team}-${match.away_team}-${match.match_date.getTime()}`;
        if (seenMatches.has(matchIdentifier)) return false;
        seenMatches.add(matchIdentifier);
        return true;
    });

    console.log(`Procesando ${uniqueMatches.length} partidos únicos para ${leagueName}...`);

    // 4. UPSERT: Inserta si no existe, actualiza si ya existe.
    // Esto protege tus player_ratings históricos.
    for (const match of uniqueMatches) {
        await prisma.match_row.upsert({
            where: {
                // Nombre del constraint generado por Prisma basado en tu @@unique
                home_team_away_team_match_date: {
                    home_team: match.home_team,
                    away_team: match.away_team,
                    match_date: match.match_date,
                }
            },
            update: {
                score_home: match.score_home,
                score_away: match.score_away,
                updated_at: new Date()
            },
            create: match
        });
    }
}

