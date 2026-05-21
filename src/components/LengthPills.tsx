import React, { CSSProperties } from 'react'
import { colors } from '../theme/colors'

interface PillOption { value: string; label: string }

interface LengthPillsProps {
  options: PillOption[]
  selected: string
  onSelect: (value: string) => void
  accentColor?: string
}

export function LengthPills({ options, selected, onSelect, accentColor = colors.blue400 }: LengthPillsProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  }

  const pillStyle = (active: boolean): CSSProperties => ({
    flex: '1 1 0',
    minWidth: 70,
    padding: '10px 4px',
    borderRadius: 10,
    border: active ? `1.5px solid ${accentColor}` : `1px solid ${colors.glassBorder}`,
    backgroundColor: active ? `${accentColor}22` : colors.glass,
    color: active ? accentColor : colors.muted,
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s',
  })

  return (
    <div style={containerStyle}>
      {options.map((opt) => (
        <button
          key={opt.value}
          style={pillStyle(selected === opt.value)}
          onClick={() => onSelect(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
