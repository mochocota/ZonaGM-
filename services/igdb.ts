const CLIENT_ID = 'enys9zuc31puz2hj3k5enkviog5fvw';
const CLIENT_SECRET = 'qnd0id590kvr40gny1qz42k60a1ig6';

// CORS Proxy is required for browser-based requests to IGDB
const CORS_PROXY = 'https://corsproxy.io/?';

let accessToken = '';

async function getAccessToken() {
  if (accessToken) return accessToken;

  // We use the proxy to bypass CORS on the token endpoint as well
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
    
    // Sanitize query to prevent API errors
    const sanitizedQuery = query.replace(/["]/g, '\\"');
    
    // Construct the query
    // We look for name, summary (description), first_release_date (year), cover, involved_companies (publisher), platforms, total_rating, screenshots
    // Limit increased to 50 to help find games that might be buried
    const queryBody = `
      fields name, summary, first_release_date, cover.url, platforms.name, involved_companies.company.name, total_rating, screenshots.url;
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

    return data.map((game: any) => {
        // --- MAPPINGS ---

        // Year
        const year = game.first_release_date 
        ? new Date(game.first_release_date * 1000).getFullYear().toString() 
        : '';

        // Image (Convert thumb to 1080p/big)
        let imageUrl = '';
        if (game.cover && game.cover.url) {
            // IGDB urls start with //
            imageUrl = 'https:' + game.cover.url.replace('t_thumb', 't_cover_big_2x');
        }

        // Screenshots (Use original quality for best resolution)
        let screenshots: string[] = [];
        if (game.screenshots && game.screenshots.length > 0) {
            screenshots = game.screenshots.map((s: any) => 
                'https:' + s.url.replace('t_thumb', 't_original')
            ).slice(0, 4); // Take up to 4 screenshots
        }

        // Publisher
        let publisher = '';
        if (game.involved_companies && game.involved_companies.length > 0) {
        publisher = game.involved_companies[0].company?.name || '';
        }

        // Rating (0-100 to 0-5)
        let rating = 0;
        if (game.total_rating) {
        rating = parseFloat((game.total_rating / 20).toFixed(1));
        }

        // Console Mapping
        let consoleType = 'Other'; 
        
        if (game.platforms && game.platforms.length > 0) {
            const platformNames = game.platforms.map((p: any) => p.name);
            
            // Comprehensive Mapping List
            // Checks checks are partial matches against IGDB names
            const mappings = [
                { check: 'Nintendo GameCube', val: 'GameCube' },
                { check: 'GameCube', val: 'GameCube' },
                { check: 'PlayStation 5', val: 'PlayStation 5' },
                { check: 'PlayStation 4', val: 'PlayStation 4' },
                { check: 'PlayStation 3', val: 'PlayStation 3' },
                { check: 'PlayStation 2', val: 'PS2' },
                { check: 'PlayStation Portable', val: 'PSP' },
                { check: 'PlayStation Vita', val: 'PS Vita' },
                { check: 'PlayStation', val: 'PS1' }, // Specific check for PS1 (IGDB usually calls it PlayStation)
                { check: 'PS1', val: 'PS1' },
                { check: 'Xbox Series', val: 'Xbox Series X/S' },
                { check: 'Xbox 360', val: 'Xbox 360' },
                { check: 'Xbox', val: 'Xbox' },
                { check: 'Wii U', val: 'Wii U' },
                { check: 'Wii', val: 'Wii' },
                { check: 'Nintendo Switch', val: 'Nintendo Switch' },
                { check: 'Switch', val: 'Nintendo Switch' },
                { check: 'Nintendo 3DS', val: 'Nintendo 3DS' },
                { check: 'Nintendo DS', val: 'Nintendo DS' },
                { check: 'Nintendo 64', val: 'N64' },
                { check: 'Super Nintendo', val: 'SNES' },
                { check: 'SNES', val: 'SNES' },
                { check: 'Game Boy Advance', val: 'GBA' },
                { check: 'GBA', val: 'GBA' },
                { check: 'Dreamcast', val: 'Dreamcast' },
                { check: 'Saturn', val: 'Saturn' },
                { check: 'Genesis', val: 'Sega Genesis' },
                { check: 'Mega Drive', val: 'Sega Genesis' },
                { check: 'Nintendo Entertainment System', val: 'NES' },
                { check: 'NES', val: 'NES' },
                { check: 'Windows', val: 'PC' },
                { check: 'PC', val: 'PC' },
                { check: 'Linux', val: 'PC' },
                { check: 'Mac', val: 'PC' }
            ];

            // Scan through priority mappings
            for (const map of mappings) {
                if (platformNames.some((name: string) => name.includes(map.check))) {
                    consoleType = map.val;
                    break;
                }
            }

            // If no match found in our list, use the first platform name provided by IGDB
            if (consoleType === 'Other') {
                consoleType = platformNames[0];
            }
        } else {
            // No platforms returned by IGDB
            consoleType = 'GameCube'; // Only then fallback to GameCube or leave blank
        }

        return {
            title: game.name,
            description: game.summary || '',
            year,
            imageUrl,
            screenshots,
            publisher,
            console: consoleType,
            rating
        };
    });

  } catch (error) {
    console.error('IGDB Fetch Error:', error);
    throw error;
  }
}