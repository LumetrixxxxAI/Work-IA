import React, { useState } from 'react'

const GREEN = '#4ADE80'
const GREEN_BG = 'rgba(34,197,94,0.15)'
const GREEN_BORDER = 'rgba(34,197,94,0.3)'
const AMBER = '#FCD34D'
const AMBER_BG = 'rgba(251,191,36,0.15)'
const AMBER_BORDER = 'rgba(251,191,36,0.3)'
const RED_TEXT = '#FCA5A5'
const RED_BG = 'rgba(239,68,68,0.12)'

// Tipo de cada cambio detectado
interface Change { original: string; corrected: string }

// Parsea el texto que llega con marcadores [original→corrección]
function parseText(raw: string): { segments: ({ type: 'text'; value: string } | { type: 'change'; original: string; corrected: string })[]; changes: Change[] } {
  const segments: ({ type: 'text'; value: string } | { type: 'change'; original: string; corrected: string })[] = []
  const changes: Change[] = []

  // Limpia markdown residual (por si el modelo no obedeció del todo)
  const cleaned = raw
    .replace(/^#{1,3} .+$/gm, '')       // quita cabeceras
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // quita negritas
    .replace(/^---+$/gm, '')            // quita separadores
    .trim()

  const regex = /\[([^\]→]+)→([^\]]+)\]/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: cleaned.slice(lastIndex, match.index) })
    }
    const original = match[1].trim()
    const corrected = match[2].trim()
    segments.push({ type: 'change', original, corrected })
    changes.push({ original, corrected })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < cleaned.length) {
    segments.push({ type: 'text', value: cleaned.slice(lastIndex) })
  }

  // Si no hay marcadores (el modelo no siguió el formato), devolvemos el texto tal cual
  if (changes.length === 0 && cleaned.length > 0) {
    segments.push({ type: 'text', value: cleaned })
  }

  return { segments, changes }
}

interface Props {
  content: string
  tokensUsados?: number
  modo?: 'corregir' | 'mejorar' | 'ambos'
}

export function CorrectorViewer({ content, tokensUsados, modo = 'ambos' }: Props) {
  const [showOriginal, setShowOriginal] = useState(false)
  const [copied, setCopied] = useState(false)
  const { segments, changes } = parseText(content)

  // Texto limpio (sin marcadores)
  const cleanText = segments.map(s => s.type === 'text' ? s.value : s.corrected).join('')

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(cleanText) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Color de acento según modo
  const accent = modo === 'corregir' ? GREEN : modo === 'mejorar' ? AMBER : GREEN
  const accentBg = modo === 'corregir' ? GREEN_BG : modo === 'mejorar' ? AMBER_BG : GREEN_BG
  const accentBorder = modo === 'corregir' ? GREEN_BORDER : modo === 'mejorar' ? AMBER_BORDER : GREEN_BORDER

  const modoLabel = modo === 'corregir' ? '✅ Texto corregido' : modo === 'mejorar' ? '✨ Texto mejorado' : '✅ Texto corregido y mejorado'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Header */}
      <div style={{
        background: accentBg, border: `1px solid ${accentBorder}`,
        borderRadius: 16, overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '11px 15px', borderBottom: `1px solid ${accentBorder}`,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            {modoLabel}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setShowOriginal(v => !v)}
              style={{
                fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 7,
                background: showOriginal ? 'rgba(255,255,255,0.12)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.55)',
              }}
            >
              {showOriginal ? 'Ocultar cambios' : 'Ver cambios'}
            </button>
            <button
              onClick={handleCopy}
              style={{
                fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 7,
                background: copied ? 'rgba(34,197,94,0.15)' : accentBg,
                border: `1px solid ${copied ? GREEN_BORDER : accentBorder}`,
                color: copied ? GREEN : accent,
              }}
            >
              {copied ? '✓ Copiado' : '📋 Copiar'}
            </button>
          </div>
        </div>

        {/* Texto renderizado */}
        <div style={{ padding: '14px 16px 16px', fontSize: 15, lineHeight: 1.85, color: 'rgba(255,255,255,0.92)' }}>
          {segments.map((seg, i) => {
            if (seg.type === 'text') {
              return <span key={i}>{seg.value}</span>
            }
            // Cambio: muestra la corrección en verde/ámbar
            return (
              <span key={i} style={{ position: 'relative', display: 'inline' }}>
                {showOriginal && (
                  <span style={{
                    color: RED_TEXT, textDecoration: 'line-through',
                    fontSize: 13, marginRight: 2, opacity: 0.8,
                  }}>{seg.original}</span>
                )}
                <span style={{
                  background: accentBg,
                  color: accent,
                  borderRadius: 4, padding: '0 3px',
                  fontWeight: 600,
                  borderBottom: `1.5px solid ${accent}`,
                }}>{seg.corrected}</span>
              </span>
            )
          })}
        </div>
      </div>

      {/* Resumen de cambios */}
      {changes.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, overflow: 'hidden',
        }}>
          <div style={{
            padding: '9px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1 }}>
              {changes.length} cambio{changes.length !== 1 ? 's' : ''} realizados
            </span>
          </div>
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {changes.map((c, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: 9,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                fontSize: 13,
              }}>
                <span style={{ color: RED_TEXT, background: RED_BG, borderRadius: 4, padding: '1px 6px', textDecoration: 'line-through', fontWeight: 500 }}>
                  {c.original}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>→</span>
                <span style={{ color: accent, background: accentBg, borderRadius: 4, padding: '1px 6px', fontWeight: 700, border: `1px solid ${accentBorder}` }}>
                  {c.corrected}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
