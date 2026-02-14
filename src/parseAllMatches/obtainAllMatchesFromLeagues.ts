import { PrismaClient } from '@prisma/client';
import { obtainAllMatches } from './obtainAllMatches';

async function main() {
    const leagueUrls = [
        { url: 'arg.1', name: 'Liga Profesional Argentina' },
        { url: 'eng.1', name: 'Premier League' },
        { url: 'esp.1', name: 'La Liga' }
    ];

    const prisma = new PrismaClient();

    try {
        // IMPORTANTE: Ya no borramos match_row para que el upsert 
        // pueda actualizar marcadores sin perder IDs previos.

        console.log("--- Iniciando Actualización de Ligas ---");
        for (const league of leagueUrls) {
            console.log(`\n> Trabajando con: ${league.name}`);
            
            // 1. Cargamos todos los partidos de la temporada
            await obtainAllMatches(league, prisma); 
        }

        console.log("\n--- Proceso finalizado con éxito ---");

    } catch (e) {
        console.error('Error durante la ejecución:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();