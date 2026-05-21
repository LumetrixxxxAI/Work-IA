import React, { useState, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackHeader } from '../components/BackHeader'
import { LengthPills } from '../components/LengthPills'
import { UploadZone, SelectedFile } from '../components/UploadZone'
import { ResultBox } from '../components/ResultBox'
import { generarResumen, ResumenResponse } from '../services/api'
import { saveToHistorial } from '../services/historial'
import { useUser } from '../hooks/useUser'
import { colors } from '../theme/colors'

const LENGTH_OPTIONS = [
  { value: 'corto', label: 'Corto' },
  { value: 'medio', label: 'Medio' },
  { value: 'extenso', label: 'Extenso' },
]

const LABEL: CSSProperties = {
  fontSize: 12, fontWeight: 600, color: colors.blue200,
  textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, display: 'block',
}

const SECTION: CSSProperties = { marginBottom: 20 }

export function ResumenScreen() {
  const [longitud, setLongitud] = useState<'corto' | 'medio' | 'extenso'>('medio')
  const [file, setFile] = useState<SelectedFile | null>(null)
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResumenResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()
  const navigate = useNavigate()

  const handleGenerar = async () => {
    if (!texto.trim() && !file) { setError('Escribe o pega texto, o sube un archivo.'); return }
    setLoading(true); setResult(null); setError(null)
    try {
      const res = await generarResumen({
        texto: texto.trim(),
        fileBase64: file?.base64,
        fileType: file?.type,
        longitud,
        curso: user?.curso,
      })
      setResult(res)
      await saveToHistorial({
        tipo: 'resumen',
        contenidoOriginal: texto.trim().slice(0, 500) || file?.name || '',
        resultado: res.resumen.slice(0, 1000),
        parametros: { longitud },
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
      <BackHeader title="Resumen" subtitle="Genera resúmenes con IA" accentColor="#60A5FA" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 48px' }}>

        <div style={SECTION}>
          <span style={LABEL}>Longitud</span>
          <LengthPills options={LENGTH_OPTIONS} selected={longitud} onSelect={(v) => setLongitud(v as typeof longitud)} />
        </div>

        <div style={SECTION}>
          <span style={LABEL}>Archivo (opcional)</span>
          <UploadZone file={file} onFileSelect={setFile} onClear={() => setFile(null)} />
        </div>

        <div style={SECTION}>
          <span style={LABEL}>Texto</span>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Pega aquí el texto a resumir..."
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
            width: '100%', backgroundColor: colors.blue600, color: colors.white,
            padding: 16, borderRadius: 14, fontSize: 16, fontWeight: 700,
            opacity: loading ? 0.6 : 1, marginBottom: 20,
          }}
        >
          {loading ? '⏳ Generando...' : '✨ Generar resumen'}
        </button>

        {result && <ResultBox content={result.resumen} tokensUsados={result.tokensUsados} />}
      </div>
    </div>
  )
}
