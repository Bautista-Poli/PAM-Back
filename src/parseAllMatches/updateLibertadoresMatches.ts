import { PrismaClient } from '@prisma/client'
import { ApiMatchesResponse, Event } from '../apiMatchesInterfaces';

interface leagueUrlAndName { url: string; name: string }

// 1. Ajuste de Rondas según el calendario CONMEBOL 2025
function getRoundFromLibertadoresDate(matchDate: Date, notes: string | null): string {
    const dateStr = matchDate.toISOString().split('T')[0];
    
    // Fases Previas (Fase 1, 2 y 3)
    if (dateStr >= '2025-02-04' && dateStr <= '2025-03-13') {
        return notes?.includes('2nd Leg') ? 'Fase Preliminar - Vuelta' : 'Fase Preliminar - Ida';
    }
    // Fase de Grupos
    if (dateStr >= '2025-04-01' && dateStr <= '2025-05-29') {
        return 'Fase de Grupos';
    }
    // Octavos de Final
    if (dateStr >= '2025-08-12' && dateStr <= '2025-08-21') {
        return notes?.includes('2nd Leg') ? 'Octavos de Final - Vuelta' : 'Octavos de Final - Ida';
    }
    // Cuartos de Final
    if (dateStr >= '2025-09-16' && dateStr <= '2025-09-25') {
        return notes?.includes('2nd Leg') ? 'Cuartos de Final - Vuelta' : 'Cuartos de Final - Ida';
    }
    // Semifinales
    if (dateStr >= '2025-10-21' && dateStr <= '2025-10-30') {
        return notes?.includes('2nd Leg') ? 'Semifinales - Vuelta' : 'Semifinales - Ida';
    }
    // Final Única
    if (dateStr >= '2025-11-28' && dateStr <= '2025-11-30') {
        return 'Final';
    }
    
    return 'Unknown';
}

export async function updateLibertadoresMatches(leagueData: leagueUrlAndName, prisma: PrismaClient, season: string = "2025") {
    // Definición de fases para las peticiones a la API
    const phases = [
        { start: '20250204', end: '20250315', name: 'Fases Preliminares' },
        { start: '20250401', end: '20250530', name: 'Fase de Grupos' },
        { start: '20250812', end: '20250822', name: 'Octavos de Final' },
        { start: '20250916', end: '20250926', name: 'Cuartos de Final' },
        { start: '20251021', end: '20251031', name: 'Semifinales' },
        { start: '20251128', end: '20251130', name: 'Final' }
    ];
    
    console.log(`📡 Fetching ${leagueData.name} ${season}...\n`);
    let allEvents: Event[] = [];
    
    for (const phase of phases) {
        // Mantenemos el limit=500 para capturar todos los partidos de grupos
        const espnApiUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueData.url}/scoreboard?dates=${phase.start}-${phase.end}&limit=500`;
        
        console.log(`🔄 Fetching ${phase.name}...`);
        try {
            const response = await fetch(espnApiUrl);
            if (!response.ok) continue;
            
            const data = await response.json() as ApiMatchesResponse;
            const events = data.events || [];
            
            console.log(`   ✓ Found ${events.length} matches\n`);
            allEvents.push(...events);
        } catch (error) {
            console.log(`   ❌ Error fetching ${phase.name}:`, error);
        }
    }
    
    // --- Lógica de mapeo de clubes (se mantiene igual) ---
    const clubs = await prisma.club.findMany({ select: { id: true, nombre: true } });
    const clubIdByName = new Map<string, number>();
    for (const c of clubs) clubIdByName.set(c.nombre.toLowerCase(), c.id);
    
    let inserted = 0;
    let updated = 0;
    const matchesByRound = new Map<string, number>();
    
    for (const event of allEvents) {
        const competition = event.competitions[0];
        const homeComp = competition.competitors.find(c => c.homeAway === "home");
        const awayComp = competition.competitors.find(c => c.homeAway === "away");
        
        if (!homeComp || !awayComp) continue;
        
        const homeTeamName = homeComp.team.displayName;
        const awayTeamName = awayComp.team.displayName;
        const match_date = new Date(event.date);
        const notesHeadline = competition.notes?.[0]?.headline || null;
        
        const roundName = getRoundFromLibertadoresDate(match_date, notesHeadline);
        const groupName = competition.group?.name || null;
        const leg = notesHeadline?.toLowerCase().includes('2nd leg') ? 2 : 1;
        
        const matchData = {
            espn_id: event.id,
            league: leagueData.name,
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

        const existing = await prisma.match_row.findUnique({ where: { espn_id: event.id } });
        
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
        
        if (existing) updated++; else inserted++;
        matchesByRound.set(roundName, (matchesByRound.get(roundName) || 0) + 1);
    }
    
    console.log(`\n📊 Summary ${leagueData.name}:`);
    console.log(`   Processed: ${allEvents.length} | New: ${inserted} | Updated: ${updated}`);
}

// Ejecución principal
async function main() {
    const prisma = new PrismaClient();
    try {
        await updateLibertadoresMatches(
            { url: 'conmebol.libertadores', name: 'Copa Libertadores' },
            prisma,
            '2025'
        );
    } catch (error) {
        console.error('❌ Error fatal:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();