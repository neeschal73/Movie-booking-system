import { storage, getDownloadURL, ref } from "../config/storage";
import { getTMDBImageUrl, isTMDBPath } from "./tmdb";

/**
 * Fetches image from Firebase Storage
 */
export const getFirebaseImageUrl = async (imagePath) => {
  if (!imagePath) return null;
  try {
    const imageRef = ref(storage, imagePath);
    const url = await getDownloadURL(imageRef);
    return url;
  } catch (error) {
    console.error("Error fetching Firebase image:", error);
    return null;
  }
};

/**
 * Gets image URL - full URLs, Firebase Storage paths, or Picsum placeholder
 */
export const getImageUrl = (imagePath, size = "w500", fallbackText = "No Image") => {
  if (!imagePath) return getPicsumUrl(fallbackText);

  if (imagePath.startsWith("http")) return imagePath;

  if (
    imagePath.startsWith("gs://") ||
    imagePath.startsWith("movies/") ||
    imagePath.startsWith("/movies/") ||
    imagePath.startsWith("users/") ||
    imagePath.startsWith("/users/")
  ) {
    return getPicsumUrl("Loading");
  }

  // TMDB poster/backdrop path (e.g. /abc123.jpg) - official movie images
  if (isTMDBPath(imagePath)) {
    return getTMDBImageUrl(imagePath, size) || getPicsumUrl(fallbackText);
  }

  // Picsum seed format
  if (imagePath.startsWith("picsum:")) {
    return getPicsumUrl(imagePath.replace("picsum:", ""));
  }

  return getPicsumUrl(fallbackText);
};

const getPicsumUrl = (seed) => {
  const s = encodeURIComponent(String(seed || "movie").replace(/\s+/g, "-"));
  return `https://picsum.photos/seed/${s}/500/750`;
};

/**
 * Handles image loading errors with fallback
 */
export const handleImageError = (event, movieTitle) => {
  const fallbackUrl = getPicsumUrl(movieTitle || "No Image");
  if (event.target.src !== fallbackUrl) {
    event.target.src = fallbackUrl;
  }
};
