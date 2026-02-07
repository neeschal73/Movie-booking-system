/**
 * TMDB image URL builder - NO API calls
 * Poster/backdrop paths stored in Firebase.
 * TMDB CDN can block requests; wsrv.nl proxy used as fallback for reliability.
 */

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
const PROXY_BASE = "https://images.weserv.nl";

/**
 * Get image URL from TMDB path stored in Firebase
 * Uses wsrv.nl proxy - TMDB CDN often blocks direct requests (CORS/referrer)
 */
export function getTMDBImageUrl(path, size = "w500") {
  if (!path || typeof path !== "string") return null;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const tmdbUrl = `https://image.tmdb.org/t/p/${size}${normalized}`;
  return `${PROXY_BASE}/?url=${encodeURIComponent(tmdbUrl)}`;
}

/**
 * Check if path looks like a TMDB path
 */
export function isTMDBPath(path) {
  if (!path || typeof path !== "string") return false;
  const p = path.startsWith("/") ? path : `/${path}`;
  return /^\/.+\.(jpg|jpeg|png|webp)$/i.test(p);
}
