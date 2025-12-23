
const CORS_PROXY = 'https://corsproxy.io/?';

export interface ScrapedGame {
  title: string;
  description: string;
  imageUrl: string;
  size: string;
  year: string;
  console: string;
  publisher: string;
  format: string;
  downloadUrl: string;
}

/**
 * Extrae información básica de un juego desde una URL de AN1.com
 */
export async function scrapeAN1Game(url: string): Promise<ScrapedGame> {
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
                  "Nuevo Juego Android";
    
    // Simplificado para evitar errores de TS con símbolos
    const descEl = doc.querySelector('div[itemprop="description"]') || doc.querySelector('.article');
    const description = descEl?.textContent?.trim() || "";
                        
    let imageUrl = doc.querySelector('img[itemprop="image"]')?.getAttribute('src') || 
                   doc.querySelector('.post-thumb img')?.getAttribute('src') || "";
    
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `https://an1.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }

    // Extracción de metadatos desde el HTML crudo si no hay selectores claros
    const sizeMatch = html.match(/([0-9.]+\s?(MB|GB|mb|gb|Mb|Gb))/);
    const yearMatch = html.match(/(20[0-2][0-9]|19[8-9][0-9])/);

    return {
      title,
      description: description.substring(0, 1000), // Limitar para evitar saturar DB
      imageUrl,
      size: sizeMatch ? sizeMatch[0] : 'Varia',
      year: yearMatch ? yearMatch[0] : new Date().getFullYear().toString(),
      console: 'Android',
      publisher: 'AN1.com',
      format: 'APK / OBB',
      downloadUrl: url // Guardamos la URL de la página para resolución dinámica posterior
    };
  } catch (error) {
    console.error('Error scrapeando AN1:', error);
    throw error;
  }
}

/**
 * Resuelve el enlace real de descarga de AN1.com (con token fresco)
 */
export async function fetchFreshAndroidLink(pageUrl: string): Promise<string | null> {
  try {
    if (!pageUrl.includes('an1.com')) return pageUrl;

    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(pageUrl)}`;
    const response = await fetch(proxyUrl);
    const html = await response.text();

    const dwPageMatch = html.match(/\/file_[0-9]+-dw\.html/);
    if (!dwPageMatch) return null;

    const dwPageUrl = `https://an1.com${dwPageMatch[0]}`;
    const proxyDwUrl = `${CORS_PROXY}${encodeURIComponent(dwPageUrl)}`;

    const dwResponse = await fetch(proxyDwUrl);
    const dwHtml = await dwResponse.text();

    const directLinkMatch = dwHtml.match(/href="(https:\/\/[^"]+\.(apk|zip|rar|7z|obb)[^"]*)"/i) || 
                           dwHtml.match(/id="download_link"[^>]+href="([^"]+)"/i);

    if (directLinkMatch) return directLinkMatch[1];
    
    const fallbackMatch = dwHtml.match(/class="btn btn-lg btn-success"[^>]+href="([^"]+)"/i);
    return fallbackMatch ? fallbackMatch[1] : null;

  } catch (error) {
    console.error('Error al extraer link dinámico:', error);
    return null;
  }
}
