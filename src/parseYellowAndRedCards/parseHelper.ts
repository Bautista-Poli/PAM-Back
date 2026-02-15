import { PrismaClient } from '@prisma/client';

// Interfaces (Asegúrate de tener estas definidas arriba o importadas)
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


 
export async function syncMatchCardsByEspnId(espnId: string, leagueUrl: string, prisma: PrismaClient) {
  
  // 1. Buscamos el partido en nuestra DB usando el espn_id único
  const match = await prisma.match_row.findUnique({
    where: { espn_id: espnId },
    select: { id: true, espn_id: true }
  });

  if (!match) {
    console.error(`❌ No existe un partido en la base de datos con espn_id: ${espnId}. Primero debes crearlo.`);
    return;
  }

  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueUrl}/summary?event=${espnId}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    
    const data = (await response.json()) as ESPNResponse;
    const events = data.keyEvents ?? [];

    const cardEvents = events.filter((e) => 
        ["yellow-card", "red-card"].includes(e.type?.type || "")
    );

    console.log(`📥 Procesando ${cardEvents.length} tarjetas para el evento ESPN: ${espnId}...`);

    for (const e of cardEvents) {
      const minuteStr = e.clock?.displayValue || "0";
      const minuteInt = parseInt(minuteStr.replace("'", ""));

      await prisma.match_event.upsert({
        where: {
          // 1. Usamos el nombre del índice que Prisma te marcó en el error
          match_id_type_minute_player_name: { 
            match_id: match.id,
            type: e.type?.type || "unknown",
            minute: minuteInt,
            // 2. Usamos player_name para identificar la tarjeta
            player_name: e.participants?.[0]?.athlete?.displayName || "Jugador"
          }
        },
        update: {
          description: e.text || "",
          clock_display: minuteStr
        },
        create: {
          match_id: match.id,
          espn_id: espnId,
          type: e.type?.type || "unknown",
          minute: minuteInt,
          clock_display: minuteStr,
          description: e.text || "",
          team_name: e.team?.displayName || "Desconocido",
          player_name: e.participants?.[0]?.athlete?.displayName || "Jugador",
          // Quitamos player_espn_id de aquí si ya no existe en tu @model de Prisma
        }
      });
    }

    console.log(`✅ Sincronización completada para el partido (Interno: ${match.id} | ESPN: ${espnId})`);
  } catch (error) {
    console.error(`❌ Error en fetch ESPN para evento ${espnId}:`, error);
  }
}

// Bloque de ejecución manual
async function main() {
  const prisma = new PrismaClient();
  
  // AHORA USAMOS EL ID DE ESPN DIRECTAMENTE
  const ESPN_ID = "762836"; 
  const LEAGUE_SLUG = "arg.1"; 

  console.log(`🚀 Iniciando sincronización manual por ESPN_ID: ${ESPN_ID}...`);
  
  await syncMatchCardsByEspnId(ESPN_ID, LEAGUE_SLUG, prisma);
  
  await prisma.$disconnect();
  console.log("🏁 Proceso finalizado.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});