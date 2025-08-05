// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBjbTK0gEbpWcj1zfbR81HBgo0VAkJWoDU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "vyparpragatipro.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "vyparpragatipro",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "vyparpragatipro.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "770210258365",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:770210258365:web:66c6999c0a4d44a02606d4",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-SPVYBPKTZE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize other services only on client side
let analytics = null;
let storage = null;

if (typeof window !== "undefined") {
  // Initialize Analytics
  import("firebase/analytics").then(({ getAnalytics, isSupported }) => {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  });

  // Initialize Storage
  import("firebase/storage").then(({ getStorage }) => {
    storage = getStorage(app);
  });
}

export { app, analytics, storage, db }; 