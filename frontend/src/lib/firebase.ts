import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

function getValidApiKey(): string {
  const envVal = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  if (envVal && !envVal.toLowerCase().includes("dummy") && envVal.startsWith("AIzaSy")) {
    return envVal;
  }
  return "AIzaSyCKD44whQtqiG6ZuabiUkAEQOxED6WjGCs";
}

function getValidAuthDomain(): string {
  const envVal = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  if (envVal && !envVal.toLowerCase().includes("dummy") && !envVal.includes("paper2project.firebaseapp.com")) {
    return envVal;
  }
  return "dumpareviews.firebaseapp.com";
}

function getValidProjectId(): string {
  const envVal = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (envVal && !envVal.toLowerCase().includes("dummy") && envVal !== "paper2project") {
    return envVal;
  }
  return "dumpareviews";
}

function getValidStorageBucket(): string {
  const envVal = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  if (envVal && !envVal.toLowerCase().includes("dummy") && !envVal.includes("paper2project.appspot.com")) {
    return envVal;
  }
  return "dumpareviews.firebasestorage.app";
}

function getValidSenderId(): string {
  const envVal = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim();
  if (envVal && envVal !== "1234567890" && !envVal.toLowerCase().includes("dummy")) {
    return envVal;
  }
  return "760761023550";
}

function getValidAppId(): string {
  const envVal = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim();
  if (envVal && !envVal.includes("1234567890") && !envVal.toLowerCase().includes("dummy")) {
    return envVal;
  }
  return "1:760761023550:web:af2dfc07aaa8fdee03656f";
}

const firebaseConfig = {
  apiKey: getValidApiKey(),
  authDomain: getValidAuthDomain(),
  projectId: getValidProjectId(),
  storageBucket: getValidStorageBucket(),
  messagingSenderId: getValidSenderId(),
  appId: getValidAppId(),
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google sign in error:", error);
    throw error;
  }
}

export async function loginWithEmail(email: string, pass: string) {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function signupWithEmail(email: string, pass: string) {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function getCurrentIdToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return await currentUser.getIdToken();
}
