import React, { useState } from 'react'

interface Props {
  content: string
}

const GREEN       = '#4ADE80'
const GREEN_DIM   = 'rgba(74,222,128,0.15)'
const GREEN_BORDER= 'rgba(74,222,128,0.3)'

// Convierte **negrita** en spans bold
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i} style={{ color: '#fff', fontWeight: 700 }}>{p.slice(2, -2)}</strong>
    }
    return <span key={i}>{p}</span>
  })
}

export function ClaseViewer({ content }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const lines = content.split('\n')
  const nodes: React.ReactNode[] = []
  let paraBuffer: string[] = []

  const flushPara = (key: string) => {
    if (paraBuffer.length === 0) return
    const text = paraBuffer.join(' ').trim()
    if (text) {
      nodes.push(
        <p key={key} style={{ fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 1.8, margin: '0 0 12px' }}>
          {renderInline(text)}
        </p>
      )
    }
    paraBuffer = []
  }

  lines.forEach((raw, i) => {
    const line = raw.trim()

    // H1 — título principal
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      flushPara(`pre-h1-${i}`)
      const title = line.replace(/^#\s+/, '')
      nodes.push(
        <div key={`h1-${i}`} style={{ marginBottom: 20, marginTop: nodes.length > 0 ? 8 : 0 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 6px', lineHeight: 1.3 }}>
            {renderInline(title)}
          </h1>
          <div style={{ height: 2, width: 48, background: GREEN, borderRadius: 2 }} />
        </div>
      )
      return
    }

    // H2 — sección
    if (line.startsWith('## ') && !line.startsWith('### ')) {
      flushPara(`pre-h2-${i}`)
      const title = line.replace(/^##\s+/, '')
      nodes.push(
        <div key={`h2-${i}`} style={{
          marginBottom: 12, marginTop: 20,
          background: GREEN_DIM, border: `1px solid ${GREEN_BORDER}`,
          borderRadius: 10, padding: '9px 14px',
          borderLeft: `3px solid ${GREEN}`,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: GREEN, margin: 0 }}>
            {renderInline(title)}
          </h2>
        </div>
      )
      return
    }

    // H3 — subsección
    if (line.startsWith('### ')) {
      flushPara(`pre-h3-${i}`)
      const title = line.replace(/^###\s+/, '')
      nodes.push(
        <div key={`h3-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, marginTop: 14 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, flexShrink: 0 }} />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'rgba(74,222,128,0.85)', margin: 0 }}>
            {renderInline(title)}
          </h3>
        </div>
      )
      return
    }

    // Lista con - o *
    if (line.match(/^[-*]\s+/)) {
      flushPara(`pre-li-${i}`)
      const text = line.replace(/^[-*]\s+/, '')
      nodes.push(
        <div key={`li-${i}`} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6, paddingLeft: 4 }}>
          <span style={{ color: GREEN, fontSize: 12, marginTop: 4, flexShrink: 0 }}>▸</span>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, margin: 0 }}>
            {renderInline(text)}
          </p>
        </div>
      )
      return
    }

    // Separador
    if (line === '---' || line === '***') {
      flushPara(`pre-sep-${i}`)
      nodes.push(<div key={`sep-${i}`} style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '16px 0' }} />)
      return
    }

    // Línea vacía → vacía el buffer de párrafo
    if (line === '') {
      flushPara(`para-${i}`)
      return
    }

    // Texto normal → acumular en párrafo
    paraBuffer.push(line)
  })

  flushPara('final')

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16, padding: '16px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: 'uppercase', letterSpacing: 1 }}>
          Explicación
        </span>
        <button
          onClick={handleCopy}
          style={{
            fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '4px 10px', borderRadius: 6, border: 'none',
            background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.08)',
            color: copied ? GREEN : 'rgba(255,255,255,0.55)',
            transition: 'all 0.2s',
          }}
        >
          {copied ? '✓ Copiado' : '📋 Copiar'}
        </button>
      </div>

      {/* Contenido */}
      <div>{nodes}</div>
    </div>
  )
}
