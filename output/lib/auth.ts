// lib/auth.ts
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import type { UserRole } from "./firestore";

// ─────────────────────────────────────────────
// Register a new user
// ─────────────────────────────────────────────
export async function registerUser(
  email: string,
  password: string,
  role: UserRole,
  name: string
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    email,
    name,
    role,
    createdAt: new Date(),
  });
  return cred.user;
}

// ─────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────
export async function loginUser(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

// ─────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────
export async function logoutUser() {
  return signOut(auth);
}

// ─────────────────────────────────────────────
// Get user role from Firestore
// ─────────────────────────────────────────────
export async function getUserRole(uid: string): Promise<UserRole | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data().role as UserRole) : null;
}

// ─────────────────────────────────────────────
// Auth state observer — use in layout or context
// Returns unsubscribe function
// ─────────────────────────────────────────────
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ─────────────────────────────────────────────
// Get redirect path based on role after login
// ─────────────────────────────────────────────
export function getRedirectPath(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "organization":
      return "/org/dashboard";
    case "donor":
    default:
      return "/donor/dashboard";
  }
}
