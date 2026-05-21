import React, { useState, CSSProperties } from 'react'
import { BackHeader } from '../components/BackHeader'
import { LengthPills } from '../components/LengthPills'
import { UploadZone, SelectedFile } from '../components/UploadZone'
import { ResultBox } from '../components/ResultBox'
import { ProGate } from '../components/ProGate'
import { generarEsquema, EsquemaResponse } from '../services/api'
import { saveToHistorial } from '../services/historial'
import { useUser } from '../hooks/useUser'
import { colors } from '../theme/colors'

const TIPO_OPTIONS = [
  { value: 'esquema', label: 'Esquema' },
  { value: 'mapa', label: 'Mapa conceptual' },
  { value: 'tabla', label: 'Tabla resumen' },
]

const LABEL: CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#0369A1',
  textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, display: 'block',
}
const SECTION: CSSProperties = { marginBottom: 20 }

function EsquemaContent() {
  const [tipo, setTipo] = useState<'esquema' | 'mapa' | 'tabla'>('esquema')
  const [file, setFile] = useState<SelectedFile | null>(null)
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EsquemaResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()

  const handleGenerar = async () => {
    if (!texto.trim() && !file) { setError('Pega el texto o sube un archivo.'); return }
    setLoading(true); setResult(null); setError(null)
    try {
      const res = await generarEsquema({
        texto: texto.trim(),
        fileBase64: file?.base64,
        fileType: file?.type,
        tipo,
        curso: user?.curso,
      })
      setResult(res)
      await saveToHistorial({
        tipo: 'esquema',
        contenidoOriginal: texto.trim().slice(0, 500) || file?.name || '',
        resultado: res.esquema.slice(0, 1000),
        parametros: { tipo },
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al generar. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 48px' }}>
      <div style={SECTION}>
        <span style={LABEL}>Formato</span>
        <LengthPills options={TIPO_OPTIONS} selected={tipo} onSelect={(v) => setTipo(v as typeof tipo)} accentColor="#0369A1" />
      </div>

      <div style={SECTION}>
        <span style={LABEL}>Archivo (opcional)</span>
        <UploadZone file={file} onFileSelect={setFile} onClear={() => setFile(null)} />
      </div>

      <div style={SECTION}>
        <span style={LABEL}>Contenido a esquematizar</span>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Pega aquí el texto para crear el esquema..."
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
          width: '100%', backgroundColor: '#0C4A6E', color: colors.white,
          padding: 16, borderRadius: 14, fontSize: 16, fontWeight: 700,
          opacity: loading ? 0.6 : 1, marginBottom: 20,
          border: '1px solid #0369A1',
        }}
      >
        {loading ? '⏳ Generando...' : '🗂️ Crear esquema'}
      </button>

      {result && <ResultBox content={result.esquema} tokensUsados={result.tokensUsados} />}
    </div>
  )
}

export function EsquemaScreen() {
  const bg: CSSProperties = {
    minHeight: '100dvh',
    background: 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)',
    display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto',
  }
  return (
    <div style={bg}>
      <BackHeader title="Esquema" subtitle="Mapas conceptuales y esquemas" accentColor="#0369A1" />
      <ProGate><EsquemaContent /></ProGate>
    </div>
  )
}
