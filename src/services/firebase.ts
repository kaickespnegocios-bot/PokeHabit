import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyClWzslDceU1IOKBcx3i5PKagnAhltePvU',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'pokehabit-316ab.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'pokehabit-316ab',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'pokehabit-316ab.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '620227432812',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:620227432812:web:a533f00aca29fa7e152349',
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) return null;
  if (!auth) {
    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) return null;
    auth = getAuth(firebaseApp);
  }
  return auth;
}

export function getFirebaseDb(): Firestore | null {
  if (!isFirebaseConfigured()) return null;
  if (!db) {
    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) return null;
    db = getFirestore(firebaseApp);
  }
  return db;
}
