import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDwwYiMuAvNRXXpsLhfVoMNq7xQKbFwa64",
  authDomain: "facilitando-jejum-406c9.firebaseapp.com",
  projectId: "facilitando-jejum-406c9",
  storageBucket: "facilitando-jejum-406c9.firebasestorage.app",
  messagingSenderId: "132479932204",
  appId: "1:132479932204:web:b717699a183af1b3a33e89",
  measurementId: "G-3DESDJE1H9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn("Analytics initialization failed (expected in some iframe environments):", e);
  }
}

let authInstance: any = null;
try {
  authInstance = getAuth(app);
} catch (e) {
  console.warn("Auth initialization failed:", e);
}
export const auth = authInstance;
let dbInstance: any = null;
try {
  dbInstance = getFirestore(app);
} catch (e) {
  console.warn("Firestore initialization failed:", e);
}
export const db = dbInstance;

