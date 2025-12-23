
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
 * Scraper universal que extrae metadatos de cualquier URL
 * Prioriza selectores comunes y etiquetas Meta (OpenGraph, Twitter Cards)
 */
export async function scrapeGameMetadata(url: string): Promise<ScrapedData> {
  try {
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('No se pudo acceder a la página');
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // --- EXTRACCIÓN DE TÍTULO ---
    const title = 
      doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
      doc.querySelector('h1[itemprop="name"]')?.textContent?.trim() || 
      doc.querySelector('h1')?.textContent?.trim() ||
      doc.title?.split('|')[0]?.split('-')[0]?.trim() ||
      "Nuevo Juego";

    // --- EXTRACCIÓN DE DESCRIPCIÓN ---
    const description = 
      doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
      doc.querySelector('div[itemprop="description"]')?.textContent?.trim() ||
      doc.querySelector('.article')?.textContent?.trim() ||
      doc.querySelector('p')?.textContent?.trim() || "";

    // --- EXTRACCIÓN DE METADATOS (Regex sobre el HTML crudo como fallback) ---
    // Tamaño: busca patrones como 1.5 GB, 500 MB, etc.
    const sizeMatch = html.match(/(\d+(?:\.\d+)?\s*(?:GB|MB|gb|mb|Gb|Mb))/i);
    const size = sizeMatch ? sizeMatch[0] : 'Varia';

    // Año: busca años razonables (1990-2029)
    const yearMatch = html.match(/(?:19|20)[0-2][0-9]/);
    const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();

    // Editor / Fuente
    const domain = new URL(url).hostname.replace('www.', '');
    const publisher = domain.charAt(0).toUpperCase() + domain.slice(1);

    return {
      title: title.substring(0, 100),
      description: description.substring(0, 2000),
      size,
      year,
      publisher,
      version: 'Latest'
    };
  } catch (error) {
    console.error('Error en el scraper universal:', error);
    throw error;
  }
}
