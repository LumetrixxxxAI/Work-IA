import {
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'

// Detectar iOS (iPhone/iPad)
export const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

// Detectar modo PWA standalone (añadida a pantalla de inicio)
export const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  || (window.navigator as { standalone?: boolean }).standalone === true

export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider()
  provider.addScope('email')
  provider.addScope('profile')
  provider.setCustomParameters({ prompt: 'select_account' })

  if (isStandalone && !isIOS) {
    // Android PWA: usa redirect (funciona correctamente)
    await signInWithRedirect(auth, provider)
  } else {
    // iOS PWA, iOS Safari, escritorio: popup
    // (en iOS el redirect causa bucle infinito en WKWebView)
    await signInWithPopup(auth, provider)
  }
}

export async function handleRedirectResult(): Promise<UserCredential | null> {
  try {
    return await getRedirectResult(auth)
  } catch (error) {
    console.error('Error en redirect:', error)
    return null
  }
}

export async function signOut(): Promise<void> {
  localStorage.removeItem('userProfile')
  await firebaseSignOut(auth)
}

export function getCurrentUser(): User | null {
  return auth.currentUser
}

export async function getIdToken(): Promise<string> {
  const user = auth.currentUser
  if (!user) throw new Error('No hay usuario autenticado')
  return user.getIdToken()
}

export async function checkUserAccess(email: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'allowedUsers', email)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return false
    return docSnap.data()?.active === true
  } catch {
    return false
  }
}

export async function requestAccess(email: string, displayName: string): Promise<void> {
  const docRef = doc(db, 'accessRequests', email)
  await setDoc(docRef, {
    email,
    displayName,
    requestedAt: serverTimestamp(),
    status: 'pending',
  })
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
