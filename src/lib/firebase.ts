import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ChatStyle } from '../types';

const isConfigValid = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId;

if (!isConfigValid) {
  console.warn("Firebase configuration is missing or incomplete. Some features may be limited.");
}

const app = isConfigValid ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : ({} as any);
export const db = app ? getFirestore(app, firebaseConfig.firestoreDatabaseId) : ({} as any);
export const googleProvider = new GoogleAuthProvider();

export interface UserPrefs {
  teachingStyle: ChatStyle;
  hasAgreedToPrivacy: boolean;
  updatedAt: any;
}

export interface HistoryMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: any;
}

// Helper to handle Firestore errors
export function handleFirestoreError(error: any, operation: string, path: string | null = null) {
  const authUser = auth.currentUser;
  const errorInfo = {
    error: error.message || 'Unknown error',
    operationType: operation,
    path: path,
    authInfo: {
      userId: authUser?.uid || 'anonymous',
      email: authUser?.email || '',
      emailVerified: authUser?.emailVerified || false,
      isAnonymous: authUser?.isAnonymous || false,
      providerInfo: authUser?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || ''
      })) || []
    }
  };
  console.error(`Firestore Error [${operation}]:`, JSON.stringify(errorInfo, null, 2));
  throw new Error(JSON.stringify(errorInfo));
}

export async function getUserPrefs(userId: string): Promise<UserPrefs | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? (userDoc.data() as UserPrefs) : null;
  } catch (err) {
    handleFirestoreError(err, 'get', `users/${userId}`);
    return null;
  }
}

export async function saveUserPrefs(userId: string, prefs: Partial<UserPrefs>) {
  try {
    const userRef = doc(db, 'users', userId);
    const existing = await getDoc(userRef);
    if (existing.exists()) {
      await updateDoc(userRef, {
        ...prefs,
        updatedAt: serverTimestamp()
      });
    } else {
      await setDoc(userRef, {
        teachingStyle: prefs.teachingStyle || 'simple',
        hasAgreedToPrivacy: prefs.hasAgreedToPrivacy || false,
        updatedAt: serverTimestamp()
      });
    }
  } catch (err) {
    handleFirestoreError(err, 'write', `users/${userId}`);
  }
}

export async function getChatHistory(userId: string): Promise<HistoryMessage[]> {
  try {
    const historyRef = collection(db, 'users', userId, 'history');
    const q = query(historyRef, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as HistoryMessage);
  } catch (err) {
    handleFirestoreError(err, 'list', `users/${userId}/history`);
    return [];
  }
}

export async function addHistoryMessage(userId: string, role: 'user' | 'model', content: string) {
  try {
    const historyRef = collection(db, 'users', userId, 'history');
    await addDoc(historyRef, {
      role,
      content,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, 'create', `users/${userId}/history`);
  }
}
