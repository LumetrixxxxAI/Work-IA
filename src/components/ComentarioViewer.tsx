import React, { useState } from 'react'

const PINK = '#EC4899'
const PINK_SOFT = 'rgba(236,72,153,0.15)'
const PINK_BORDER = 'rgba(236,72,153,0.25)'

// Renderiza texto inline con **negrita**
function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} style={{ color: '#fff', fontWeight: 700 }}>
              {part.slice(2, -2)}
            </strong>
          )
        }
        // Cursiva con *texto*
        const italicParts = part.split(/(\*[^*]+\*)/g)
        return (
          <React.Fragment key={i}>
            {italicParts.map((p, j) =>
              p.startsWith('*') && p.endsWith('*') && p.length > 2
                ? <em key={j} style={{ color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>{p.slice(1, -1)}</em>
                : <span key={j}>{p}</span>
            )}
          </React.Fragment>
        )
      })}
    </>
  )
}

function renderLines(lines: string[]) {
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Línea vacía
    if (!line.trim()) { i++; continue }

    // --- separador
    if (/^---+$/.test(line.trim())) {
      elements.push(
        <div key={i} style={{ height: 1, background: PINK_BORDER, margin: '14px 0' }} />
      )
      i++; continue
    }

    // # H1
    if (line.startsWith('# ')) {
      const text = line.slice(2).replace(/\*+/g, '').trim()
      elements.push(
        <div key={i} style={{
          background: PINK_SOFT,
          border: `1px solid ${PINK_BORDER}`,
          borderLeft: `3px solid ${PINK}`,
          borderRadius: '0 10px 10px 0',
          padding: '10px 14px', marginBottom: 16, marginTop: 4,
        }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: PINK, lineHeight: 1.4 }}>
            {text}
          </span>
        </div>
      )
      i++; continue
    }

    // ## H2
    if (line.startsWith('## ')) {
      const text = line.slice(3).replace(/\*+/g, '').trim()
      elements.push(
        <div key={i} style={{ marginBottom: 10, marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 3, height: 18, borderRadius: 2, background: PINK, flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 800, color: PINK }}>
              {text}
            </span>
          </div>
          <div style={{ height: 1, background: PINK_BORDER, marginTop: 6 }} />
        </div>
      )
      i++; continue
    }

    // ### H3
    if (line.startsWith('### ')) {
      const text = line.slice(4).replace(/\*+/g, '').trim()
      elements.push(
        <p key={i} style={{
          fontSize: 13, fontWeight: 700, color: 'rgba(236,72,153,0.85)',
          marginBottom: 6, marginTop: 12, textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          {text}
        </p>
      )
      i++; continue
    }

    // Lista con - o •
    if (/^[-•]\s/.test(line)) {
      const listItems: string[] = []
      while (i < lines.length && /^[-•]\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^[-•]\s/, '').trim())
        i++
      }
      elements.push(
        <div key={`list-${i}`} style={{ marginBottom: 8 }}>
          {listItems.map((item, idx) => (
            <div key={idx} style={{
              display: 'flex', gap: 8, alignItems: 'flex-start',
              padding: '4px 0',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: PINK, flexShrink: 0, marginTop: 6,
              }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
                <InlineText text={item} />
              </span>
            </div>
          ))}
        </div>
      )
      continue
    }

    // Párrafo normal
    elements.push(
      <p key={i} style={{
        fontSize: 13, color: 'rgba(255,255,255,0.82)', lineHeight: 1.75,
        marginBottom: 8,
      }}>
        <InlineText text={line} />
      </p>
    )
    i++
  }

  return elements
}

interface Props {
  content: string
  tokensUsados?: number
  tipo?: string
}

export function ComentarioViewer({ content, tokensUsados, tipo }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(content) } catch { }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = content.split('\n')
  const tipoLabel: Record<string, string> = {
    literario: '📖 Comentario literario',
    filosofico: '🧠 Comentario filosófico',
    historico: '🏛️ Comentario histórico',
  }

  return (
    <div style={{
      background: 'rgba(236,72,153,0.04)',
      border: `1px solid ${PINK_BORDER}`,
      borderRadius: 16, overflow: 'hidden', marginTop: 4,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px',
        borderBottom: `1px solid ${PINK_BORDER}`,
        background: PINK_SOFT,
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: PINK, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          {tipo ? tipoLabel[tipo] ?? 'Comentario' : 'Resultado'}
        </span>
        <button
          onClick={handleCopy}
          style={{
            fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 8,
            background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(236,72,153,0.15)',
            border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : PINK_BORDER}`,
            color: copied ? '#4ADE80' : PINK,
          }}
        >
          {copied ? '✓ Copiado' : '📋 Copiar'}
        </button>
      </div>

      {/* Contenido */}
      <div style={{ padding: '16px 16px 12px' }}>
        {renderLines(lines)}
      </div>
    </div>
  )
}
