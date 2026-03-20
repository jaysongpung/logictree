// One-time migration: set sortAt = submittedAt || createdAt for all projects
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyCrmCZEsmlS91ixu7GdirZTh38vvqScpCU',
  authDomain: 'logictree-2603.firebaseapp.com',
  projectId: 'logictree-2603',
  storageBucket: 'logictree-2603.firebasestorage.app',
  messagingSenderId: '530943065228',
  appId: '1:530943065228:web:be0e0d758bb25bdc1d0fa9',
});
const db = getFirestore(app);

const snapshot = await getDocs(collection(db, 'projects'));
let updated = 0;
for (const d of snapshot.docs) {
  const data = d.data();
  if (data.sortAt) continue;
  const sortAt = data.submittedAt || data.createdAt;
  if (sortAt) {
    await updateDoc(doc(db, 'projects', d.id), { sortAt });
    updated++;
  }
}
console.log(`Migration complete: ${updated} documents updated, ${snapshot.size - updated} skipped`);
process.exit(0);
