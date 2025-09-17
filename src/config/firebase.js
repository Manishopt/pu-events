import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyARoN_svELvB7K4uRPPaB_T9zvRAp5rrrg",
  authDomain: "pu-events-8ac72.firebaseapp.com",
  databaseURL: "https://pu-events-8ac72-default-rtdb.firebaseio.com",
  projectId: "pu-events-8ac72",
  storageBucket: "pu-events-8ac72.firebasestorage.app",
  messagingSenderId: "976567734167",
  appId: "1:976567734167:web:73e519a17d2585d3d77ed2",
  measurementId: "G-SL55PKY15E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Initialize Realtime Database and get a reference to the service
export const db = getDatabase(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);
