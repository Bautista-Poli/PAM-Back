import {PrismaClient} from '@prisma/client'
import {updateMatches} from "./parseMatchApiData";
import {updateTable}  from "./parseTableApiData";

function main(){
    const leagueUrls = [
        {url:'arg.1',name:'Liga Profesional Argentina'},
        {url:'eng.1',name:'Premier League'},
        {url:'esp.1',name:'La Liga'}
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
    for (let i=0; i<leagueUrls.length; i++){
    const prisma = new PrismaClient();
    updateTable(leagueUrls,prisma)
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