/* Cash Clinic — Firebase initialization (ES module).
   Loaded as: <script type="module" src="assets/js/firebase-config.js"></script>
*/
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, Timestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyAnLkwAEj4s-wfVcX7AMOtFSbLVpuERU40",
  authDomain: "cashwebsite-39007.firebaseapp.com",
  projectId: "cashwebsite-39007",
  storageBucket: "cashwebsite-39007.firebasestorage.app",
  messagingSenderId: "1078624017592",
  appId: "1:1078624017592:web:b8870f8169be3eef49284d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Re-export commonly used Firestore + Auth helpers
export {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, Timestamp,
  onAuthStateChanged, signInWithEmailAndPassword, signOut
};

/* Helpers ────────────────────────────────────────────── */

// Get current user's role + consultantId from `users/{uid}` document
export async function getUserData(uid) {
  if (!uid) return null;
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Wait for auth state and return user (or null)
export function waitForAuth() {
  return new Promise(resolve => {
    const unsub = onAuthStateChanged(auth, user => {
      unsub();
      resolve(user);
    });
  });
}

// Auth guard for admin pages — redirects to login if not signed in
export async function requireAuth(loginUrl = 'login.html') {
  const user = await waitForAuth();
  if (!user) {
    location.href = loginUrl;
    return null;
  }
  const userData = await getUserData(user.uid);
  if (!userData) {
    // Auth user exists but no Firestore user doc — not authorized
    await signOut(auth);
    location.href = loginUrl + '?error=unauthorized';
    return null;
  }
  return { user, ...userData };
}
