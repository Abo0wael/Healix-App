// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6b9S150hTAWsw2H3VKAV5iOVgtwk_nDY",
  authDomain: "hackathon-bnha.firebaseapp.com",
  projectId: "hackathon-bnha",
  storageBucket: "hackathon-bnha.firebasestorage.app",
  messagingSenderId: "230555682850",
  appId: "1:230555682850:web:5443a976ee9d411ec7e27b",
  measurementId: "G-K2BJ1KE8LJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const storage = getStorage(app);

// Export Firebase services
export { app, auth, db, storage };

