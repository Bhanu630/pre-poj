"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User } from "firebase/auth"
import { onAuthChange } from "./auth"
import { getUser, UserDoc } from "./firestore"

interface AuthContextType {
  user: User | null
  userDoc: UserDoc | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, userDoc: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const doc = await getUser(firebaseUser.uid)
        setUserDoc(doc)
      } else {
        setUserDoc(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  if (loading) return null

  return (
    <AuthContext.Provider value={{ user, userDoc, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
