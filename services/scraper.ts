
const CORS_PROXY = 'https://corsproxy.io/?';

export interface ScrapedData {
  title: string;
  description: string;
}

/**
 * Universal scraper that extracts title and description from any website
 * utilizing OpenGraph, Twitter, and standard Meta tags.
 */
export async function scrapeUniversalMetadata(url: string): Promise<ScrapedData> {
  try {
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('Failed to reach site via proxy');
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract Title with priority order
    const title = 
      doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
      doc.querySelector('h1')?.textContent?.trim() ||
      doc.title?.split('|')[0]?.split('-')[0]?.trim() || 
      "Nuevo Juego";

    // Extract Description with priority order
    const description = 
      doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') ||
      doc.querySelector('p')?.textContent?.trim() || "";

    return {
      title: title.substring(0, 150),
      description: description.substring(0, 2000)
    };
  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  }
}
