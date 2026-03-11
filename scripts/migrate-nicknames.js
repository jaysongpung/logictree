/**
 * One-time migration: lowercase all project nicknames in Firestore.
 * Run from browser console while the app is open:
 *   import('/scripts/migrate-nicknames.js')
 * Or paste the logic directly into the console.
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig, 'migration');
const db = getFirestore(app);

async function migrate() {
  const snapshot = await getDocs(collection(db, 'projects'));
  let updated = 0;
  for (const d of snapshot.docs) {
    const data = d.data();
    if (data.nickname && data.nickname !== data.nickname.toLowerCase()) {
      await updateDoc(doc(db, 'projects', d.id), { nickname: data.nickname.toLowerCase() });
      console.log(`Updated: ${data.nickname} → ${data.nickname.toLowerCase()} (${d.id})`);
      updated++;
    }
  }
  console.log(`Migration complete. ${updated} project(s) updated.`);

  // Also migrate comments
  const commentSnap = await getDocs(collection(db, 'comments'));
  let commentUpdated = 0;
  for (const d of commentSnap.docs) {
    const data = d.data();
    if (data.author && data.author !== data.author.toLowerCase()) {
      await updateDoc(doc(db, 'comments', d.id), { author: data.author.toLowerCase() });
      console.log(`Comment updated: ${data.author} → ${data.author.toLowerCase()} (${d.id})`);
      commentUpdated++;
    }
  }
  console.log(`Comment migration complete. ${commentUpdated} comment(s) updated.`);
}

migrate();
