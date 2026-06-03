import React, { useState, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackHeader } from '../components/BackHeader'
import { LengthPills } from '../components/LengthPills'
import { UploadZone, SelectedFile } from '../components/UploadZone'
import { FlashcardViewer } from '../components/FlashcardViewer'
import { ProGate } from '../components/ProGate'
import { generarFlashcards, FlashcardsResponse } from '../services/api'
import { saveToHistorial } from '../services/historial'
import { useUser } from '../hooks/useUser'
import { colors } from '../theme/colors'

const NUM_OPTIONS = [
  { value: '10', label: '10 tarjetas' },
  { value: '20', label: '20 tarjetas' },
  { value: '30', label: '30 tarjetas' },
]

const LABEL: CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#6D28D9',
  textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, display: 'block',
}
const SECTION: CSSProperties = { marginBottom: 20 }

function FlashcardsContent() {
  const [num, setNum] = useState('20')
  const [file, setFile] = useState<SelectedFile | null>(null)
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<FlashcardsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()
  const navigate = useNavigate()

  const handleGenerar = async () => {
    if (!texto.trim() && !file) { setError('Pega el texto o sube un archivo.'); return }
    setLoading(true); setResult(null); setError(null)
    try {
      const res = await generarFlashcards({
        texto: texto.trim(),
        fileBase64: file?.base64,
        fileType: file?.type,
        num: parseInt(num),
        curso: user?.curso,
      })
      setResult(res)
      await saveToHistorial({
        tipo: 'flashcards',
        contenidoOriginal: texto.trim().slice(0, 500) || file?.name || '',
        resultado: res.flashcards.slice(0, 1000),
        parametros: { num },
      })
    } catch (e: unknown) {
      if ((e as any)?.isLimit) { navigate('/paywall'); return }
      setError(e instanceof Error ? e.message : 'Error al generar. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 48px' }}>
      <div style={SECTION}>
        <span style={LABEL}>Número de tarjetas</span>
        <LengthPills options={NUM_OPTIONS} selected={num} onSelect={setNum} accentColor="#6D28D9" />
      </div>

      <div style={SECTION}>
        <span style={LABEL}>Archivo (opcional)</span>
        <UploadZone file={file} onFileSelect={setFile} onClear={() => setFile(null)} />
      </div>

      <div style={SECTION}>
        <span style={LABEL}>Contenido para las flashcards</span>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Pega aquí el texto del que quieres crear tarjetas..."
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
          width: '100%', backgroundColor: '#4C1D95', color: colors.white,
          padding: 16, borderRadius: 14, fontSize: 16, fontWeight: 700,
          opacity: loading ? 0.6 : 1, marginBottom: 20,
          border: '1px solid #6D28D9',
        }}
      >
        {loading ? '⏳ Generando...' : '🃏 Crear flashcards'}
      </button>

      {result && <FlashcardViewer content={result.flashcards} tokensUsados={result.tokensUsados} />}
    </div>
  )
}

export function FlashcardsScreen() {
  const bg: CSSProperties = {
    minHeight: '100dvh',
    background: 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)',
    display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto',
  }
  return (
    <div style={bg}>
      <BackHeader title="Flashcards" subtitle="Tarjetas de memorización" accentColor="#6D28D9" />
      <ProGate><FlashcardsContent /></ProGate>
    </div>
  )
}
