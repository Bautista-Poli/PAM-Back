import { PrismaClient } from '@prisma/client'
import  {updateMatches} from "./parseApiData";


function main(){
    const leagueUrls = ['arg.1/scoreboard','eng.1/scoreboard','esp.1/scoreboard']

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