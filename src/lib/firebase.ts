import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import type { JournalInteraction, JournalSession, ReflectionInsightsData } from '../types';

// Safely probe for local applet configuration without breaking builds if absent on GitHub
const localConfigModules = import.meta.glob<{ default?: Record<string, any> } & Record<string, any>>(
  '../../firebase-applet-config.json',
  { eager: true }
);
const localConfigEntries = Object.values(localConfigModules);
const localConfigData = localConfigEntries.length > 0 ? localConfigEntries[0] : {};
const localConfig: Record<string, any> = (localConfigData && typeof localConfigData === 'object' && 'default' in localConfigData && localConfigData.default)
  ? localConfigData.default
  : (localConfigData || {});

// Consolidate Firebase configuration (env variables or local config)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localConfig.apiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localConfig.authDomain || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localConfig.projectId || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localConfig.storageBucket || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig.messagingSenderId || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localConfig.appId || '',
};

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || localConfig.firestoreDatabaseId || undefined;

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth & Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore targeting the provisioned database (if specified) or default
export const db = firestoreDatabaseId 
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);

// Authentication actions
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

// -------------------------------------------------------------
// Isolated User Firestore Persistence Helpers
// Strict boundary: /users/{userId}/...
// -------------------------------------------------------------

export async function saveSession(userId: string, session: JournalSession): Promise<void> {
  if (!userId || !session.id) {
    throw new Error('User ID and Session ID are required for isolation boundary.');
  }
  const sessionRef = doc(db, 'users', userId, 'sessions', session.id);
  
  // Clean payload to prevent undefined values in Firestore
  const payload = {
    id: session.id,
    userId: userId,
    title: session.title || 'Untitled Reflection',
    createdAt: session.createdAt || Date.now(),
    updatedAt: Date.now(),
    interactionsCount: session.interactionsCount || 0,
    previewSnippet: session.previewSnippet || '',
    ...(session.mood ? { mood: session.mood } : {}),
    ...(session.tags && session.tags.length > 0 ? { tags: session.tags } : {}),
    ...(session.summary ? { summary: session.summary } : {}),
    ...(session.insights ? { insights: session.insights } : {}),
  };

  await setDoc(sessionRef, payload, { merge: true });
}

export async function saveSessionInsights(
  userId: string, 
  sessionId: string, 
  insights: ReflectionInsightsData
): Promise<void> {
  if (!userId || !sessionId) {
    throw new Error('User ID and Session ID are required to save reflection insights.');
  }
  const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
  await setDoc(sessionRef, { 
    insights, 
    updatedAt: Date.now() 
  }, { merge: true });
}

export async function getSessions(userId: string): Promise<JournalSession[]> {
  if (!userId) return [];
  const sessionsRef = collection(db, 'users', userId, 'sessions');
  const q = query(sessionsRef, orderBy('updatedAt', 'desc'), limit(50));
  
  const snapshot = await getDocs(q);
  const sessions: JournalSession[] = [];
  snapshot.forEach((d) => {
    sessions.push(d.data() as JournalSession);
  });
  return sessions;
}

export async function deleteSession(userId: string, sessionId: string): Promise<void> {
  if (!userId || !sessionId) return;
  
  // 1. Delete all interactions linked to this session
  const interactionsRef = collection(db, 'users', userId, 'interactions');
  const q = query(interactionsRef, where('sessionId', '==', sessionId));
  const snapshot = await getDocs(q);
  
  const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletePromises);

  // 2. Delete the session document itself
  const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
  await deleteDoc(sessionRef);
}

export async function saveInteraction(userId: string, interaction: JournalInteraction): Promise<void> {
  if (!userId || !interaction.id || !interaction.sessionId) {
    throw new Error('User ID, Session ID, and Interaction ID are mandatory for storage.');
  }
  const interactionRef = doc(db, 'users', userId, 'interactions', interaction.id);

  const payload = {
    id: interaction.id,
    userId: userId,
    sessionId: interaction.sessionId,
    userPrompt: interaction.userPrompt,
    geminiResponse: interaction.geminiResponse,
    createdAt: interaction.createdAt || Date.now(),
    updatedAt: Date.now(),
    ...(interaction.summary ? { summary: interaction.summary } : {}),
    ...(interaction.mood ? { mood: interaction.mood } : {}),
    ...(interaction.tags && interaction.tags.length > 0 ? { tags: interaction.tags } : {}),
  };

  await setDoc(interactionRef, payload, { merge: true });
}

export async function getInteractions(userId: string, sessionId: string): Promise<JournalInteraction[]> {
  if (!userId || !sessionId) return [];
  const interactionsRef = collection(db, 'users', userId, 'interactions');
  const q = query(
    interactionsRef,
    where('sessionId', '==', sessionId),
    orderBy('createdAt', 'asc'),
    limit(100)
  );

  const snapshot = await getDocs(q);
  const interactions: JournalInteraction[] = [];
  snapshot.forEach((d) => {
    interactions.push(d.data() as JournalInteraction);
  });
  return interactions;
}

export async function deleteInteraction(userId: string, interactionId: string): Promise<void> {
  if (!userId || !interactionId) return;
  const interactionRef = doc(db, 'users', userId, 'interactions', interactionId);
  await deleteDoc(interactionRef);
}
