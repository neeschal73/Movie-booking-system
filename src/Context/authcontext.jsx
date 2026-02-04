import React, { createContext, useContext, useState, useEffect } from "react"
import { auth, googleProvider } from "../config/firebase"
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../config/firebase"

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Sign up with email/password
  async function signup(email, password, name, address, phone = "", district = "", city = "", photoURL = "") {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await createUserDocument(userCredential.user, { name, email, address, phone, district, city, photoURL })
    return userCredential
  }

  // Login with email/password
  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    await fetchUserData(userCredential.user.uid)
    return userCredential
  }

  // Login with Google
  async function loginWithGoogle() {
    const userCredential = await signInWithPopup(auth, googleProvider)
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))
    if (!userDoc.exists()) {
      // Create user document if doesn't exist
      await createUserDocument(userCredential.user, {
        name: userCredential.user.displayName,
        email: userCredential.user.email,
        address: "",
        phone: "",
        district: "",
        city: "",
        photoURL: userCredential.user.photoURL
      })
    }
    return userCredential
  }

  // Create user document in Firestore
  async function createUserDocument(user, additionalData = {}) {
    const userRef = doc(db, "users", user.uid)
    const snapshot = await getDoc(userRef)

    if (!snapshot.exists()) {
      const userData = {
        uid: user.uid,
        email: user.email,
        name: additionalData.name || user.displayName || "",
        address: additionalData.address || "",
        phone: additionalData.phone || "",
        district: additionalData.district || "",
        city: additionalData.city || "",
        photoURL: user.photoURL || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        role: "user",
        ...additionalData
      }
      await setDoc(userRef, userData)
      setUserData(userData)
    }
    return userRef
  }

  // Fetch user data from Firestore
  async function fetchUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid))
      if (userDoc.exists()) {
        setUserData(userDoc.data())
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  // Update user profile
  async function updateUserProfile(uid, data) {
    const userRef = doc(db, "users", uid)
    await setDoc(userRef, { ...data, updatedAt: serverTimestamp() }, { merge: true })
    setUserData(prev => ({ ...prev, ...data }))
  }

  // Logout
  async function logout() {
    setUserData(null)
    return signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await fetchUserData(user.uid)
      } else {
        setUserData(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userData,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateUserProfile,
    createUserDocument,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
