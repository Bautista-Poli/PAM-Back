import { PrismaClient } from '@prisma/client'
import { ApiMatchesResponse, Event } from '../apiMatchesInterfaces';

interface leagueUrlAndName { url: string; name: string }

// Función para determinar la ronda basándose en la fecha
function getRoundFromDate(matchDate: Date, notes: string | null): string {
    const dateStr = matchDate.toISOString().split('T')[0];
    
    // League Phase
    if (dateStr >= '2024-09-17' && dateStr <= '2025-01-29') {
        return 'League Phase';
    }
    // Knockout Round Playoffs
    if (dateStr >= '2025-02-11' && dateStr <= '2025-02-19') {
        return notes?.includes('2nd Leg') ? 'Knockout Playoffs - 2nd Leg' : 'Knockout Playoffs - 1st Leg';
    }
    // Round of 16
    if (dateStr >= '2025-03-04' && dateStr <= '2025-03-19') {
        return notes?.includes('2nd Leg') ? 'Round of 16 - 2nd Leg' : 'Round of 16 - 1st Leg';
    }
    // Quarterfinals
    if (dateStr >= '2025-04-08' && dateStr <= '2025-04-16') {
        return notes?.includes('2nd Leg') ? 'Quarterfinals - 2nd Leg' : 'Quarterfinals - 1st Leg';
    }
    // Semifinals
    if (dateStr >= '2025-04-29' && dateStr <= '2025-05-07') {
        return notes?.includes('2nd Leg') ? 'Semifinals - 2nd Leg' : 'Semifinals - 1st Leg';
    }
    // Final
    if (dateStr >= '2025-05-31') {
        return 'Final';
    }
    
    return 'Unknown';
}

export async function updateCupMatches(leagueData: leagueUrlAndName, prisma: PrismaClient, season: string = "2024/2025") {
    const phases = [
        // Aumentamos el rango de la Fase de Liga un día por seguridad
        { start: '20240917', end: '20250130', name: 'League Phase' },
        { start: '20250211', end: '20250219', name: 'Knockout Round Playoffs' },
        { start: '20250304', end: '20250319', name: 'Round of 16' },
        { start: '20250408', end: '20250416', name: 'Quarterfinals' },
        { start: '20250429', end: '20250507', name: 'Semifinals' },
        { start: '20250530', end: '20250602', name: 'Final' } // Rango más amplio para la final
    ];
    
    console.log(`📡 Fetching ${leagueData.name} ${season}...\n`);
    let allEvents: Event[] = [];
    
    for (const phase of phases) {
        // AGREGADO: &limit=500 para evitar que la API trunque los resultados
        const espnApiUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueData.url}/scoreboard?dates=${phase.start}-${phase.end}&limit=500`;
        
        console.log(`🔄 Fetching ${phase.name}...`);
        try {
            const response = await fetch(espnApiUrl);
            if (!response.ok) continue;
            
            const data = await response.json() as ApiMatchesResponse;
            const events = data.events || [];
            
            // Si el log dice 100, es que todavía te está limitando (aunque con 500 basta)
            console.log(`   ✓ Found ${events.length} matches\n`);
            allEvents.push(...events);
        } catch (error) {
            console.log(`   ❌ Error fetching ${phase.name}:`, error);
        }
    }
    
    console.log(`✅ Total matches found: ${allEvents.length}\n`);
    
    if (allEvents.length === 0) {
        console.log('⚠️  No events found. Check the date ranges or API endpoint.');
        return;
    }
    
    const leagueName = leagueData.name;
    const clubs = await prisma.club.findMany({ select: { id: true, nombre: true } });
    const clubIdByName = new Map<string, number>();
    for (const c of clubs) clubIdByName.set(c.nombre.toLowerCase(), c.id);
    
    let inserted = 0;
    let updated = 0;
    
    // Agrupar partidos por ronda para mejor visualización
    const matchesByRound = new Map<string, number>();
    
    for (const event of allEvents) {
        const competition = event.competitions[0];
        const homeComp = competition.competitors.find(c => c.homeAway === "home");
        const awayComp = competition.competitors.find(c => c.homeAway === "away");
        
        if (!homeComp || !awayComp) {
            console.log(`⚠️  Skipping event ${event.id}: missing home/away data`);
            continue;
        }
        
        const homeTeamName = homeComp.team.displayName;
        const awayTeamName = awayComp.team.displayName;
        
        const match_date = new Date(event.date);
        const notesHeadline = competition.notes?.[0]?.headline || null;
        
        // Usar la función para determinar la ronda correcta
        const roundName = getRoundFromDate(match_date, notesHeadline);
        const groupName = competition.group?.name || null;
        
        // Detectar si es ida o vuelta
        const leg = notesHeadline?.toLowerCase().includes('2nd leg') ? 2 : 1;
        
        const matchData = {
            espn_id: event.id,
            league: leagueName,
            home_team: homeTeamName,
            away_team: awayTeamName,
            home_club_id: clubIdByName.get(homeTeamName.toLowerCase()) || null,
            away_club_id: clubIdByName.get(awayTeamName.toLowerCase()) || null,
            score_home: parseInt(homeComp.score) || 0,
            score_away: parseInt(awayComp.score) || 0,
            round: roundName,
            group_name: groupName,
            leg: leg,
            match_date: match_date,
            updated_at: new Date()
        };
        
        const existing = await prisma.match_row.findUnique({
            where: { espn_id: event.id }
        });
        
        await prisma.match_row.upsert({
            where: { espn_id: event.id },
            update: {
                score_home: matchData.score_home,
                score_away: matchData.score_away,
                round: matchData.round,
                group_name: matchData.group_name,
                leg: matchData.leg,
                updated_at: new Date()
            },
            create: matchData
        });
        
        if (existing) {
            updated++;
        } else {
            inserted++;
        }
        
        // Contar por ronda
        matchesByRound.set(roundName, (matchesByRound.get(roundName) || 0) + 1);
        
        console.log(`✓ ${homeTeamName} vs ${awayTeamName} - ${roundName}`);
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total matches processed: ${allEvents.length}`);
    console.log(`   New matches inserted: ${inserted}`);
    console.log(`   Matches updated: ${updated}`);
    
    console.log(`\n📋 Matches by round:`);
    for (const [round, count] of matchesByRound) {
        console.log(`   ${round}: ${count} matches`);
    }
    
    console.log(`\n✅ ${leagueName} ${season} actualizado exitosamente!`);
}

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Iniciando actualización de Champions League...\n');
    
    try {
        await updateCupMatches(
            { url: 'uefa.champions', name: 'Champions League' },
            prisma,
            '2024/2025'
        );
        console.log('\n✅ Proceso completado exitosamente');
    } catch (error) {
        console.error('\n❌ Error durante la actualización:', error);
        throw error;
    }
}

main()
    .catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    })
    .finally(async () => {
        console.log('🔌 Desconectando Prisma...');
        await prisma.$disconnect();
    });