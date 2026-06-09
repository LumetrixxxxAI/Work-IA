import React from 'react'

interface TimelineEvent {
  year: string
  title: string
  description: string
  icon: string
  color: string
  bg: string
  dotColor: string
}

interface Props {
  content: string
}

// Colores que van rotando para cada evento
const PALETTES = [
  { color: '#FCA5A5', bg: 'rgba(239,68,68,0.12)',   dotColor: '#EF4444' },
  { color: '#FDBA74', bg: 'rgba(249,115,22,0.12)',  dotColor: '#F97316' },
  { color: '#FDE047', bg: 'rgba(234,179,8,0.12)',   dotColor: '#EAB308' },
  { color: '#86EFAC', bg: 'rgba(34,197,94,0.12)',   dotColor: '#22C55E' },
  { color: '#7DD3FC', bg: 'rgba(56,189,248,0.12)',  dotColor: '#38BDF8' },
  { color: '#D8B4FE', bg: 'rgba(168,85,247,0.12)', dotColor: '#A855F7' },
  { color: '#F9A8D4', bg: 'rgba(236,72,153,0.12)', dotColor: '#EC4899' },
  { color: '#A5F3FC', bg: 'rgba(6,182,212,0.12)',  dotColor: '#06B6D4' },
]

function parseTimeline(raw: string): { title: string; subtitle: string; events: TimelineEvent[] } {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  let title = ''
  let subtitle = ''
  const events: TimelineEvent[] = []

  // Buscar título principal (línea con ##)
  const titleLine = lines.find(l => l.startsWith('##'))
  if (titleLine) title = titleLine.replace(/^#+\s*/, '').trim()

  // Buscar subtítulo (rango de años)
  const subLine = lines.find(l => /\d{3,4}\s*[–\-—]\s*\d{3,4}/.test(l) && !l.startsWith('#'))
  if (subLine) subtitle = subLine.replace(/^[-*>]\s*/, '').trim()

  // Parsear cada evento — formato esperado: ### AÑO - Título o **AÑO** Título
  let current: Partial<TimelineEvent> | null = null
  let descLines: string[] = []

  const flush = () => {
    if (current?.year && current?.title) {
      const idx = events.length % PALETTES.length
      events.push({
        year: current.year,
        title: current.title,
        description: descLines.join(' ').trim(),
        icon: current.icon ?? '📌',
        ...PALETTES[idx],
      })
    }
    current = null
    descLines = []
  }

  for (const line of lines) {
    // Detectar línea de evento: ### 1939, **1939**, - **1939**, 1939:, etc.
    const eventMatch =
      line.match(/^#{2,3}\s+(\d{1,4}(?:\s*[a-zA-Z\.]*)?)\s*[-–:]\s*(.+)/) ||
      line.match(/^\*{1,2}(\d{1,4}(?:\s*[a-zA-Z\.]*)?)\*{1,2}\s*[-–:]?\s*(.+)/) ||
      line.match(/^[-*]\s+\*{1,2}(\d{1,4}(?:\s*[a-zA-Z\.]*)?)\*{1,2}\s*[-–:]?\s*(.+)/) ||
      line.match(/^(\d{1,4}(?:\s*[a-zA-Z\.]*)?)\s*[-–:]\s*(.+)/)

    if (eventMatch) {
      flush()
      const rawYear = eventMatch[1].trim()
      const rawTitle = eventMatch[2].replace(/\*+/g, '').trim()

      // Extraer emoji del título si lo hay
      const emojiMatch = rawTitle.match(/^(\p{Emoji_Presentation}|\p{Emoji}️)\s*/u)
      const icon = emojiMatch ? emojiMatch[0].trim() : pickIcon(rawTitle)
      const title = emojiMatch ? rawTitle.slice(emojiMatch[0].length).trim() : rawTitle

      current = { year: rawYear, title, icon }
    } else if (current && !line.startsWith('#') && !line.match(/^\d{3,4}\s*[–\-]\s*\d{3,4}/)) {
      // Línea de descripción del evento actual
      descLines.push(line.replace(/^[-*]\s+/, '').replace(/\*+/g, ''))
    } else if (!current && !title && line.startsWith('#')) {
      title = line.replace(/^#+\s*/, '').trim()
    }
  }
  flush()

  return { title: title || 'Línea del tiempo', subtitle, events }
}

function pickIcon(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('guerra') || t.includes('batalla') || t.includes('conflicto')) return '⚔️'
  if (t.includes('paz') || t.includes('tratado') || t.includes('acuerdo')) return '🕊️'
  if (t.includes('revolución') || t.includes('revuelta')) return '🔥'
  if (t.includes('descubr') || t.includes('explor')) return '🧭'
  if (t.includes('independ')) return '🏳️'
  if (t.includes('muerte') || t.includes('assassin') || t.includes('asesin')) return '💀'
  if (t.includes('nacimiento') || t.includes('nació') || t.includes('fundac')) return '🌱'
  if (t.includes('elección') || t.includes('elecciones') || t.includes('voto')) return '🗳️'
  if (t.includes('ciencia') || t.includes('inventor') || t.includes('descubrimiento')) return '🔬'
  if (t.includes('arte') || t.includes('cultur')) return '🎨'
  if (t.includes('econom') || t.includes('crisis') || t.includes('financ')) return '📉'
  return '📌'
}

export function TimelineViewer({ content }: Props) {
  const { title, subtitle, events } = parseTimeline(content)

  if (events.length === 0) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 14, padding: '16px', color: 'rgba(255,255,255,0.7)', fontSize: 13,
      }}>
        {content}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Título */}
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>{title}</h2>
        {subtitle && (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>{subtitle}</p>
        )}
      </div>

      {/* Contador de eventos */}
      <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>
        {events.length} eventos clave
      </p>

      {/* Eventos */}
      {events.map((ev, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'stretch' }}>

          {/* Columna año */}
          <div style={{ width: 68, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingTop: 7 }}>
            <span style={{
              fontSize: 12, fontWeight: 800, padding: '3px 8px',
              borderRadius: 20, whiteSpace: 'nowrap',
              background: `rgba(${hexToRgb(ev.dotColor)},0.22)`,
              color: ev.color,
            }}>{ev.year}</span>
          </div>

          {/* Columna línea + punto */}
          <div style={{ width: 36, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: 13, height: 13, borderRadius: '50%',
              background: ev.dotColor,
              border: `3px solid ${ev.color}44`,
              marginTop: 9, flexShrink: 0, zIndex: 1,
            }} />
            {i < events.length - 1 && (
              <div style={{ flex: 1, width: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 2, minHeight: 16 }} />
            )}
          </div>

          {/* Card */}
          <div style={{ flex: 1, paddingBottom: i < events.length - 1 ? 16 : 0, paddingTop: 2 }}>
            <div style={{
              borderRadius: 14, padding: '11px 13px',
              background: ev.bg,
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ fontSize: 17, marginBottom: 4 }}>{ev.icon}</div>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{ev.title}</h3>
              {ev.description && (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, margin: 0 }}>{ev.description}</p>
              )}
            </div>
          </div>

        </div>
      ))}
    </div>
  )
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}
