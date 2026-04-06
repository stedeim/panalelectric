/**
 * Firebase Admin SDK — server-side only (Vercel serverless functions)
 * Do NOT import this in client-side code!
 *
 * Env vars needed (add to Vercel dashboard):
 *   FIREBASE_PROJECT_ID=panelelectric-d68e4
 *   FIREBASE_CLIENT_EMAIL=<from Firebase service account JSON>
 *   FIREBASE_PRIVATE_KEY=<from Firebase service account JSON>
 */

import * as admin from 'firebase-admin';

let _db: admin.firestore.Firestore | null = null;

function getDb(): admin.firestore.Firestore {
  if (_db) return _db;

  if (admin.apps.length > 0) {
    _db = admin.apps[0]!.firestore();
    return _db;
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    throw new Error(
      'Missing Firebase Admin env vars. ' +
      'Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in Vercel.'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });

  _db = admin.firestore();
  return _db;
}

export { getDb };
