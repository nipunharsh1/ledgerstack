import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAuSp_btRSWsBURUSememKr4CNLwAtnHuQ',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'ledgerstack-cedb1.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'ledgerstack-cedb1',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'ledgerstack-cedb1.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '677171964763',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:677171964763:web:a5028883a20b2b092c487e',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-ETYW70WXR5',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Analytics if supported in the current environment
export const analyticsPromise = isSupported().then((supported) =>
  supported ? getAnalytics(app) : null
);
