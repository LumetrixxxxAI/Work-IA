import React, { useRef, CSSProperties } from 'react'
import { colors } from '../theme/colors'

export interface SelectedFile {
  name: string
  type: string
  base64: string
}

interface UploadZoneProps {
  file: SelectedFile | null
  onFileSelect: (file: SelectedFile) => void
  onClear: () => void
}

export function UploadZone({ file, onFileSelect, onClear }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      const base64 = dataUrl.split(',')[1]
      onFileSelect({ name: f.name, type: f.type, base64 })
    }
    reader.readAsDataURL(f)
    // Resetear input para permitir seleccionar el mismo archivo
    e.target.value = ''
  }

  const zoneStyle: CSSProperties = {
    border: `2px dashed ${colors.glassBorder}`,
    borderRadius: 14,
    padding: '16px',
    textAlign: 'center',
    backgroundColor: colors.glass,
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  }

  const fileStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(96,165,250,0.1)',
    border: `1px solid rgba(96,165,250,0.3)`,
    borderRadius: 12,
    padding: '12px 16px',
  }

  if (file) {
    return (
      <div style={fileStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <span style={{ fontSize: 20 }}>{file.type.includes('pdf') ? '📄' : '🖼️'}</span>
          <span style={{ fontSize: 13, color: colors.blue200, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {file.name}
          </span>
        </div>
        <button
          onClick={onClear}
          style={{
            width: 24, height: 24, borderRadius: '50%',
            backgroundColor: 'rgba(239,68,68,0.15)',
            color: colors.error, fontSize: 14, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginLeft: 8,
          }}
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <div style={zoneStyle} onClick={() => inputRef.current?.click()}>
        <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>📎</span>
        <p style={{ fontSize: 13, color: colors.blue200, fontWeight: 500, margin: 0 }}>
          Subir imagen o PDF
        </p>
        <p style={{ fontSize: 11, color: colors.muted, margin: '4px 0 0' }}>
          Toca para seleccionar
        </p>
      </div>
    </>
  )
}
