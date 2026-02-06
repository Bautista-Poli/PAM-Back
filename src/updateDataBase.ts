import { PrismaClient } from '@prisma/client';
import { updateMatches } from "./parseMatchApiData";
import { updateTable } from "./parseTableApiData";

async function main() {
    const leagueUrls = [
        { url: 'arg.1', name: 'Liga Profesional Argentina' },
        { url: 'eng.1', name: 'Premier League' },
        { url: 'esp.1', name: 'La Liga' }
    ];

    const prisma = new PrismaClient();

    try {
        // 1. Borramos solo los partidos (match_row)
        console.log("--- Limpiando tabla match_row ---");
        await prisma.match_row.deleteMany({});

        // 2. Cargamos los partidos nuevos (Secuencial)
        console.log("--- Actualizando Partidos ---");
        for (const league of leagueUrls) {
            console.log(`Actualizando partidos de: ${league.name}`);
            await updateMatches(league, prisma); 
        }

        // 3. Actualizamos las tablas (Sin borrar nada previo)
        console.log("--- Actualizando Tablas ---");
        for (const league of leagueUrls) {
            console.log(`Actualizando tabla de: ${league.name}`);
            // Usamos await aquí también para que sea ordenado
            await updateTable(leagueUrls, prisma); 
        }

    } catch (e) {
        console.error('Error durante la ejecución:', e);
        process.exit(1);
    } finally {
        // Cerramos la conexión una sola vez al final de todo
        await prisma.$disconnect();
    }
}

main();