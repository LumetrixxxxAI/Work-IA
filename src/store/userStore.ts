import { create } from 'zustand'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  nombre?: string
  fechaNacimiento?: string
  curso?: string
  createdAt?: number
}

interface UserStore {
  user: UserProfile | null
  isLoading: boolean
  hasAccess: boolean
  setUser: (user: UserProfile | null) => void
  setHasAccess: (hasAccess: boolean) => void
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  loadProfile: (uid: string) => Promise<void>
  clearUser: () => void
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  isLoading: false,
  hasAccess: false,

  setUser: (user) => set({ user }),

  setHasAccess: (hasAccess) => set({ hasAccess }),

  updateProfile: async (updates) => {
    const currentUser = get().user
    if (!currentUser) return

    const updated = { ...currentUser, ...updates }
    set({ user: updated })
    localStorage.setItem('userProfile', JSON.stringify(updated))

    const userRef = doc(db, 'users', currentUser.uid)
    await setDoc(userRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true })
  },

  loadProfile: async (uid) => {
    set({ isLoading: true })
    try {
      // Cache rápido desde localStorage
      const cached = localStorage.getItem('userProfile')
      if (cached) {
        const parsed = JSON.parse(cached) as UserProfile
        if (parsed.uid === uid) set({ user: parsed })
      }

      // Datos frescos desde Firestore
      const userRef = doc(db, 'users', uid)
      const snap = await getDoc(userRef)
      if (snap.exists()) {
        const profile = { uid, ...snap.data() } as UserProfile
        set({ user: profile })
        localStorage.setItem('userProfile', JSON.stringify(profile))
      }
    } catch (error) {
      console.error('Error cargando perfil:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  clearUser: () => {
    set({ user: null, hasAccess: false })
    localStorage.removeItem('userProfile')
  },
}))
