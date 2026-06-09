import React, { useState, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackHeader } from '../components/BackHeader'
import { UploadZone, SelectedFile } from '../components/UploadZone'
import { LengthPills } from '../components/LengthPills'
import { TraductorViewer } from '../components/TraductorViewer'
import { generarTraduccion } from '../services/api'
import { saveToHistorial } from '../services/historial'
import { useUser } from '../hooks/useUser'
import { colors } from '../theme/colors'

type Idioma = 'Español' | 'Inglés' | 'Francés'
type Nivel  = 'A1' | 'B1' | 'C1' | 'Nativo'

const IDIOMA_OPTIONS = [
  { value: 'Español', name: 'Español', flag: 'https://flagcdn.com/w40/es.png' },
  { value: 'Inglés',  name: 'Inglés',  flag: 'https://flagcdn.com/w40/gb.png' },
  { value: 'Francés', name: 'Francés', flag: 'https://flagcdn.com/w40/fr.png' },
]

const NIVEL_OPTIONS = [
  { value: 'A1',     label: 'A1 — Básico'     },
  { value: 'B1',     label: 'B1 — Intermedio' },
  { value: 'C1',     label: 'C1 — Avanzado'   },
  { value: 'Nativo', label: 'Nativo'           },
]

const ACCENT = '#0D9488'

const LABEL: CSSProperties = {
  fontSize: 12, fontWeight: 600, color: ACCENT,
  textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, display: 'block',
}
const SECTION: CSSProperties = { marginBottom: 20 }

function TraductorContent() {
  const [texto, setTexto]   = useState('')
  const [file, setFile]     = useState<SelectedFile | null>(null)
  const [idioma, setIdioma] = useState<Idioma>('Inglés')
  const [nivel, setNivel]   = useState<Nivel>('B1')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const { user } = useUser()
  const navigate = useNavigate()

  const handleTraducir = async () => {
    if (!texto.trim() && !file) { setError('Pega el texto o sube un archivo.'); return }
    setLoading(true); setResult(null); setError(null)
    try {
      const res = await generarTraduccion({
        texto: texto.trim(),
        fileBase64: file?.base64,
        fileType: file?.type,
        idioma,
        nivel,
        curso: user?.curso,
      })
      setResult(res.traduccion)
      await saveToHistorial({
        tipo: 'traductor',
        contenidoOriginal: texto.trim().slice(0, 500) || file?.name || '',
        resultado: res.traduccion.slice(0, 1000),
        parametros: { idioma, nivel },
      })
    } catch (e: unknown) {
      if ((e as any)?.isLimit) { navigate('/paywall'); return }
      setError(e instanceof Error ? e.message : 'Error al traducir. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 48px' }}>

      {/* Idioma destino */}
      <div style={SECTION}>
        <span style={LABEL}>Traducir a</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {IDIOMA_OPTIONS.map(opt => {
            const active = idioma === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setIdioma(opt.value as Idioma)}
                style={{
                  flex: 1, padding: '14px 4px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: active ? `${ACCENT}33` : 'rgba(255,255,255,0.07)',
                  outline: active ? `2px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.12)',
                  transition: 'all 0.15s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}
              >
                <img src={opt.flag} alt={opt.name} style={{ width: 36, height: 24, borderRadius: 4, objectFit: 'cover' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: active ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                  {opt.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Nivel */}
      <div style={SECTION}>
        <span style={LABEL}>Nivel del texto</span>
        <LengthPills
          options={NIVEL_OPTIONS}
          selected={nivel}
          onSelect={v => setNivel(v as Nivel)}
          accentColor={ACCENT}
        />
      </div>

      {/* Archivo */}
      <div style={SECTION}>
        <span style={LABEL}>Archivo (opcional)</span>
        <UploadZone file={file} onFileSelect={setFile} onClear={() => setFile(null)} />
      </div>

      {/* Texto */}
      <div style={SECTION}>
        <span style={LABEL}>Texto a traducir</span>
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          placeholder="Pega aquí el texto que quieres traducir..."
          rows={6}
          style={{
            width: '100%', backgroundColor: colors.glass, border: `1px solid ${colors.glassBorder}`,
            borderRadius: 14, padding: 14, color: colors.white, fontSize: 14, lineHeight: 1.6,
            resize: 'vertical', boxSizing: 'border-box',
          }}
        />
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '10px 14px', fontSize: 13, color: colors.error, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleTraducir}
        disabled={loading}
        style={{
          width: '100%', backgroundColor: '#042f2e', color: colors.white,
          padding: 16, borderRadius: 14, fontSize: 16, fontWeight: 700,
          opacity: loading ? 0.6 : 1, marginBottom: 24,
          border: `1px solid ${ACCENT}`,
        }}
      >
        {loading ? '⏳ Traduciendo...' : '🌐 Traducir'}
      </button>

      {result && (
        <TraductorViewer
          content={result}
          idioma={idioma.toLowerCase()}
          nivel={nivel}
          textoOriginal={texto || (file?.name ?? '')}
        />
      )}
    </div>
  )
}

export function TraductorScreen() {
  const bg: CSSProperties = {
    minHeight: '100dvh',
    background: 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)',
    display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto',
  }
  return (
    <div style={bg}>
      <BackHeader title="Traductor académico" subtitle="Traduce apuntes y textos con precisión" accentColor={ACCENT} />
      <TraductorContent />
    </div>
  )
}
