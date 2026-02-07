import { storage, ref, uploadBytes, getDownloadURL } from "../config/storage"

/**
 * Upload an image to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} path - The path where to store the image (e.g., 'movies/poster.jpg')
 * @returns {Promise<string>} - The download URL of the uploaded image
 */
export const uploadImage = async (file, path) => {
  if (!file) throw new Error("No file provided")
  
  try {
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    return downloadURL
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

/**
 * Upload a movie poster to Firebase Storage
 * @param {File} file - The image file
 * @param {string} movieId - The movie ID
 * @returns {Promise<string>} - The download URL
 */
export const uploadMoviePoster = async (file, movieId) => {
  const fileExtension = file.name.split('.').pop()
  const path = `movies/${movieId}/poster.${fileExtension}`
  return uploadImage(file, path)
}

/**
 * Upload a user avatar to Firebase Storage
 * @param {File} file - The image file
 * @param {string} userId - The user ID
 * @returns {Promise<string>} - The download URL
 */
export const uploadUserAvatar = async (file, userId) => {
  const fileExtension = file.name.split('.').pop()
  const path = `users/${userId}/avatar.${fileExtension}`
  return uploadImage(file, path)
}
