import React, { useState, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackHeader } from '../components/BackHeader'
import { LengthPills } from '../components/LengthPills'
import { UploadZone, SelectedFile } from '../components/UploadZone'
import { ComentarioViewer } from '../components/ComentarioViewer'
import { comentarTexto, ComentarioResponse } from '../services/api'
import { saveToHistorial } from '../services/historial'
import { useUser } from '../hooks/useUser'
import { colors } from '../theme/colors'

const TIPO_OPTIONS = [
  { value: 'literario', label: 'Literario' },
  { value: 'filosofico', label: 'Filosófico' },
  { value: 'historico', label: 'Histórico' },
]

const NIVEL_OPTIONS = [
  { value: 'basico', label: 'Básico' },
  { value: 'completo', label: 'Completo' },
]

const LABEL: CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#EC4899',
  textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, display: 'block',
}
const SECTION: CSSProperties = { marginBottom: 20 }

export function ComentarioScreen() {
  const [tipo, setTipo] = useState<'literario' | 'filosofico' | 'historico'>('literario')
  const [nivel, setNivel] = useState<'basico' | 'completo'>('completo')
  const [file, setFile] = useState<SelectedFile | null>(null)
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ComentarioResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()
  const navigate = useNavigate()

  const handleGenerar = async () => {
    if (!texto.trim() && !file) { setError('Pega el texto a comentar o sube un archivo.'); return }
    setLoading(true); setResult(null); setError(null)
    try {
      const res = await comentarTexto({
        texto: texto.trim(),
        fileBase64: file?.base64,
        fileType: file?.type,
        tipo,
        nivel,
        curso: user?.curso,
      })
      setResult(res)
      await saveToHistorial({
        tipo: 'comentario',
        contenidoOriginal: texto.trim().slice(0, 500) || file?.name || '',
        resultado: res.comentario.slice(0, 1000),
        parametros: { tipo, nivel },
      })
    } catch (e: unknown) {
      if ((e as any)?.isLimit) { navigate('/paywall'); return }
      setError(e instanceof Error ? e.message : 'Error al comentar. Inténtalo de nuevo.')
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
      <BackHeader title="Comentario de texto" subtitle="Análisis y comentario académico" accentColor="#EC4899" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 48px' }}>

        <div style={SECTION}>
          <span style={LABEL}>Tipo de texto</span>
          <LengthPills options={TIPO_OPTIONS} selected={tipo} onSelect={(v) => setTipo(v as typeof tipo)} accentColor="#EC4899" />
        </div>

        <div style={SECTION}>
          <span style={LABEL}>Nivel de análisis</span>
          <LengthPills options={NIVEL_OPTIONS} selected={nivel} onSelect={(v) => setNivel(v as typeof nivel)} accentColor="#EC4899" />
        </div>

        <div style={SECTION}>
          <span style={LABEL}>Archivo (opcional)</span>
          <UploadZone file={file} onFileSelect={setFile} onClear={() => setFile(null)} />
        </div>

        <div style={SECTION}>
          <span style={LABEL}>Texto a comentar</span>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Pega aquí el texto literario, filosófico o histórico..."
            rows={7}
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
            width: '100%', backgroundColor: '#9D174D', color: colors.white,
            padding: 16, borderRadius: 14, fontSize: 16, fontWeight: 700,
            opacity: loading ? 0.6 : 1, marginBottom: 20,
            border: '1px solid #EC4899',
          }}
        >
          {loading ? '⏳ Analizando...' : '✍️ Comentar texto'}
        </button>

        {result && <ComentarioViewer content={result.comentario} tokensUsados={result.tokensUsados} tipo={tipo} />}
      </div>
    </div>
  )
}
