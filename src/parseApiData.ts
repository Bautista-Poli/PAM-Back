import { match_row, PrismaClient } from '@prisma/client'
import { ApiResponse,Team, Competitor, Competition, Event, League } from './apiInterfaces';
const prisma = new PrismaClient();

function checkApiResponseType (apiResponse: any){
    return (apiResponse && Array.isArray(apiResponse.events) && Array.isArray(apiResponse.leagues))
}

async function main() {

    const espnApiUrl = 'https://site.web.api.espn.com/apis/site/v2/sports/soccer/arg.1/scoreboard';
    const response  = await fetch(espnApiUrl); 
    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    if(!checkApiResponseType(response.json())){
        throw new Error("Invalid Response, incorrect datatype")
    }

    const data = await response.json() as ApiResponse
  

    const leagueName = data.leagues?.[0]?.name ?? 'Liga Desconocida';
    
    const key = (league: string, name: string) =>
    `${(league ?? '').trim().toLowerCase()}|${(name ?? '').trim().toLowerCase()}`;

    const clubs = await prisma.club.findMany({
        select: { id: true, league_key: true, nombre: true },
    });

    const clubIdByKey = new Map<string, number>();
    for (const c of clubs) clubIdByKey.set(key(c.league_key, c.nombre), c.id);

    await prisma.match_row.deleteMany();


    const matches = data.events.map((event: any) =>{
        
        const homeTeamName = event.competitions[0].competitors[0].team.displayName;
        const awayTeamName = event.competitions[0].competitors[1].team.displayName;
        const homeId = clubIdByKey.get(key(leagueName, homeTeamName));
        const awayId = clubIdByKey.get(key(leagueName, awayTeamName));

        return{
            league: leagueName,
            home_team: homeTeamName,
            away_team: awayTeamName,
            home_club_id: homeId,
            away_club_id: awayId,
            score_home: event.competitions[0].competitors[0].score,
            score_away: event.competitions[0].competitors[1].score,
            minute: null,
            match_date: new Date(event.date.slice(0,9)),
            updated_at: new Date(event.date.slice(0,9))
        };
        

    })

    await prisma.match_row.createMany({ data:matches, skipDuplicates: true, });
}


main()