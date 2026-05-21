import React, { useState, CSSProperties } from 'react'
import { BackHeader } from '../components/BackHeader'
import { LengthPills } from '../components/LengthPills'
import { ResultBox } from '../components/ResultBox'
import { ProGate } from '../components/ProGate'
import { corregirRedaccion, CorrectorResponse } from '../services/api'
import { saveToHistorial } from '../services/historial'
import { useUser } from '../hooks/useUser'
import { colors } from '../theme/colors'

const MODO_OPTIONS = [
  { value: 'corregir', label: 'Corregir' },
  { value: 'mejorar', label: 'Mejorar' },
  { value: 'ambos', label: 'Ambos' },
]

const LABEL: CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#0F766E',
  textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, display: 'block',
}
const SECTION: CSSProperties = { marginBottom: 20 }

function CorrectorContent() {
  const [modo, setModo] = useState<'corregir' | 'mejorar' | 'ambos'>('ambos')
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CorrectorResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()

  const handleGenerar = async () => {
    if (!texto.trim()) { setError('Escribe o pega tu redacción.'); return }
    setLoading(true); setResult(null); setError(null)
    try {
      const res = await corregirRedaccion({
        texto: texto.trim(),
        modo,
        curso: user?.curso,
      })
      setResult(res)
      await saveToHistorial({
        tipo: 'corrector',
        contenidoOriginal: texto.trim().slice(0, 500),
        resultado: res.resultado.slice(0, 1000),
        parametros: { modo },
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al corregir. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 48px' }}>
      <div style={SECTION}>
        <span style={LABEL}>Modo</span>
        <LengthPills options={MODO_OPTIONS} selected={modo} onSelect={(v) => setModo(v as typeof modo)} accentColor="#0F766E" />
      </div>

      <div style={SECTION}>
        <span style={LABEL}>Tu redacción</span>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe o pega aquí tu redacción para corregirla..."
          rows={10}
          style={{
            width: '100%', backgroundColor: colors.glass, border: `1px solid ${colors.glassBorder}`,
            borderRadius: 14, padding: 14, color: colors.white, fontSize: 14, lineHeight: 1.6,
            resize: 'vertical', boxSizing: 'border-box',
          }}
        />
        <p style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>
          {texto.length} caracteres
        </p>
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
          width: '100%', backgroundColor: '#134E4A', color: colors.white,
          padding: 16, borderRadius: 14, fontSize: 16, fontWeight: 700,
          opacity: loading ? 0.6 : 1, marginBottom: 20,
          border: '1px solid #0F766E',
        }}
      >
        {loading ? '⏳ Corrigiendo...' : '✏️ Corregir redacción'}
      </button>

      {result && (
        <ResultBox
          content={result.resultado}
          tokensUsados={result.tokensUsados}
          label={result.erroresEncontrados > 0 ? `${result.erroresEncontrados} correcciones` : 'Resultado'}
        />
      )}
    </div>
  )
}

export function CorrectorScreen() {
  const bg: CSSProperties = {
    minHeight: '100dvh',
    background: 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)',
    display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto',
  }
  return (
    <div style={bg}>
      <BackHeader title="Corrector" subtitle="Corrige y mejora tus redacciones" accentColor="#0F766E" />
      <ProGate><CorrectorContent /></ProGate>
    </div>
  )
}
