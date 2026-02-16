import { PrismaClient } from '@prisma/client';
// Importa tu interfaz si la tienes en otro archivo, o defínela aquí
// import { ApiMatchesResponse } from '../apiMatchesInterfaces';

// --- INTERFACES ---
interface LeagueUrlAndName {
    url: string;
    name: string
}

interface ESPNResponse {
    keyEvents?: Array<{
        clock?: { displayValue: string };
        team?: { id: string; displayName: string };
        type?: { type: string; text: string };
        participants?: Array<{
            athlete?: { id: string; displayName: string };
        }>;
        text?: string;
    }>;
}

// Simulamos la interfaz si no la tienes exportada para este archivo
interface ApiMatchesResponse {
    events: Array<any>;
}

// --- FUNCIONES AUXILIARES ---
function checkApiResponseType(apiResponse: any) {
    return (apiResponse && Array.isArray(apiResponse.events));
}

// Delay para no saturar la API de ESPN con múltiples peticiones por segundo
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- PROCESADOR DE EVENTOS (Tarjetas, Goles y Cambios) ---
async function syncMatchEvents(matchId: number, espnId: string, leagueUrl: string, prisma: PrismaClient) {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueUrl}/summary?event=${espnId}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const data = (await response.json()) as ESPNResponse;
        const events = data.keyEvents ?? [];

        // 1. Ampliamos la lista de eventos que queremos capturar
        const validEventTypes = [
            "yellow-card",
            "red-card",
            "goal",
            "penalty-goal",
            "own-goal",
            "substitution"
        ];

        const matchEvents = events.filter((e) => 
            validEventTypes.includes(e.type?.type || "")
        );

        if (matchEvents.length === 0) return; // No hay eventos, salimos silenciosamente

        console.log(`   ⚽/🟨/🔄 Procesando ${matchEvents.length} eventos para ESPN ID: ${espnId}`);

        for (const e of matchEvents) {
            const minuteStr = e.clock?.displayValue || "0";
            const minuteInt = parseInt(minuteStr.replace("'", ""));
            const typeStr = e.type?.type || "unknown";
            
            // Para goles/tarjetas suele ser el autor.
            // Para cambios, suele ser el jugador que ENTRA (y en el text está quién sale)
            const playerName = e.participants?.[0]?.athlete?.displayName || "Jugador";

            await prisma.match_event.upsert({
                where: {
                    match_id_type_minute_player_name: {
                        match_id: matchId,
                        type: typeStr,
                        minute: minuteInt,
                        player_name: playerName
                    }
                },
                update: {
                    // El "text" de ESPN es genial porque en los cambios dice "Entra X, sale Y"
                    // y en los goles a veces incluye quién dio la asistencia.
                    description: e.text || "",
                    clock_display: minuteStr
                },
                create: {
                    match_id: matchId,
                    espn_id: espnId,
                    type: typeStr,
                    minute: minuteInt,
                    clock_display: minuteStr,
                    description: e.text || "",
                    team_name: e.team?.displayName || "Desconocido",
                    player_name: playerName,
                }
            });
        }
    } catch (error) {
        console.error(`❌ Error en fetch ESPN (Eventos) para evento ${espnId}:`, error);
    }
}
// --- FLUJO PRINCIPAL ---
export async function obtainAndProcessAllMatches(leagueData: LeagueUrlAndName, prisma: PrismaClient) {
    const currentYear = new Date().getFullYear();
    const espnApiUrl = `https://site.web.api.espn.com/apis/site/v2/sports/soccer/${leagueData.url}/scoreboard?dates=${currentYear}&limit=1000`;
    
    const response = await fetch(espnApiUrl);
    const data = await response.json() as ApiMatchesResponse;

    if (!checkApiResponseType(data)) {
        console.error(`❌ Error en API principal para ${leagueData.name}`);
        return;
    }

    const allEvents = data.events || [];
    const leagueName = leagueData.name;
    const now = new Date();
    
    // Optimizamos búsqueda de clubs
    const clubs = await prisma.club.findMany({
        select: { id: true, league_key: true, nombre: true },
    });

    const key = (league: string, name: string) =>
        `${(league ?? '').trim().toLowerCase()}|${(name ?? '').trim().toLowerCase()}`;

    const clubIdByKey = new Map<string, number>();
    for (const c of clubs) clubIdByKey.set(key(c.league_key, c.nombre), c.id);

    console.log(`📊 Encontrados ${allEvents.length} partidos para ${leagueName}. Comenzando sincronización...`);

    for (const event of allEvents) {
        const competition = event.competitions[0];
        const homeTeamData = competition.competitors[0];
        const awayTeamData = competition.competitors[1];

        const homeTeamName = homeTeamData.team.displayName;
        const awayTeamName = awayTeamData.team.displayName;
        
        const homeId = clubIdByKey.get(key(leagueName, homeTeamName));
        const awayId = clubIdByKey.get(key(leagueName, awayTeamName));

        let match_date = new Date(event.date);
        if (leagueName === 'Liga Profesional Argentina') {
            match_date.setHours(match_date.getHours() - 3);
        }

        // 1. Guardar o actualizar el partido
        const matchRecord = await prisma.match_row.upsert({
            where: {
                espn_id: event.id
            },
            update: {
                score_home: parseInt(homeTeamData.score) || 0,
                score_away: parseInt(awayTeamData.score) || 0,
                match_date: match_date, // Actualizamos la fecha por si reprogramaron el partido
                updated_at: new Date()
            },
            create: {
                espn_id: event.id,
                league: leagueName,
                home_team: homeTeamName,
                away_team: awayTeamName,
                home_club_id: homeId,
                away_club_id: awayId,
                score_home: parseInt(homeTeamData.score) || 0,
                score_away: parseInt(awayTeamData.score) || 0,
                minute: null,
                match_date: match_date,
                updated_at: new Date()
            }
        });

        // 2. Si el partido ya se jugó (o está en juego), buscamos sus tarjetas
        if (match_date < now && matchRecord.espn_id) {
            await syncMatchEvents(matchRecord.id, matchRecord.espn_id, leagueData.url, prisma);
            // Pequeño descanso para no hacer saltar las protecciones Anti-DDoS de ESPN
            await delay(300); 
        }
    }
}

// --- BLOQUE DE EJECUCIÓN MANUAL ---
async function main() {
    const prisma = new PrismaClient();
    
    const leagueData = { 
        url: "arg.1", 
        name: "Liga Profesional Argentina" 
    };

    console.log(`🚀 Iniciando proceso completo para: ${leagueData.name}...`);
    
    await obtainAndProcessAllMatches(leagueData, prisma);
    
    await prisma.$disconnect();
    console.log("🏁 Proceso de partidos y tarjetas finalizado exitosamente.");
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});