// src/config/firebase.ts
// Firebase initialization — imported wherever we need DB or Auth

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace these values with your actual Firebase project config
// Found in: Firebase Console → Project Settings → Your Apps → SDK setup
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase app (only runs once)
const app = initializeApp(firebaseConfig);

// Export auth and db so any screen can import them
export const auth = getAuth(app);
export const db = getFirestore(app);