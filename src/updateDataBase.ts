import { PrismaClient } from '@prisma/client'
import  {updateMatches} from "./parseApiData";


function main(){
    const leagueUrls = [
        {url:'arg.1/scoreboard',name:'Liga Profesional Argentina'},
        {url:'eng.1/scoreboard',name:'Premier League'},
        {url:'esp.1/scoreboard',name:'La Liga'}
    ]

    for (let i=0; i<leagueUrls.length; i++){
        const prisma = new PrismaClient();
        updateMatches(leagueUrls[i],prisma)
            .catch((e) => {
                console.error('Error en el seed:', e);
                process.exit(1);
            })
            .finally(async () => {
                await prisma.$disconnect();
            });

    }

}

main();