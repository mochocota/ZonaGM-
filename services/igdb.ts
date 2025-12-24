
const CLIENT_ID = 'enys9zuc31puz2hj3k5enkviog5fvw';
const CLIENT_SECRET = 'qnd0id590kvr40gny1qz42k60a1ig6';

// Proxy CORS necesario para peticiones desde el navegador a IGDB
const CORS_PROXY = 'https://corsproxy.io/?';

let accessToken = '';

async function getAccessToken() {
  if (accessToken) return accessToken;

  const targetUrl = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`;
  const url = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;

  const response = await fetch(url, { method: 'POST' });
  const data = await response.json();
  
  if (data.access_token) {
    accessToken = data.access_token;
    return accessToken;
  }
  throw new Error('Failed to get access token');
}

export async function searchIGDB(query: string) {
  try {
    const token = await getAccessToken();
    
    // Sanitizar query
    const sanitizedQuery = query.replace(/["]/g, '\\"');
    
    // Consulta IGDB ampliada
    const queryBody = `
      fields name, summary, first_release_date, cover.url, platforms.name, 
             involved_companies.company.name, total_rating, total_rating_count, 
             screenshots.url, alternative_names.name;
      search "${sanitizedQuery}";
      limit 50;
    `;

    const targetUrl = 'https://api.igdb.com/v4/games';
    const url = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: queryBody
    });

    const data = await response.json();
    
    if (!data || data.length === 0) return [];

    const finalResults: any[] = [];

    // Lista de mapeos de plataformas soportadas
    const mappings = [
        { check: 'PlayStation Vita', val: 'PS Vita' },
        { check: 'PlayStation Portable', val: 'PSP' },
        { check: 'Nintendo Switch', val: 'Nintendo Switch' },
        { check: 'PlayStation 2', val: 'PS2' },
        { check: 'PlayStation 3', val: 'PlayStation 3' },
        { check: 'PlayStation 4', val: 'PlayStation 4' },
        { check: 'PlayStation 5', val: 'PlayStation 5' },
        { check: 'GameCube', val: 'GameCube' },
        { check: 'Wii U', val: 'Wii U' },
        { check: 'Wii', val: 'Wii' },
        { check: 'Nintendo 3DS', val: 'Nintendo 3DS' },
        { check: 'Nintendo DS', val: 'Nintendo DS' },
        { check: 'Nintendo 64', val: 'N64' },
        { check: 'Super Nintendo', val: 'SNES' },
        { check: 'Game Boy Advance', val: 'GBA' },
        { check: 'Dreamcast', val: 'Dreamcast' },
        { check: 'Saturn', val: 'Saturn' },
        { check: 'Sega Genesis', val: 'Sega Genesis' },
        { check: 'Mega Drive', val: 'Sega Genesis' },
        { check: 'Nintendo Entertainment System', val: 'NES' },
        { check: 'NES', val: 'NES' },
        { check: 'Xbox Series', val: 'Xbox Series X/S' },
        { check: 'Xbox 360', val: 'Xbox 360' },
        { check: 'Xbox', val: 'Xbox' },
        { check: 'Windows', val: 'PC' },
        { check: 'PC', val: 'PC' },
        { check: 'PlayStation', val: 'PS1' }
    ];

    data.forEach((game: any) => {
        const year = game.first_release_date 
            ? new Date(game.first_release_date * 1000).getFullYear().toString() 
            : 'TBD';

        let imageUrl = '';
        if (game.cover && game.cover.url) {
            imageUrl = 'https:' + game.cover.url.replace('t_thumb', 't_cover_big_2x');
        }

        let screenshots: string[] = [];
        if (game.screenshots && game.screenshots.length > 0) {
            screenshots = game.screenshots.map((s: any) => 
                'https:' + s.url.replace('t_thumb', 't_original')
            ).slice(0, 4);
        }

        let publisher = '';
        if (game.involved_companies && game.involved_companies.length > 0) {
            publisher = game.involved_companies[0].company?.name || 'Unknown';
        }

        let rating = 0;
        if (game.total_rating) {
            rating = parseFloat((game.total_rating / 20).toFixed(1));
        }

        const voteCount = game.total_rating_count || 0;
        const platformNames = game.platforms?.map((p: any) => p.name) || [];

        // Estrategia de Expansión: Crear un resultado por cada plataforma coincidente.
        // Esto soluciona el problema de "no encuentro el de Vita" si el juego es multiplataforma.
        const matchedConsoles = new Set<string>();

        if (platformNames.length > 0) {
            platformNames.forEach((pName: string) => {
                const foundMapping = mappings.find(m => pName.includes(m.check));
                if (foundMapping) {
                    matchedConsoles.add(foundMapping.val);
                }
            });
        }

        if (matchedConsoles.size > 0) {
            matchedConsoles.forEach(consoleName => {
                finalResults.push({
                    title: game.name,
                    description: game.summary || '',
                    year,
                    imageUrl,
                    screenshots,
                    publisher,
                    console: consoleName,
                    rating,
                    voteCount
                });
            });
        } else {
            // Si no hay plataformas conocidas, añadir una entrada "Other" o usar la primera de IGDB
            finalResults.push({
                title: game.name,
                description: game.summary || '',
                year,
                imageUrl,
                screenshots,
                publisher,
                console: platformNames[0] || 'Other',
                rating,
                voteCount
            });
        }
    });

    // Ordenar resultados para priorizar coincidencias exactas en el título si es posible
    return finalResults.sort((a, b) => {
        const aTitleMatch = a.title.toLowerCase() === sanitizedQuery.toLowerCase();
        const bTitleMatch = b.title.toLowerCase() === sanitizedQuery.toLowerCase();
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        return 0;
    });

  } catch (error) {
    console.error('IGDB Fetch Error:', error);
    throw error;
  }
}
