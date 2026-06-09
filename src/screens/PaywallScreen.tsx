import React, { useState, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCheckoutSession } from '../services/stripe'
import { colors } from '../theme/colors'

const FREE_FEATURES = [
  '📝 Resúmenes inteligentes',
  '🧮 Resolución de ejercicios',
  '🎓 Explicaciones de clase',
]

const PRO_FEATURES = [
  '📋 Generación de exámenes',
  '✍️ Comentario de texto académico',
  '🗂️ Esquemas y mapas conceptuales',
  '🃏 Flashcards de memorización',
  '✏️ Corrector de redacciones',
  '⚡ 80 consultas al mes',
]

const PREMIUM_EXTRA = [
  '♾️ 300 consultas al mes',
  '🚀 Respuestas prioritarias',
  '⏳ Línea del tiempo visual',
  '🌐 Traductor ES / EN / FR',
]

export function PaywallScreen() {
  const navigate = useNavigate()
  const [proLoading, setProLoading] = useState(false)
  const [premiumLoading, setPremiumLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribePro = async () => {
    setProLoading(true); setError(null)
    try {
      const url = await createCheckoutSession('pro')
      window.location.href = url
    } catch {
      setError('Error al procesar el pago. Inténtalo de nuevo.')
      setProLoading(false)
    }
  }

  const handleSubscribePremium = async () => {
    setPremiumLoading(true); setError(null)
    try {
      const url = await createCheckoutSession('premium')
      window.location.href = url
    } catch {
      setError('Error al procesar el pago. Inténtalo de nuevo.')
      setPremiumLoading(false)
    }
  }

  const bg: CSSProperties = {
    minHeight: '100dvh',
    background: 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)',
    maxWidth: 430,
    margin: '0 auto',
    overflowY: 'auto',
  }

  const featureRow = (text: string, color = 'rgba(255,255,255,0.85)') => (
    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
      <span style={{ fontSize: 15, flexShrink: 0 }}>{text.split(' ')[0]}</span>
      <span style={{ fontSize: 13, color }}>{text.split(' ').slice(1).join(' ')}</span>
    </div>
  )

  return (
    <div style={bg}>
      {/* Header */}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            backgroundColor: colors.glass, border: `1px solid ${colors.glassBorder}`,
            color: colors.white, fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >←</button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: colors.white, margin: 0 }}>
          Desbloquea Work IA
        </h1>
      </div>

      <div style={{ padding: '20px 20px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Incluido gratis */}
        <div style={{
          backgroundColor: colors.glass, border: `1px solid ${colors.glassBorder}`,
          borderRadius: 14, padding: '14px 16px',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: colors.muted, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>
            Gratis — incluido siempre
          </p>
          {FREE_FEATURES.map(f => featureRow(f, 'rgba(255,255,255,0.6)'))}
        </div>

        {/* Plan PRO */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(251,191,36,0.14), rgba(251,191,36,0.05))',
          border: '1.5px solid rgba(251,191,36,0.4)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 16px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#FBBF24', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>
                👑 Pro
              </p>
              <span style={{
                background: 'linear-gradient(135deg,#FBBF24,#F59E0B)',
                color: '#78350F', fontSize: 10, fontWeight: 800,
                padding: '2px 8px', borderRadius: 20, letterSpacing: 0.5,
              }}>MÁS POPULAR</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: colors.white }}>3,99€</span>
              <span style={{ fontSize: 14, color: colors.muted }}>/mes</span>
            </div>
            {PRO_FEATURES.map(f => featureRow(f))}
          </div>
          <div style={{ padding: '0 16px 16px' }}>
            <button
              onClick={handleSubscribePro}
              disabled={proLoading || premiumLoading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
                color: '#1a1a1a', padding: '14px', borderRadius: 12,
                fontSize: 15, fontWeight: 800,
                opacity: (proLoading || premiumLoading) ? 0.6 : 1,
              }}
            >
              {proLoading ? '⏳ Cargando...' : '✨ Suscribirse — 3,99€/mes'}
            </button>
          </div>
        </div>

        {/* Plan PREMIUM */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(168,85,247,0.16), rgba(168,85,247,0.05))',
          border: '1.5px solid rgba(168,85,247,0.45)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 16px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#C084FC', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>
                💎 Premium
              </p>
              <span style={{
                background: 'linear-gradient(135deg,#C084FC,#A855F7)',
                color: '#fff', fontSize: 10, fontWeight: 800,
                padding: '2px 8px', borderRadius: 20, letterSpacing: 0.5,
              }}>NUEVO</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: colors.white }}>6,99€</span>
              <span style={{ fontSize: 14, color: colors.muted }}>/mes</span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(192,132,252,0.8)', margin: '0 0 8px', fontWeight: 600 }}>
              Todo lo del plan Pro, más:
            </p>
            {PREMIUM_EXTRA.map(f => featureRow(f, 'rgba(255,255,255,0.85)'))}
          </div>
          <div style={{ padding: '0 16px 16px' }}>
            <button
              onClick={handleSubscribePremium}
              disabled={proLoading || premiumLoading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #C084FC, #A855F7)',
                color: '#fff', padding: '14px', borderRadius: 12,
                fontSize: 15, fontWeight: 800,
                opacity: (proLoading || premiumLoading) ? 0.6 : 1,
              }}
            >
              {premiumLoading ? '⏳ Cargando...' : '💎 Suscribirse — 6,99€/mes'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '10px 14px', fontSize: 13, color: colors.error,
          }}>
            {error}
          </div>
        )}

        <p style={{ fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
          Pago seguro con Stripe · Cancela cuando quieras desde Ajustes
        </p>
      </div>
    </div>
  )
}
