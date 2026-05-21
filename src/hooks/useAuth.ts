import { useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthChange, handleRedirectResult } from '../services/auth'
import { db } from '../services/firebase'
import { useUserStore } from '../store/userStore'
import { useSubscriptionStore } from '../store/subscriptionStore'

export type AuthState = 'loading' | 'unauthenticated' | 'no-access' | 'authenticated'

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [authState, setAuthState] = useState<AuthState>('loading')
  const { setUser, setHasAccess, loadProfile, clearUser } = useUserStore()
  const { checkPro } = useSubscriptionStore()

  useEffect(() => {
    // Procesar resultado de redirect (cuando vuelven de Google)
    handleRedirectResult().catch(console.error)

    const unsubscribe = onAuthChange(async (user) => {
      if (!user) {
        clearUser()
        setFirebaseUser(null)
        setAuthState('unauthenticated')
        return
      }

      setFirebaseUser(user)
      setHasAccess(true)
      await Promise.all([
        loadProfile(user.uid),
        checkPro(user.uid, user.email ?? ''),
      ])

      // Actualizar último login
      setDoc(
        doc(db, 'users', user.uid),
        {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      ).catch(() => {})

      setAuthState('authenticated')
    })

    return unsubscribe
  }, [])

  return { firebaseUser, authState }
}
