import { PrismaClient } from '@prisma/client';
import {ApiStandingsResponse, StandingsEntry} from './apiStandingsInterfaces';

interface leagueUrlAndName {url: string; name: string};


function checkApiResponseType(ApiTablesResponse: any) {
    if (!ApiTablesResponse || !Array.isArray(ApiTablesResponse.children)){
        throw new Error("Invalid Response, incorrect datatype for standings")
    }
}


export async function updateTable(leagueData: Array<leagueUrlAndName>, prisma: PrismaClient) {

    await prisma.league_table_row.deleteMany({});
    for(let i = 0; i < leagueData.length;i++){
        const espnApiUrl = 'https://site.api.espn.com/apis/v2/sports/soccer/'+leagueData[i].url+'/standings?season=2025';

        const apiResponse = await fetch(espnApiUrl);
        if(!apiResponse.ok){
            throw new Error(`Failed to fetch data from standings: ${apiResponse.statusText}`);
        }
        const apiData = await apiResponse.json() as ApiStandingsResponse;

        checkApiResponseType(apiData)
        //console.log(apiData.children[0].standings.entries[0].stats[0]);
        

        for(let j=0 ;j < apiData.children.length;j++){
            const tableEntries = apiData.children[j].standings.entries.map((entry: StandingsEntry ) => {

                return {
                    league_preset: leagueData[i].name,
                    table_index: j+1,
                    table_title: ('tabla '+(j+1)),

                    team: entry.team.displayName,
                    pts: parseInt(entry.stats[3].displayValue),
                    played: parseInt(entry.stats[0].displayValue),
                    wins: parseInt(entry.stats[7].displayValue),
                    draws: parseInt(entry.stats[6].displayValue),
                    losses:  parseInt(entry.stats[1].displayValue),
                    gf: parseInt(entry.stats[5].displayValue),
                    ga: parseInt(entry.stats[4].displayValue),
                    updated_at: new Date(),            
                }
            })
            await prisma.league_table_row.createMany({ data: tableEntries, skipDuplicates: true });
        }
    }

    
    
}


