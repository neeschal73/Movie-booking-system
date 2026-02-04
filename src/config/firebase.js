// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCiCnl_x4O61Q0mSQ8okeUlJIDTYH5sMuY",
  authDomain: "movies-booking-43fae.firebaseapp.com",
  projectId: "movies-booking-43fae",
  storageBucket: "movies-booking-43fae.firebasestorage.app",
  messagingSenderId: "1089411991497",
  appId: "1:1089411991497:web:caf911dd34286cd9998a18",
  measurementId: "G-BRXT311Y13"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
