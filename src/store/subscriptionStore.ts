import { create } from 'zustand'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { getCurrentUser } from '../services/auth'

const ADMIN_EMAIL = 'jcocana2009@gmail.com'

interface SubscriptionStore {
  isPro: boolean
  isPremium: boolean
  isLoading: boolean
  checkPro: (uid: string, email?: string) => Promise<void>
  setPro: (value: boolean) => void
  refreshPro: () => Promise<void>
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  isPro: false,
  isPremium: false,
  isLoading: true,

  checkPro: async (uid: string, email?: string) => {
    set({ isLoading: true })
    try {
      if (email === ADMIN_EMAIL) {
        set({ isPro: true, isPremium: true })
        await setDoc(doc(db, 'users', uid), { isPro: true, isPremium: true }, { merge: true }).catch(() => {})
        return
      }
      const snap = await getDoc(doc(db, 'users', uid))
      const data = snap.data() ?? {}
      const isPremium = data.isPremium === true
      const isPro = data.isPro === true || isPremium
      set({ isPro, isPremium })
    } catch {
      set({ isPro: false, isPremium: false })
    } finally {
      set({ isLoading: false })
    }
  },

  setPro: (value) => set({ isPro: value }),

  refreshPro: async () => {
    const user = getCurrentUser()
    if (!user) return
    if (user.email === ADMIN_EMAIL) { set({ isPro: true, isPremium: true }); return }
    try {
      const snap = await getDoc(doc(db, 'users', user.uid))
      const data = snap.data() ?? {}
      const isPremium = data.isPremium === true
      const isPro = data.isPro === true || isPremium
      set({ isPro, isPremium })
    } catch {
      set({ isPro: false, isPremium: false })
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
