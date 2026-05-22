/**
 * POST /api/firebase/test — Test Firestore connection
 * Writes a test document and reads back recent docs
 */
export const runtime = 'nodejs'; // Firestore requires Node.js runtime
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Dynamic import to avoid edge runtime issues
    const { initializeApp, getApps, getApp, cert } = await import('firebase-admin/app');
    const { getFirestore }                          = await import('firebase-admin/firestore');

    // Initialize admin SDK if not already done
    const adminApp = getApps().find(a => a.name === 'admin') ||
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aksharaworld-481e8',
      }, 'admin');

    const adminDb = getFirestore(adminApp);

    // Write a test document
    const testRef = adminDb.collection('system').doc('integration-test');
    await testRef.set({
      tested:    new Date().toISOString(),
      source:    'akshara-dashboard',
      status:    'connected',
      project:   'aksharaworld-481e8',
    });

    // Read recent documents from multiple collections
    const collections = ['leads', 'orders', 'subscribers', 'events'];
    const recentDocs: any[] = [];

    for (const col of collections) {
      try {
        const snap = await adminDb.collection(col).orderBy('timestamp', 'desc').limit(3).get();
        snap.docs.forEach(d => {
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
      message: 'Firestore connected!',
      docs:    recentDocs.slice(0, 10),
    });

  } catch (e: any) {
    // Client SDK fallback (when admin SDK not configured)
    return NextResponse.json({
      success: false,
      message: 'Enable Firestore in Firebase Console → Create database → Start in test mode',
      error:   e.message,
    });
  }
}
