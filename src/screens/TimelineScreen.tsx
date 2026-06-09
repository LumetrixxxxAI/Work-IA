import React, { useState, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackHeader } from '../components/BackHeader'
import { UploadZone, SelectedFile } from '../components/UploadZone'
import { TimelineViewer } from '../components/TimelineViewer'
import { generarTimeline } from '../services/api'
import { saveToHistorial } from '../services/historial'
import { useUser } from '../hooks/useUser'
import { colors } from '../theme/colors'

type Detalle = 'resumido' | 'mixto' | 'extenso'

const DETALLE_OPTIONS: { value: Detalle; label: string; desc: string }[] = [
  { value: 'resumido', label: 'Resumido',  desc: '3–5 eventos' },
  { value: 'mixto',    label: 'Mixto',     desc: '6–10 eventos' },
  { value: 'extenso',  label: 'Extenso',   desc: '12+ eventos' },
]

const LABEL: CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#7C3AED',
  textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, display: 'block',
}
const SECTION: CSSProperties = { marginBottom: 20 }

function TimelineContent() {
  const [tema, setTema] = useState('')
  const [file, setFile] = useState<SelectedFile | null>(null)
  const [detalle, setDetalle] = useState<Detalle>('mixto')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()
  const navigate = useNavigate()

  const handleGenerar = async () => {
    if (!tema.trim() && !file) { setError('Escribe un tema o sube un archivo.'); return }
    setLoading(true); setResult(null); setError(null)
    try {
      const res = await generarTimeline({
        tema: tema.trim(),
        fileBase64: file?.base64,
        fileType: file?.type,
        detalle,
        curso: user?.curso,
      })
      setResult(res.timeline)
      await saveToHistorial({
        tipo: 'timeline',
        contenidoOriginal: tema.trim() || file?.name || '',
        resultado: res.timeline.slice(0, 1000),
        parametros: { tema: tema.trim(), detalle },
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

      {/* Nivel de detalle */}
      <div style={SECTION}>
        <span style={LABEL}>Nivel de detalle</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {DETALLE_OPTIONS.map(opt => {
            const active = detalle === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setDetalle(opt.value)}
                style={{
                  flex: 1, padding: '10px 6px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: active ? 'linear-gradient(135deg,#5B21B6,#7C3AED)' : 'rgba(255,255,255,0.07)',
                  outline: active ? '2px solid #A78BFA' : '1px solid rgba(255,255,255,0.12)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: active ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: 10, color: active ? '#DDD6FE' : 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {opt.desc}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Archivo opcional */}
      <div style={SECTION}>
        <span style={LABEL}>Archivo (opcional)</span>
        <UploadZone file={file} onFileSelect={setFile} onClear={() => setFile(null)} />
      </div>

      {/* Tema */}
      <div style={SECTION}>
        <span style={LABEL}>Tema o período histórico</span>
        <textarea
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder="Ej: Segunda Guerra Mundial, Revolución Francesa, Historia de Internet..."
          rows={3}
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
        onClick={handleGenerar}
        disabled={loading}
        style={{
          width: '100%', backgroundColor: '#3B0764', color: colors.white,
          padding: 16, borderRadius: 14, fontSize: 16, fontWeight: 700,
          opacity: loading ? 0.6 : 1, marginBottom: 24,
          border: '1px solid #7C3AED',
        }}
      >
        {loading ? '⏳ Generando...' : '⏳ Crear línea del tiempo'}
      </button>

      {result && <TimelineViewer content={result} />}
    </div>
  )
}

export function TimelineScreen() {
  const bg: CSSProperties = {
    minHeight: '100dvh',
    background: 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)',
    display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto',
  }
  return (
    <div style={bg}>
      <BackHeader title="Línea del tiempo" subtitle="Visualiza cualquier período histórico" accentColor="#7C3AED" />
      <TimelineContent />
    </div>
  )
}
