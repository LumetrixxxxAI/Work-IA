import axios, { AxiosInstance } from 'axios'
import { getIdToken } from './auth'

// Siempre usar misma origen — API está en el mismo dominio (Vercel)
const BASE_URL = ''

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 90000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  } catch {
    // no-op
  }
  return config
})

// Interceptor de respuesta: propagar errores de límite con flag especial
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429 && error.response?.data?.isLimit) {
      const limitError: any = new Error(error.response.data.error)
      limitError.isLimit = true
      return Promise.reject(limitError)
    }
    return Promise.reject(error)
  }
)

// --- RESUMEN ---
export interface ResumenParams {
  texto: string; fileBase64?: string; fileType?: string
  longitud: 'corto' | 'medio' | 'extenso'; curso?: string
}
export interface ResumenResponse { resumen: string; longitud: string; tokensUsados: number }
export async function generarResumen(p: ResumenParams): Promise<ResumenResponse> {
  const { data } = await apiClient.post<ResumenResponse>('/api/resumen', p)
  return data
}

// --- EJERCICIOS ---
export interface EjerciciosParams {
  texto: string; fileBase64?: string; fileType?: string
  nivel: 'basico' | 'detallado' | 'completo'; curso?: string
}
export interface EjerciciosResponse { solucion: string; ejerciciosEncontrados: number; tokensUsados: number }
export async function resolverEjercicios(p: EjerciciosParams): Promise<EjerciciosResponse> {
  const { data } = await apiClient.post<EjerciciosResponse>('/api/ejercicios', p)
  return data
}

// --- CLASE ---
export interface ClaseParams {
  tema: string; fileBase64?: string; fileType?: string
  nivel?: string; curso?: string
}
export interface ClaseResponse { explicacion: string; tokensUsados: number }
export async function explicarClase(p: ClaseParams): Promise<ClaseResponse> {
  const { data } = await apiClient.post<ClaseResponse>('/api/clase', p)
  return data
}

// --- EXAMEN ---
export interface ExamenParams {
  tema: string; numPreguntas: number
  tipo: 'test' | 'desarrollo' | 'mixto'; curso?: string
}
export interface ExamenResponse { preguntas: string; numPreguntas: number; tipo: string; tokensUsados: number }
export async function generarExamen(p: ExamenParams): Promise<ExamenResponse> {
  const { data } = await apiClient.post<ExamenResponse>('/api/examen', p)
  return data
}

// --- COMENTARIO ---
export interface ComentarioParams {
  texto: string; fileBase64?: string; fileType?: string
  tipo: 'literario' | 'filosofico' | 'historico'
  nivel: 'basico' | 'completo'; curso?: string
}
export interface ComentarioResponse { comentario: string; tipo: string; tokensUsados: number }
export async function comentarTexto(p: ComentarioParams): Promise<ComentarioResponse> {
  const { data } = await apiClient.post<ComentarioResponse>('/api/comentario', p)
  return data
}

// --- ESQUEMA ---
export interface EsquemaParams {
  texto: string; fileBase64?: string; fileType?: string
  tipo: 'esquema' | 'mapa' | 'tabla'; curso?: string
}
export interface EsquemaResponse { esquema: string; tokensUsados: number }
export async function generarEsquema(p: EsquemaParams): Promise<EsquemaResponse> {
  const { data } = await apiClient.post<EsquemaResponse>('/api/esquema', p)
  return data
}

// --- FLASHCARDS ---
export interface FlashcardsParams {
  texto: string; fileBase64?: string; fileType?: string
  num: number; curso?: string
}
export interface FlashcardsResponse { flashcards: string; tokensUsados: number }
export async function generarFlashcards(p: FlashcardsParams): Promise<FlashcardsResponse> {
  const { data } = await apiClient.post<FlashcardsResponse>('/api/flashcards', p)
  return data
}

// --- CORRECTOR ---
export interface CorrectorParams { texto: string; modo: 'corregir' | 'mejorar' | 'ambos'; curso?: string }
export interface CorrectorResponse { resultado: string; erroresEncontrados: number; tokensUsados: number }
export async function corregirRedaccion(p: CorrectorParams): Promise<CorrectorResponse> {
  const { data } = await apiClient.post<CorrectorResponse>('/api/corrector', p)
  return data
}

// --- TRADUCTOR ---
export interface TraduccionParams {
  texto: string; fileBase64?: string; fileType?: string
  idioma: string; nivel: string; curso?: string
}
export interface TraduccionResponse { traduccion: string; tokensUsados: number }
export async function generarTraduccion(p: TraduccionParams): Promise<TraduccionResponse> {
  const { data } = await apiClient.post<TraduccionResponse>('/api/traductor', p)
  return data
}

// --- TIMELINE ---
export interface TimelineParams { tema: string; fileBase64?: string; fileType?: string; detalle?: 'resumido' | 'mixto' | 'extenso'; curso?: string }
export interface TimelineResponse { timeline: string; tokensUsados: number }
export async function generarTimeline(p: TimelineParams): Promise<TimelineResponse> {
  const { data } = await apiClient.post<TimelineResponse>('/api/timeline', p)
  return data
}

// --- HISTORIAL ---
export interface HistorialItem {
  id: string; tipo: string; contenidoOriginal: string
  resultado: string; fecha: { seconds: number; nanoseconds: number }
  parametros: Record<string, unknown>
}
export async function obtenerHistorial(): Promise<HistorialItem[]> {
  const { data } = await apiClient.get<HistorialItem[]>('/api/historial')
  return data
}
export async function borrarHistorialItem(itemId: string): Promise<void> {
  await apiClient.delete(`/api/historial/${itemId}`)
}

// --- USAGE ---
export interface UsageInfo {
  isPro: boolean
  dailyCount: number
  dailyLimit: number | null
  monthlyCount: number
  monthlyLimit: number
}
export async function getUsage(): Promise<UsageInfo> {
  const { data } = await apiClient.get<UsageInfo>('/api/usage')
  return data
}
