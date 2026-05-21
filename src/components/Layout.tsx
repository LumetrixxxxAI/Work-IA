import React, { CSSProperties } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { colors } from '../theme/colors'

interface NavItem { icon: string; label: string; path: string }

const NAV_ITEMS: NavItem[] = [
  { icon: '🏠', label: 'Inicio', path: '/home' },
  { icon: '🕐', label: 'Historial', path: '/historial' },
  { icon: '👑', label: 'Suscripción', path: '/suscripcion' },
  { icon: '⚙️', label: 'Ajustes', path: '/ajustes' },
]

interface LayoutProps { children: React.ReactNode }

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100dvh',
    maxWidth: 430,
    margin: '0 auto',
    position: 'relative',
    overflow: 'hidden',
  }

  const contentStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingBottom: 70,
    WebkitOverflowScrolling: 'touch' as CSSProperties['WebkitOverflowScrolling'],
  }

  const navStyle: CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 430,
    backgroundColor: 'rgba(7, 89, 133, 0.95)',
    backdropFilter: 'blur(12px)',
    borderTop: `1px solid ${colors.glassBorder}`,
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px 0 env(safe-area-inset-bottom, 10px)',
    zIndex: 100,
  }

  const navItemStyle = (active: boolean): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    padding: '4px 20px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    opacity: active ? 1 : 0.55,
    transition: 'opacity 0.15s',
  })

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {children}
      </div>
      <nav style={navStyle}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.path
          return (
            <button key={item.path} style={navItemStyle(active)} onClick={() => navigate(item.path)}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span style={{
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                color: active ? colors.blue400 : colors.white,
                letterSpacing: 0.2,
              }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
