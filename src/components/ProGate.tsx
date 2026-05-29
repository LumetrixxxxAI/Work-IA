import React, { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscriptionStore } from '../store/subscriptionStore'
import { colors } from '../theme/colors'

interface ProGateProps {
  children: React.ReactNode
}

export function ProGate({ children }: ProGateProps) {
  const { isPro, isLoading } = useSubscriptionStore()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ color: colors.muted, fontSize: 14 }}>Cargando...</div>
      </div>
    )
  }

  if (!isPro) {
    const blockerStyle: CSSProperties = {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
      gap: 16,
      minHeight: 'calc(100dvh - 120px)',
    }

    return (
      <div style={blockerStyle}>
        <div style={{ fontSize: 56 }}>🔒</div>
        <div style={{
          backgroundColor: 'rgba(251,191,36,0.1)',
          border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 12,
          padding: '6px 16px',
          color: '#FBBF24',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}>
          Plan Pro
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.white, margin: 0 }}>
          Herramienta exclusiva Pro
        </h2>
        <p style={{ fontSize: 14, color: colors.muted, lineHeight: 1.6, maxWidth: 280, margin: 0 }}>
          Desbloquea todas las herramientas con el plan Pro por solo 3,99€/mes.
        </p>
        <button
          onClick={() => navigate('/paywall')}
          style={{
            backgroundColor: '#FBBF24',
            color: '#1a1a1a',
            padding: '14px 32px',
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 700,
            marginTop: 8,
          }}
        >
          Ver plan Pro →
        </button>
      </div>
    )
  }

  return <>{children}</>
}

export function ProBadge() {
  return (
    <span style={{
      backgroundColor: 'rgba(251,191,36,0.15)',
      border: '1px solid rgba(251,191,36,0.4)',
      borderRadius: 6,
      padding: '2px 8px',
      fontSize: 10,
      fontWeight: 700,
      color: '#FBBF24',
      letterSpacing: 0.5,
    }}>
      PRO
    </span>
  )
}
