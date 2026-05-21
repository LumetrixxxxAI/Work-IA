import React, { useState, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackHeader } from '../components/BackHeader'
import { LengthPills } from '../components/LengthPills'
import { UploadZone, SelectedFile } from '../components/UploadZone'
import { ResultBox } from '../components/ResultBox'
import { explicarClase, ClaseResponse } from '../services/api'
import { saveToHistorial } from '../services/historial'
import { useUser } from '../hooks/useUser'
import { colors } from '../theme/colors'

const NIVEL_OPTIONS = [
  { value: 'sencillo', label: 'Sencillo' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'extenso', label: 'Extenso' },
]

const LABEL: CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#10B981',
  textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, display: 'block',
}
const SECTION: CSSProperties = { marginBottom: 20 }

export function ClaseScreen() {
  const [nivel, setNivel] = useState('intermedio')
  const [file, setFile] = useState<SelectedFile | null>(null)
  const [tema, setTema] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ClaseResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()
  const navigate = useNavigate()

  const handleGenerar = async () => {
    if (!tema.trim() && !file) { setError('Escribe un tema o sube un archivo.'); return }
    setLoading(true); setResult(null); setError(null)
    try {
      const res = await explicarClase({
        tema: tema.trim(),
        fileBase64: file?.base64,
        fileType: file?.type,
        nivel,
        curso: user?.curso,
      })
      setResult(res)
      await saveToHistorial({
        tipo: 'clase',
        contenidoOriginal: tema.trim().slice(0, 500) || file?.name || '',
        resultado: res.explicacion.slice(0, 1000),
        parametros: { nivel },
      })
    } catch (e: unknown) {
      if ((e as any)?.isLimit) { navigate('/paywall'); return }
      setError(e instanceof Error ? e.message : 'Error al explicar. Inténtalo de nuevo.')
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
      <BackHeader title="Clase" subtitle="Explicaciones personalizadas" accentColor="#10B981" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 48px' }}>

        <div style={SECTION}>
          <span style={LABEL}>Nivel de explicación</span>
          <LengthPills options={NIVEL_OPTIONS} selected={nivel} onSelect={setNivel} accentColor="#10B981" />
        </div>

        <div style={SECTION}>
          <span style={LABEL}>Archivo (opcional)</span>
          <UploadZone file={file} onFileSelect={setFile} onClear={() => setFile(null)} />
        </div>

        <div style={SECTION}>
          <span style={LABEL}>Tema o pregunta</span>
          <textarea
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            placeholder="Ej: Las guerras napoleónicas, La fotosíntesis, Derivadas..."
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
            width: '100%', backgroundColor: '#065F46', color: colors.white,
            padding: 16, borderRadius: 14, fontSize: 16, fontWeight: 700,
            opacity: loading ? 0.6 : 1, marginBottom: 20,
            border: '1px solid #10B981',
          }}
        >
          {loading ? '⏳ Explicando...' : '🎓 Explicar tema'}
        </button>

        {result && <ResultBox content={result.explicacion} tokensUsados={result.tokensUsados} />}
      </div>
    </div>
  )
}
