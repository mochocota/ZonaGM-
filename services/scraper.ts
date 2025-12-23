
const CORS_PROXY = 'https://corsproxy.io/?';

/**
 * Attempts to extract the final download link from an AN1.com game page.
 * AN1 usually has a 'Download' button that leads to a timer page.
 */
export async function fetchAndroidDownloadLink(pageUrl: string): Promise<string | null> {
  try {
    if (!pageUrl.includes('an1.com')) {
      throw new Error('Solo se soporta AN1.com por ahora.');
    }

    // 1. Fetch the main game page
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(pageUrl)}`;
    const response = await fetch(proxyUrl);
    const html = await response.text();

    // 2. Find the link to the download page
    // Pattern: /file_([0-9]+)-dw.html
    const dwPageMatch = html.match(/\/file_[0-9]+-dw\.html/);
    if (!dwPageMatch) return null;

    const dwPageUrl = `https://an1.com${dwPageMatch[0]}`;
    const proxyDwUrl = `${CORS_PROXY}${encodeURIComponent(dwPageUrl)}`;

    // 3. Fetch the download page (where the timer is)
    const dwResponse = await fetch(proxyDwUrl);
    const dwHtml = await dwResponse.text();

    // 4. Extract the direct APK/ZIP link
    // AN1 usually puts it in a script or a button with an ID
    // Look for href="https://an1.co/get/..." or similar patterns
    const directLinkMatch = dwHtml.match(/href="(https:\/\/[^"]+\.(apk|zip|rar|7z|obb))"/i) || 
                           dwHtml.match(/id="download_link"[^>]+href="([^"]+)"/i);

    if (directLinkMatch) {
      return directLinkMatch[1];
    }

    // Fallback: search for any large green button link
    const fallbackMatch = dwHtml.match(/class="btn btn-lg btn-success"[^>]+href="([^"]+)"/i);
    return fallbackMatch ? fallbackMatch[1] : null;

  } catch (error) {
    console.error('Error scraping link:', error);
    return null;
  }
}
