import { PrismaClient } from '@prisma/client'
import { ApiResponse } from './apiInterfaces';

interface leagueUrlAndName {url: string; name: string};

function checkApiResponseType(apiResponse: any) {
    return (apiResponse && Array.isArray(apiResponse.events) && Array.isArray(apiResponse.leagues))
}

export async function updateMatches(leagueData: leagueUrlAndName, prisma: PrismaClient) {

    const espnApiUrl = 'https://site.web.api.espn.com/apis/site/v2/sports/soccer/'+leagueData.url;
    
    // Obtener partidos de hoy
    const responseToday = await fetch(espnApiUrl);
    if (!responseToday.ok) {
        throw new Error(`Failed to fetch data: ${responseToday.statusText}`);
    }
    const dataToday = await responseToday.json() as ApiResponse;

    // Obtener partidos de ayer
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = yesterday.toISOString().split('T')[0].replace(/-/g, '');
    const espnApiUrlYesterday = espnApiUrl+`?dates=${yesterdayFormatted}`;
    
    const responseYesterday = await fetch(espnApiUrlYesterday);
    if (!responseYesterday.ok) {
        throw new Error(`Failed to fetch yesterday data: ${responseYesterday.statusText}`);
    }
    const dataYesterday = await responseYesterday.json() as ApiResponse;

    // Obtener partidos de mañana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0].replace(/-/g, '');
    const espnApiUrlTomorrow = espnApiUrl+`?dates=${tomorrowFormatted}`;
    
    const responseTomorrow = await fetch(espnApiUrlTomorrow);
    if (!responseTomorrow.ok) {
        throw new Error(`Failed to fetch yesterday data: ${responseTomorrow.statusText}`);
    }
    const dataTomorrow = await responseTomorrow.json() as ApiResponse;

    if (!checkApiResponseType(dataToday) || !checkApiResponseType(dataYesterday) || !checkApiResponseType(dataTomorrow)) {
        throw new Error("Invalid Response, incorrect datatype")
    }

    // Combinar eventos de hoy, ayer y mañana
    const allEvents = [...(dataToday.events || []), ...(dataYesterday.events || []), ...(dataTomorrow.events || [])];

    let leagueName = leagueData.name ?? 'Liga Desconocida';
    
    const key = (league: string, name: string) =>
        `${(league ?? '').trim().toLowerCase()}|${(name ?? '').trim().toLowerCase()}`;

    const clubs = await prisma.club.findMany({
        select: { id: true, league_key: true, nombre: true },
    });

    const clubIdByKey = new Map<string, number>();
    for (const c of clubs) clubIdByKey.set(key(c.league_key, c.nombre), c.id);



    const matches = allEvents.map((event: any) => {
        const homeTeamName = event.competitions[0].competitors[0].team.displayName;
        const awayTeamName = event.competitions[0].competitors[1].team.displayName;
        const homeId = clubIdByKey.get(key(leagueName, homeTeamName));
        const awayId = clubIdByKey.get(key(leagueName, awayTeamName));

        let match_date = new Date(event.date)
        if (leagueName === 'Liga Profesional Argentina') {
            match_date.setHours(match_date.getHours() - 3);
        }

        return {
            league: leagueName,
            home_team: homeTeamName,
            away_team: awayTeamName,
            home_club_id: homeId,
            away_club_id: awayId,
            score_home: parseInt(event.competitions[0].competitors[0].score),
            score_away: parseInt(event.competitions[0].competitors[1].score),
            minute: null,
            match_date: match_date,
            updated_at: new Date()
        };
    });

    console.log(matches);
    await prisma.match_row.createMany({ data: matches, skipDuplicates: true });
}

