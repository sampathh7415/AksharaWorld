/**
 * POST /api/firebase/test — Test Firestore connection
 * Writes a test document and reads back recent docs using the Client SDK under Edge Runtime.
 */
export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aksharaworld-481e8',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);

    // Write a test document
    const testRef = doc(db, 'system', 'integration-test');
    await setDoc(testRef, {
      tested:    new Date().toISOString(),
      source:    'akshara-dashboard',
      status:    'connected',
      project:   firebaseConfig.projectId,
    });

    // Read recent documents from multiple collections
    const collections = ['leads', 'orders', 'subscribers', 'events'];
    const recentDocs: any[] = [];

    for (const col of collections) {
      try {
        const q = query(collection(db, col), orderBy('timestamp', 'desc'), limit(3));
        const snap = await getDocs(q);
        snap.forEach(d => {
          recentDocs.push({
            id:         d.id,
            collection: col,
            data:       d.data(),
            timestamp:  d.data().timestamp || '—',
          });
        });
      } catch { /* Collection may not exist yet */ }
    }

    return NextResponse.json({
      success: true,
      message: 'Firestore connected successfully via client SDK on Edge!',
      docs:    recentDocs.slice(0, 10),
    });

  } catch (e: any) {
    return NextResponse.json({
      success: false,
      message: 'Enable Firestore in Firebase Console → Create database → Start in test mode',
      error:   e.message,
    });
  }
}
