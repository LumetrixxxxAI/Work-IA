import React, { useState } from 'react'

interface Correction { wrong: string; right: string; type?: string }

function parseCorrectorOutput(raw: string) {
  // Separar texto corregido de la lista de errores
  const lines = raw.split('\n')
  const correctionLines: string[] = []
  const mejorLines: string[] = []
  let mainText = ''
  let inErrors = false
  let inMejoras = false

  for (const line of lines) {
    if (line.match(/^Errores corregidos?:?/i)) { inErrors = true; inMejoras = false; continue }
    if (line.match(/^Mejoras aplicadas?:?/i)) { inMejoras = true; inErrors = false; continue }
    if (inErrors && line.trim()) { correctionLines.push(line); continue }
    if (inMejoras && line.trim()) { mejorLines.push(line); continue }
    if (!inErrors && !inMejoras) mainText += line + '\n'
  }

  // Parsear correcciones: "- Error → Corrección (tipo)"
  const corrections: Correction[] = correctionLines
    .map(l => {
      const m = l.match(/[-•]\s*(.+?)\s*→\s*(.+?)(?:\s*\((.+?)\))?$/)
      if (!m) return null
      return { wrong: m[1].trim(), right: m[2].trim(), type: m[3]?.trim() }
    })
    .filter(Boolean) as Correction[]

  const mejoras: string[] = mejorLines
    .map(l => l.replace(/^[-•\d.]\s*/, '').trim())
    .filter(Boolean)

  return { mainText: mainText.trim(), corrections, mejoras }
}

function renderDiff(text: string) {
  // Detectar errores marcados con [[ ]] y mostrarlos en rojo con corrección en verde
  const parts = text.split(/(\[\[.+?\]\])/)
  return parts.map((part, i) => {
    const m = part.match(/^\[\[(.+?)\]\]$/)
    if (m) {
      return (
        <span key={i}>
          <span style={{
            background: 'rgba(239,68,68,0.2)', color: '#FCA5A5',
            textDecoration: 'line-through', borderRadius: 3, padding: '0 3px',
            fontWeight: 600,
          }}>{m[1]}</span>
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function renderCleanText(text: string) {
  return text.replace(/\[\[(.+?)\]\]/g, '$1')
}

interface Props { content: string; tokensUsados?: number }

export function CorrectorViewer({ content, tokensUsados }: Props) {
  const [tab, setTab] = useState<'diff' | 'clean'>('diff')
  const { mainText, corrections, mejoras } = parseCorrectorOutput(content)

  const hasAnnotations = corrections.length > 0 || mejoras.length > 0
  const hasDiff = mainText.includes('[[')

  // Si no hay formato especial, fallback a ResultBox estilo
  if (!hasDiff && !hasAnnotations) {
    return (
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 16, padding: 16,
      }}>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#fff', fontSize: 14, lineHeight: 1.7 }}>{content}</pre>
        {tokensUsados !== undefined && (
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'right', marginTop: 8 }}>
            Tokens: {tokensUsados}
          </p>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button
          onClick={() => setTab('diff')}
          style={{
            flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 12, fontWeight: 600,
            background: tab === 'diff' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
            color: tab === 'diff' ? '#FCA5A5' : 'rgba(255,255,255,0.45)',
            border: tab === 'diff' ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
          }}
        >🔴 Ver correcciones</button>
        <button
          onClick={() => setTab('clean')}
          style={{
            flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 12, fontWeight: 600,
            background: tab === 'clean' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
            color: tab === 'clean' ? '#4ADE80' : 'rgba(255,255,255,0.45)',
            border: tab === 'clean' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
          }}
        >✅ Texto limpio</button>
      </div>

      {/* Texto */}
      <div style={{
        background: tab === 'clean' ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${tab === 'clean' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: 14, padding: '14px 16px', marginBottom: 14,
        fontSize: 14, lineHeight: 1.9, color: 'rgba(255,255,255,0.85)',
      }}>
        {tab === 'diff' ? renderDiff(mainText) : renderCleanText(mainText)}
      </div>

      {/* Lista de correcciones */}
      {tab === 'diff' && corrections.length > 0 && (
        <div>
          <p style={{
            fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
          }}>Correcciones</p>
          {corrections.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 10, marginBottom: 6,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: 13,
            }}>
              <span style={{ color: '#FCA5A5', textDecoration: 'line-through' }}>{c.wrong}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
              <span style={{ color: '#86EFAC', fontWeight: 600 }}>{c.right}</span>
              {c.type && (
                <span style={{
                  marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.06)', padding: '2px 7px', borderRadius: 10,
                }}>{c.type}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lista de mejoras */}
      {tab === 'diff' && mejoras.length > 0 && (
        <div style={{ marginTop: corrections.length > 0 ? 12 : 0 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
          }}>Mejoras aplicadas</p>
          {mejoras.map((m, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              padding: '8px 12px', borderRadius: 10, marginBottom: 6,
              background: 'rgba(34,197,94,0.05)',
              border: '1px solid rgba(34,197,94,0.15)',
              fontSize: 13, color: 'rgba(255,255,255,0.8)',
            }}>
              <span style={{ color: '#4ADE80', flexShrink: 0 }}>✦</span>
              {m}
            </div>
          ))}
        </div>
      )}

      {tokensUsados !== undefined && (
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'right', marginTop: 10 }}>
          Tokens: {tokensUsados}
        </p>
      )}
    </div>
  )
}
