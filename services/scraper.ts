
const CORS_PROXY = 'https://corsproxy.io/?';

/**
 * Extrae el enlace real del archivo (.apk, .zip, etc) desde una página de AN1.com
 */
export async function fetchFreshAndroidLink(pageUrl: string): Promise<string | null> {
  try {
    if (!pageUrl.includes('an1.com')) return pageUrl; // Si no es AN1, devolver el link original

    // 1. Obtener la página principal del juego
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(pageUrl)}`;
    const response = await fetch(proxyUrl);
    const html = await response.text();

    // 2. Buscar el enlace a la página de descarga (timer page)
    const dwPageMatch = html.match(/\/file_[0-9]+-dw\.html/);
    if (!dwPageMatch) return null;

    const dwPageUrl = `https://an1.com${dwPageMatch[0]}`;
    const proxyDwUrl = `${CORS_PROXY}${encodeURIComponent(dwPageUrl)}`;

    // 3. Obtener la página de descarga
    const dwResponse = await fetch(proxyDwUrl);
    const dwHtml = await dwResponse.text();

    // 4. Buscar el enlace directo al archivo
    // AN1 suele usar un link con ID "download_link" o un patrón /get/
    const directLinkMatch = dwHtml.match(/href="(https:\/\/[^"]+\.(apk|zip|rar|7z|obb)[^"]*)"/i) || 
                           dwHtml.match(/id="download_link"[^>]+href="([^"]+)"/i);

    if (directLinkMatch) {
      return directLinkMatch[1];
    }

    // Fallback: buscar cualquier botón verde de éxito
    const fallbackMatch = dwHtml.match(/class="btn btn-lg btn-success"[^>]+href="([^"]+)"/i);
    return fallbackMatch ? fallbackMatch[1] : null;

  } catch (error) {
    console.error('Error al extraer link dinámico:', error);
    return null;
  }
}
