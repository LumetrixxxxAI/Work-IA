import React, { useState } from 'react'

interface Props {
  content: string
  idioma: string
  nivel: string
  textoOriginal: string
}

const IDIOMA_FLAG: Record<string, string> = {
  español: 'https://flagcdn.com/w40/es.png',
  inglés:  'https://flagcdn.com/w40/gb.png',
  francés: 'https://flagcdn.com/w40/fr.png',
}

const NIVEL_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  A1:     { bg: 'rgba(34,197,94,0.12)',   text: '#86EFAC', border: 'rgba(34,197,94,0.3)'   },
  B1:     { bg: 'rgba(56,189,248,0.12)',  text: '#7DD3FC', border: 'rgba(56,189,248,0.3)'  },
  C1:     { bg: 'rgba(168,85,247,0.12)', text: '#D8B4FE', border: 'rgba(168,85,247,0.3)' },
  Nativo: { bg: 'rgba(245,158,11,0.12)', text: '#FCD34D', border: 'rgba(245,158,11,0.3)' },
}

export function TraductorViewer({ content, idioma, nivel, textoOriginal }: Props) {
  const [showOriginal, setShowOriginal] = useState(false)
  const [copied, setCopied] = useState(false)

  const flagUrl = IDIOMA_FLAG[idioma.toLowerCase()]
  const nColor = NIVEL_COLOR[nivel] ?? NIVEL_COLOR['B1']

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Dividir en párrafos para mejor legibilidad
  const parrafos = content.split('\n').filter(p => p.trim().length > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Header resultado */}
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16, padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {flagUrl
            ? <img src={flagUrl} alt={idioma} style={{ width: 40, height: 27, borderRadius: 5, objectFit: 'cover' }} />
            : <span style={{ fontSize: 24 }}>🌐</span>
          }
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, textTransform: 'capitalize' }}>
              {idioma}
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0 }}>Traducción completada</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Badge nivel */}
          <span style={{
            background: nColor.bg, border: `1px solid ${nColor.border}`,
            color: nColor.text, fontSize: 11, fontWeight: 800,
            padding: '4px 10px', borderRadius: 20,
          }}>{nivel}</span>
          {/* Copiar */}
          <button
            onClick={handleCopy}
            style={{
              background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
              fontSize: 11, fontWeight: 700,
              color: copied ? '#86EFAC' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s',
            }}
          >
            {copied ? '✓ Copiado' : '⎘ Copiar'}
          </button>
        </div>
      </div>

      {/* Texto traducido */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: '16px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {parrafos.map((p, i) => (
          <p key={i} style={{
            fontSize: 14, color: '#fff', lineHeight: 1.8,
            margin: 0,
            paddingBottom: i < parrafos.length - 1 ? 10 : 0,
            borderBottom: i < parrafos.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            {p}
          </p>
        ))}
      </div>

      {/* Botón ver original */}
      <button
        onClick={() => setShowOriginal(v => !v)}
        style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 12, padding: '10px 16px',
          color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', textAlign: 'left',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <span>📄 Ver texto original</span>
        <span style={{ fontSize: 11 }}>{showOriginal ? '▲ Ocultar' : '▼ Mostrar'}</span>
      </button>

      {showOriginal && (
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, padding: '14px 16px',
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Original
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: 0 }}>
            {textoOriginal}
          </p>
        </div>
      )}
    </div>
  )
}
