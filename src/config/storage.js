import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage"
import { app } from "./firebase"

const storage = getStorage(app)

export { storage, ref, getDownloadURL, uploadBytes }