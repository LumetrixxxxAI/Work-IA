import React, { useState } from 'react'

const TEAL = '#38BDF8'
const TEAL_MID = '#0EA5E9'
const TEAL_SOFT = 'rgba(14,165,233,0.12)'
const TEAL_BORDER = 'rgba(14,165,233,0.25)'
const WHITE = '#ffffff'
const WHITE_85 = 'rgba(255,255,255,0.85)'
const WHITE_65 = 'rgba(255,255,255,0.65)'

// ─── Inline text renderer (bold / italic) ───────────────────────────────────
function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ color: WHITE, fontWeight: 700 }}>{part.slice(2, -2)}</strong>
        }
        const italics = part.split(/(\*[^*]+\*)/g)
        return (
          <React.Fragment key={i}>
            {italics.map((p, j) =>
              p.startsWith('*') && p.endsWith('*') && p.length > 2
                ? <em key={j} style={{ color: WHITE_85, fontStyle: 'italic' }}>{p.slice(1, -1)}</em>
                : <span key={j}>{p}</span>
            )}
          </React.Fragment>
        )
      })}
    </>
  )
}

// ─── ESQUEMA JERÁRQUICO ──────────────────────────────────────────────────────
function renderEsquema(lines: string[]) {
  const nodes: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }

    // Título (# o ##)
    if (/^#{1,2} /.test(line)) {
      const text = line.replace(/^#{1,2} /, '').replace(/\*+/g, '').trim()
      nodes.push(
        <div key={i} style={{
          background: TEAL_SOFT,
          borderLeft: `3px solid ${TEAL_MID}`,
          borderRadius: '0 10px 10px 0',
          padding: '9px 14px', marginBottom: 12, marginTop: 4,
        }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: TEAL }}>{text}</span>
        </div>
      )
      i++; continue
    }

    // ### → sección numerada
    if (line.startsWith('### ')) {
      const text = line.slice(4).replace(/\*+/g, '').trim()
      // extraer número si lo hay
      const numMatch = text.match(/^(\d+)[.)]\s*(.+)/)
      const num = numMatch ? numMatch[1] : String(nodes.length + 1)
      const label = numMatch ? numMatch[2] : text
      nodes.push(
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginTop: 14, marginBottom: 5 }}>
          <div style={{
            background: `linear-gradient(135deg, ${TEAL_MID}, ${TEAL})`,
            color: WHITE, fontSize: 10, fontWeight: 800,
            minWidth: 20, height: 20, borderRadius: 5, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{num}</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: WHITE, paddingTop: 2 }}>{label}</span>
        </div>
      )
      i++; continue
    }

    // - → nivel 2
    if (/^[-•] /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-•] /.test(lines[i])) {
        items.push(lines[i].replace(/^[-•] /, '').trim())
        i++
      }
      nodes.push(
        <div key={`l2-${i}`} style={{ marginBottom: 2 }}>
          {items.map((item, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'flex-start', gap: 7,
              padding: '4px 7px', margin: '3px 0 3px 29px',
              borderRadius: 7, background: 'rgba(255,255,255,0.04)',
              borderLeft: `2px solid rgba(14,165,233,0.35)`,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: TEAL, flexShrink: 0, marginTop: 7 }} />
              <span style={{ fontSize: 12, color: WHITE_85, lineHeight: 1.55 }}>
                <InlineText text={item} />
              </span>
            </div>
          ))}
        </div>
      )
      continue
    }

    // Indented › / sub-items
    if (/^\s{2,}/.test(line) || line.startsWith('  ')) {
      const text = line.replace(/^\s+[-›>•]?\s*/, '').trim()
      nodes.push(
        <div key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: 5,
          padding: '2px 7px 2px 14px', margin: '1px 0 1px 46px',
        }}>
          <span style={{ fontSize: 10, color: 'rgba(14,165,233,0.5)', marginTop: 3 }}>›</span>
          <span style={{ fontSize: 11, color: WHITE_65, lineHeight: 1.5 }}>
            <InlineText text={text} />
          </span>
        </div>
      )
      i++; continue
    }

    // Numbered list  1. / 1)
    if (/^\d+[.)]\s/.test(line)) {
      const text = line.replace(/^\d+[.)]\s/, '').trim()
      const num = (line.match(/^(\d+)/) || ['', ''])[1]
      nodes.push(
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginTop: 14, marginBottom: 5 }}>
          <div style={{
            background: `linear-gradient(135deg, ${TEAL_MID}, ${TEAL})`,
            color: WHITE, fontSize: 10, fontWeight: 800,
            minWidth: 20, height: 20, borderRadius: 5, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{num}</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: WHITE, paddingTop: 2 }}>
            <InlineText text={text} />
          </span>
        </div>
      )
      i++; continue
    }

    // --- separador
    if (/^---+$/.test(line.trim())) {
      nodes.push(<div key={i} style={{ height: 1, background: TEAL_BORDER, margin: '12px 0' }} />)
      i++; continue
    }

    // Párrafo general
    nodes.push(
      <p key={i} style={{ fontSize: 12, color: WHITE_85, lineHeight: 1.65, marginBottom: 6 }}>
        <InlineText text={line} />
      </p>
    )
    i++
  }
  return nodes
}

// ─── MAPA CONCEPTUAL ────────────────────────────────────────────────────────
function renderMapa(lines: string[]) {
  // Estructuras que extraemos del texto
  const central: string[] = []
  const sections: { title: string; items: string[] }[] = []
  const relations: { from: string; arrow: string; to: string }[] = []

  let currentSection: { title: string; items: string[] } | null = null
  let inRelations = false

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    // Título principal (# o ##)
    if (/^#{1,2} /.test(line)) {
      central.push(line.replace(/^#{1,2} /, '').replace(/\*+/g, '').trim())
      continue
    }

    // Sección (###)
    if (line.startsWith('### ')) {
      const title = line.slice(4).replace(/\*+/g, '').trim()
      if (/relaci/i.test(title)) { inRelations = true; currentSection = null; continue }
      inRelations = false
      currentSection = { title, items: [] }
      sections.push(currentSection)
      continue
    }

    // Numbered section: 1. Título
    if (/^\d+[.)]\s/.test(line) && !inRelations) {
      const title = line.replace(/^\d+[.)]\s/, '').replace(/\*+/g, '').trim()
      currentSection = { title, items: [] }
      sections.push(currentSection)
      continue
    }

    // Relation: A → B  or  A -> B
    if (inRelations && /[→\-–>]/.test(line)) {
      const parts = line.replace(/^[-•]\s*/, '').split(/\s*[→\->–]+\s*/)
      if (parts.length >= 2) {
        relations.push({ from: parts[0].replace(/\*+/g, '').trim(), arrow: '→', to: parts[parts.length - 1].replace(/\*+/g, '').trim() })
      }
      continue
    }

    // List item
    if (/^[-•]\s/.test(line) && currentSection) {
      currentSection.items.push(line.replace(/^[-•]\s/, '').replace(/\*+/g, '').trim())
      continue
    }
  }

  // If no sections found, fallback to esquema renderer
  if (sections.length === 0) return renderEsquema(lines)

  const centralTitle = central[0] || 'Concepto central'

  return [
    // Nodo central
    <div key="central" style={{
      background: `linear-gradient(135deg, ${TEAL_MID}, #0284C7)`,
      borderRadius: 13, padding: '13px 16px', textAlign: 'center',
      boxShadow: '0 4px 18px rgba(14,165,233,0.3)', marginBottom: 10,
    }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: WHITE }}>{centralTitle}</div>
    </div>,

    // Grid de nodos (de 2 en 2)
    ...chunk(sections, 2).map((pair, rowIdx) => (
      <div key={`row-${rowIdx}`} style={{ display: 'flex', gap: 7, marginBottom: 7 }}>
        {pair.map((sec, idx) => (
          <div key={idx} style={{
            flex: 1, background: 'rgba(14,165,233,0.1)',
            border: `1px solid rgba(14,165,233,0.3)`,
            borderRadius: 11, padding: '9px 10px',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TEAL, marginBottom: 5 }}>{sec.title}</div>
            {sec.items.map((item, k) => (
              <div key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: 4, padding: '2px 0' }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: TEAL, flexShrink: 0, marginTop: 6 }} />
                <span style={{ fontSize: 11, color: WHITE_85, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    )),

    // Relaciones
    ...(relations.length > 0 ? [
      <div key="rel-header" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5, marginTop: 4 }}>
        Relaciones clave
      </div>,
      ...relations.map((rel, i) => (
        <div key={`rel-${i}`} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 9, padding: '7px 11px', marginBottom: 5,
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: TEAL }}>{rel.from}</span>
          <span style={{ fontSize: 10, color: 'rgba(14,165,233,0.5)', flex: 1, textAlign: 'center' }}>── {rel.arrow} ──</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#7DD3FC' }}>{rel.to}</span>
        </div>
      )),
    ] : []),
  ]
}

// ─── TABLA RESUMEN ───────────────────────────────────────────────────────────
function renderTabla(lines: string[]) {
  // Parse markdown table: | col | col | ...
  const tableRows: string[][] = []
  let isHeader = true
  const otherLines: { line: string; idx: number }[] = []

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed) return

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      // Separator row (|---|---|)
      if (/^\|[\s\-:|]+\|$/.test(trimmed)) { isHeader = false; return }
      const cells = trimmed.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(c => c.replace(/\*+/g, '').trim())
      tableRows.push(cells)
    } else if (/^#{1,3} /.test(trimmed)) {
      otherLines.push({ line: trimmed.replace(/^#{1,3} /, '').replace(/\*+/g, '').trim(), idx })
    }
  })

  if (tableRows.length === 0) return renderEsquema(lines)

  const headers = tableRows[0]
  const bodyRows = tableRows.slice(1)

  return [
    // Títulos previos
    ...otherLines.map(({ line, idx }) => (
      <div key={`t-${idx}`} style={{
        background: TEAL_SOFT, borderLeft: `3px solid ${TEAL_MID}`,
        borderRadius: '0 10px 10px 0', padding: '8px 13px', marginBottom: 10,
      }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: TEAL }}>{line}</span>
      </div>
    )),

    // Tabla
    <div key="table" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(14,165,233,0.18)' }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: '9px 9px', fontSize: 10, fontWeight: 800, color: TEAL,
                textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.4,
                borderBottom: `1.5px solid rgba(14,165,233,0.3)`,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, i) => (
            <tr key={i} style={{
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: i % 2 === 1 ? 'rgba(255,255,255,0.025)' : 'transparent',
            }}>
              {row.map((cell, j) => {
                const isSi = /^(sí|si|yes|✓|✅)$/i.test(cell)
                const isNo = /^(no|✗|❌)$/i.test(cell)
                return (
                  <td key={j} style={{
                    padding: '8px 9px', fontSize: 12,
                    color: j === 0 ? '#7DD3FC' : WHITE_85,
                    fontWeight: j === 0 ? 700 : 400,
                    lineHeight: 1.45, verticalAlign: 'top',
                  }}>
                    {isSi ? (
                      <span style={{ display: 'inline-block', background: 'rgba(14,165,233,0.15)', border: `1px solid rgba(14,165,233,0.3)`, borderRadius: 5, padding: '1px 7px', fontSize: 10, color: TEAL, fontWeight: 700 }}>Sí</span>
                    ) : isNo ? (
                      <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '1px 7px', fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>No</span>
                    ) : cell}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>,
  ]
}

// ─── Utils ───────────────────────────────────────────────────────────────────
function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
  return result
}

// ─── Componente principal ────────────────────────────────────────────────────
interface Props {
  content: string
  tokensUsados?: number
  tipo?: 'esquema' | 'mapa' | 'tabla'
}

const TIPO_LABEL: Record<string, string> = {
  esquema: '🗂️ Esquema',
  mapa: '🔗 Mapa conceptual',
  tabla: '📊 Tabla resumen',
}

export function EsquemaViewer({ content, tokensUsados, tipo = 'esquema' }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(content) } catch { }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = content.split('\n')
  const rendered = tipo === 'tabla' ? renderTabla(lines)
    : tipo === 'mapa' ? renderMapa(lines)
    : renderEsquema(lines)

  return (
    <div style={{
      background: 'rgba(14,165,233,0.05)',
      border: `1px solid ${TEAL_BORDER}`,
      borderRadius: 16, overflow: 'hidden', marginTop: 4,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '11px 15px',
        borderBottom: `1px solid ${TEAL_BORDER}`,
        background: TEAL_SOFT,
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          {TIPO_LABEL[tipo] ?? 'Resultado'}
        </span>
        <button
          onClick={handleCopy}
          style={{
            fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 7,
            background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(14,165,233,0.15)',
            border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : TEAL_BORDER}`,
            color: copied ? '#4ADE80' : TEAL,
          }}
        >
          {copied ? '✓ Copiado' : '📋 Copiar'}
        </button>
      </div>

      {/* Contenido */}
      <div style={{ padding: '14px 14px 12px' }}>
        {rendered}
      </div>
    </div>
  )
}
