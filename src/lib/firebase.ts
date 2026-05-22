/**
 * 🔥 Firebase — Akshara World
 * Project: aksharaworld-481e8
 * Plan: Spark (Free)
 * Services: Analytics, Firestore, Storage, Auth
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported }        from 'firebase/analytics';
import { getFirestore }                      from 'firebase/firestore';
import { getStorage }                        from 'firebase/storage';
import { getAuth }                           from 'firebase/auth';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY        || 'AIzaSyBuKLez-yzYgYbzC8hLDCvFuwIurbj_YnM',
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN    || 'aksharaworld-481e8.firebaseapp.com',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID     || 'aksharaworld-481e8',
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'aksharaworld-481e8.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_ID   || '633321287038',
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID         || '1:633321287038:web:3a5299251ffb6edd62972f',
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-VJ7GHMKHFM',
};

// ── Singleton initialization (prevents duplicate apps in Next.js) ──
const app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db   = getFirestore(app);
const storage = getStorage(app);
const auth    = getAuth(app);

// Analytics only works in browser
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then(yes => {
    if (yes) analytics = getAnalytics(app);
  });
}

export { app, db, storage, auth, analytics, firebaseConfig };

// ── Firestore collection helpers ──
export const COLLECTIONS = {
  orders:      'orders',
  leads:       'leads',
  subscribers: 'subscribers',
  events:      'events',
  products:    'products',
  sessions:    'sessions',
} as const;

export default app;
