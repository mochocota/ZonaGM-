
const CORS_PROXY = 'https://corsproxy.io/?';

export interface ScrapedData {
  title: string;
  description: string;
  size: string;
  year: string;
  publisher: string;
  version: string;
}

/**
 * Extrae metadatos básicos (solo texto) de una página de AN1.com
 */
export async function scrapeAN1Game(url: string): Promise<ScrapedData> {
  try {
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('No se pudo acceder a la página');
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Selectores específicos de AN1
    const title = doc.querySelector('h1[itemprop="name"]')?.textContent?.trim() || 
                  doc.querySelector('.title')?.textContent?.trim() || 
                  "Nuevo Juego";
    
    // Extraer descripción (evitando scripts o html pesado)
    const descEl = doc.querySelector('div[itemprop="description"]') || doc.querySelector('.article');
    const description = descEl?.textContent?.trim() || "";
    
    // Metadatos adicionales de la tabla de info de AN1
    const infoItems = Array.from(doc.querySelectorAll('.item-spec'));
    let size = 'Varia';
    let year = new Date().getFullYear().toString();
    let publisher = 'Android';
    let version = 'Latest';

    infoItems.forEach(item => {
        const text = item.textContent?.toLowerCase() || '';
        if (text.includes('version')) version = item.querySelector('.spec-val')?.textContent?.trim() || version;
        if (text.includes('size')) size = item.querySelector('.spec-val')?.textContent?.trim() || size;
        if (text.includes('updated')) {
            const dateStr = item.querySelector('.spec-val')?.textContent?.trim() || '';
            const yearMatch = dateStr.match(/\d{4}/);
            if (yearMatch) year = yearMatch[0];
        }
    });

    return {
      title,
      description: description.substring(0, 1500), // Límite razonable
      size,
      year,
      publisher: 'AN1.com',
      version
    };
  } catch (error) {
    console.error('Error scrapeando:', error);
    throw error;
  }
}
