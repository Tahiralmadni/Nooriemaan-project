// Firebase Configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyAx9BkHtbV5Gk67MJKA9-mePZLN3CCf4ew",
    authDomain: "nooeriemaan.firebaseapp.com",
    projectId: "nooeriemaan",
    storageBucket: "nooeriemaan.firebasestorage.app",
    messagingSenderId: "870308337912",
    appId: "1:870308337912:web:c65ac458717bebaf1f830d",
    measurementId: "G-TK02LBCKH6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
