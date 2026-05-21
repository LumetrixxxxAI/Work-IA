import { create } from 'zustand'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { getCurrentUser } from '../services/auth'

const ADMIN_EMAIL = 'jcocana2009@gmail.com'

interface SubscriptionStore {
  isPro: boolean
  isLoading: boolean
  checkPro: (uid: string, email?: string) => Promise<void>
  setPro: (value: boolean) => void
  refreshPro: () => Promise<void>
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  isPro: false,
  isLoading: true,

  checkPro: async (uid: string, email?: string) => {
    set({ isLoading: true })
    try {
      // Admin siempre Pro
      if (email === ADMIN_EMAIL) {
        set({ isPro: true })
        // Sincronizar en Firestore
        await setDoc(doc(db, 'users', uid), { isPro: true }, { merge: true }).catch(() => {})
        return
      }
      // Leer desde Firestore
      const snap = await getDoc(doc(db, 'users', uid))
      set({ isPro: snap.exists() ? snap.data()?.isPro === true : false })
    } catch {
      set({ isPro: false })
    } finally {
      set({ isLoading: false })
    }
  },

  setPro: (value) => set({ isPro: value }),

  refreshPro: async () => {
    const user = getCurrentUser()
    if (!user) return
    if (user.email === ADMIN_EMAIL) { set({ isPro: true }); return }
    try {
      const snap = await getDoc(doc(db, 'users', user.uid))
      set({ isPro: snap.exists() ? snap.data()?.isPro === true : false })
    } catch {
      set({ isPro: false })
    }
  },
}))

export async function syncProToFirestore(isPro: boolean) {
  const user = getCurrentUser()
  if (!user) return
  await setDoc(
    doc(db, 'users', user.uid),
    { isPro, proUpdatedAt: serverTimestamp() },
    { merge: true }
  )
}
