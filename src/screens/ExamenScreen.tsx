import React, { useState, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackHeader } from '../components/BackHeader'
import { LengthPills } from '../components/LengthPills'
import { ResultBox } from '../components/ResultBox'
import { generarExamen, ExamenResponse } from '../services/api'
import { saveToHistorial } from '../services/historial'
import { useUser } from '../hooks/useUser'
import { colors } from '../theme/colors'

const TIPO_OPTIONS = [
  { value: 'test', label: 'Test' },
  { value: 'desarrollo', label: 'Desarrollo' },
  { value: 'mixto', label: 'Mixto' },
]

const NUM_OPTIONS = [
  { value: '5', label: '5 preg.' },
  { value: '10', label: '10 preg.' },
  { value: '20', label: '20 preg.' },
]

const LABEL: CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#F59E0B',
  textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, display: 'block',
}
const SECTION: CSSProperties = { marginBottom: 20 }

export function ExamenScreen() {
  const [tipo, setTipo] = useState<'test' | 'desarrollo' | 'mixto'>('mixto')
  const [numPreguntas, setNumPreguntas] = useState('10')
  const [tema, setTema] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ExamenResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()
  const navigate = useNavigate()

  const handleGenerar = async () => {
    if (!tema.trim()) { setError('Escribe el tema del examen.'); return }
    setLoading(true); setResult(null); setError(null)
    try {
      const res = await generarExamen({
        tema: tema.trim(),
        numPreguntas: parseInt(numPreguntas),
        tipo,
        curso: user?.curso,
      })
      setResult(res)
      await saveToHistorial({
        tipo: 'examen',
        contenidoOriginal: tema.trim().slice(0, 500),
        resultado: res.preguntas.slice(0, 1000),
        parametros: { tipo, numPreguntas },
      })
    } catch (e: unknown) {
      if ((e as any)?.isLimit) { navigate('/paywall'); return }
      setError(e instanceof Error ? e.message : 'Error al generar. Inténtalo de nuevo.')
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
      <BackHeader title="Examen" subtitle="Genera preguntas de examen" accentColor="#F59E0B" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 48px' }}>

        <div style={SECTION}>
          <span style={LABEL}>Tipo de preguntas</span>
          <LengthPills options={TIPO_OPTIONS} selected={tipo} onSelect={(v) => setTipo(v as typeof tipo)} accentColor="#F59E0B" />
        </div>

        <div style={SECTION}>
          <span style={LABEL}>Número de preguntas</span>
          <LengthPills options={NUM_OPTIONS} selected={numPreguntas} onSelect={setNumPreguntas} accentColor="#F59E0B" />
        </div>

        <div style={SECTION}>
          <span style={LABEL}>Tema del examen</span>
          <textarea
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            placeholder="Ej: La Primera Guerra Mundial, Los ecosistemas, Álgebra lineal..."
            rows={4}
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
            width: '100%', backgroundColor: '#92400E', color: colors.white,
            padding: 16, borderRadius: 14, fontSize: 16, fontWeight: 700,
            opacity: loading ? 0.6 : 1, marginBottom: 20,
            border: '1px solid #F59E0B',
          }}
        >
          {loading ? '⏳ Generando...' : '📋 Generar examen'}
        </button>

        {result && (
          <ResultBox
            content={result.preguntas}
            tokensUsados={result.tokensUsados}
            label={`${result.numPreguntas} preguntas · ${result.tipo}`}
          />
        )}
      </div>
    </div>
  )
}
