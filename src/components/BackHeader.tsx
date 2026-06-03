import React, { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { colors } from '../theme/colors'

interface BackHeaderProps {
  title: string
  subtitle?: string
  accentColor?: string
}

export function BackHeader({ title, subtitle, accentColor = colors.blue400 }: BackHeaderProps) {
  const navigate = useNavigate()

  // Añadir clase de animación al montar la pantalla
  React.useEffect(() => {
    const el = document.querySelector('.page-root') as HTMLElement | null
    if (el) { el.classList.add('page-enter'); setTimeout(() => el.classList.remove('page-enter'), 300) }
  }, [])

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 20px 12px',
    borderBottom: `1px solid ${colors.glassBorder}`,
    background: 'rgba(15,34,112,0.4)',
    backdropFilter: 'blur(8px)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  }

  const backBtnStyle: CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: colors.glass,
    border: `1px solid ${colors.glassBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 16,
    flexShrink: 0,
    transition: 'background 0.15s',
  }

  return (
    <div style={headerStyle}>
      <button style={backBtnStyle} onClick={() => navigate(-1)} aria-label="Volver">
        ←
      </button>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: colors.white, margin: 0 }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: accentColor, margin: 0, marginTop: 1, fontWeight: 500 }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
