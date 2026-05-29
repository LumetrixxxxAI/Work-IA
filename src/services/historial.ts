import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import { getCurrentUser } from './auth'

type TipoHistorial = 'resumen' | 'ejercicios' | 'clase' | 'examen' | 'comentario' | 'esquema' | 'flashcards' | 'corrector'

interface HistorialEntry {
  tipo: TipoHistorial
  contenidoOriginal: string
  resultado: string
  parametros: Record<string, unknown>
}

export async function saveToHistorial(entry: HistorialEntry): Promise<void> {
  const user = getCurrentUser()
  if (!user) return

  const colRef = collection(db, 'historial', user.uid, 'items')
  await addDoc(colRef, {
    ...entry,
    fecha: serverTimestamp(),
  })
}
