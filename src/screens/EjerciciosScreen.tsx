import React, { useState, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackHeader } from '../components/BackHeader'
import { LengthPills } from '../components/LengthPills'
import { UploadZone, SelectedFile } from '../components/UploadZone'
import { ResultBox } from '../components/ResultBox'
import { resolverEjercicios, EjerciciosResponse } from '../services/api'
import { saveToHistorial } from '../services/historial'
import { useUser } from '../hooks/useUser'
import { colors } from '../theme/colors'

const NIVEL_OPTIONS = [
  { value: 'basico', label: 'Básico' },
  { value: 'detallado', label: 'Detallado' },
  { value: 'completo', label: 'Completo' },
]

const LABEL: CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#A78BFA',
  textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, display: 'block',
}
const SECTION: CSSProperties = { marginBottom: 20 }

export function EjerciciosScreen() {
  const [nivel, setNivel] = useState<'basico' | 'detallado' | 'completo'>('detallado')
  const [file, setFile] = useState<SelectedFile | null>(null)
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EjerciciosResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()
  const navigate = useNavigate()

  const handleGenerar = async () => {
    if (!texto.trim() && !file) { setError('Escribe o pega los ejercicios, o sube un archivo.'); return }
    setLoading(true); setResult(null); setError(null)
    try {
      const res = await resolverEjercicios({
        texto: texto.trim(),
        fileBase64: file?.base64,
        fileType: file?.type,
        nivel,
        curso: user?.curso,
      })
      setResult(res)
      await saveToHistorial({
        tipo: 'ejercicios',
        contenidoOriginal: texto.trim().slice(0, 500) || file?.name || '',
        resultado: res.solucion.slice(0, 1000),
        parametros: { nivel },
      })
    } catch (e: unknown) {
      if ((e as any)?.isLimit) { navigate('/paywall'); return }
      setError(e instanceof Error ? e.message : 'Error al resolver. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const bg: CSSProperties = {
    minHeight: '100dvh',
    background: 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)',
    display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto',
  }

  return (
    <div style={bg}>
      <BackHeader title="Ejercicios" subtitle="Resuelve ejercicios con IA" accentColor="#A78BFA" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 48px' }}>

        <div style={SECTION}>
          <span style={LABEL}>Nivel de detalle</span>
          <LengthPills options={NIVEL_OPTIONS} selected={nivel} onSelect={(v) => setNivel(v as typeof nivel)} accentColor="#A78BFA" />
        </div>

        <div style={SECTION}>
          <span style={LABEL}>Archivo (opcional)</span>
          <UploadZone file={file} onFileSelect={setFile} onClear={() => setFile(null)} />
        </div>

        <div style={SECTION}>
          <span style={LABEL}>Ejercicios</span>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Pega aquí los ejercicios a resolver..."
            rows={6}
            style={{
              width: '100%', backgroundColor: colors.glass, border: `1px solid ${colors.glassBorder}`,
              borderRadius: 14, padding: 14, color: colors.white, fontSize: 14, lineHeight: 1.6,
              resize: 'vertical', boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: colors.error, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGenerar}
          disabled={loading}
          style={{
            width: '100%', backgroundColor: '#7C3AED', color: colors.white,
            padding: 16, borderRadius: 14, fontSize: 16, fontWeight: 700,
            opacity: loading ? 0.6 : 1, marginBottom: 20,
          }}
        >
          {loading ? '⏳ Resolviendo...' : '🧮 Resolver ejercicios'}
        </button>

        {result && (
          <ResultBox
            content={result.solucion}
            tokensUsados={result.tokensUsados}
            label={`Solución · ${result.ejerciciosEncontrados} ejercicio(s)`}
          />
        )}
      </div>
    </div>
  )
}
