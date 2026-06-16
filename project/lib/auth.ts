// lib/auth.ts

import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth"
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore"
import type { UserRole } from "./firestore"
import { sanitizeData } from "./sanitize"

// ─────────────────────────────────────────────
// Register a new user
// Creates a record in /users/{uid}
// If role === "organization", also creates /organizations/{uid}
// ─────────────────────────────────────────────
export async function registerUser(
  email: string,
  password: string,
  role: UserRole,
  name: string
) {
  const cred = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )

  const uid = cred.user.uid

  // Create user profile
  await setDoc(
    doc(db, "users", uid),
    sanitizeData({
      uid,
      email,
      name,
      role,
      createdAt: serverTimestamp(),
    })
  )

  // Create organization profile if needed
  if (role === "organization") {
    await setDoc(
      doc(db, "organizations", uid),
      sanitizeData({
        uid,
        organizationName: name,
        email,
        phone: "",
        address: "",
        description: "",
        category: "",
        createdAt: serverTimestamp(),
        status: "pending", // pending | active | rejected
      })
    )
  }

  return cred.user
}

// ─────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────
export async function loginUser(
  email: string,
  password: string
) {
  return signInWithEmailAndPassword(auth, email, password)
}

// ─────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────
export async function logoutUser() {
  return signOut(auth)
}

// ─────────────────────────────────────────────
// Get user role from Firestore
// ─────────────────────────────────────────────
export async function getUserRole(
  uid: string
): Promise<UserRole | null> {
  const snap = await getDoc(doc(db, "users", uid))

  return snap.exists()
    ? (snap.data().role as UserRole)
    : null
}

// ─────────────────────────────────────────────
// Auth state observer
// Returns unsubscribe function
// ─────────────────────────────────────────────
export function onAuthChange(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback)
}

// ─────────────────────────────────────────────
// Get redirect path based on role after login
// ─────────────────────────────────────────────
export function getRedirectPath(
  role: UserRole
): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard"

    case "organization":
      return "/org/dashboard"

    case "donor":
    default:
      return "/donor/dashboard"
  }
}