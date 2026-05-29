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
  '👑 Todo lo del plan gratuito',
  '📋 Generación de exámenes',
  '✍️ Comentario de texto académico',
  '🗂️ Esquemas y mapas conceptuales',
  '🃏 Flashcards de memorización',
  '✏️ Corrector de redacciones',
  '⚡ Prioridad en respuestas',
  '🎯 Sin límites en el uso',
]

export function PaywallScreen() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = await createCheckoutSession()
      window.location.href = url
    } catch {
      setError('Error al procesar el pago. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  const bg: CSSProperties = {
    minHeight: '100dvh',
    background: 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)',
    maxWidth: 430,
    margin: '0 auto',
    overflowY: 'auto',
  }

  const featureItem = (text: string, isPro = false) => (
    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{text.split(' ')[0]}</span>
      <span style={{ fontSize: 14, color: isPro ? colors.white : 'rgba(255,255,255,0.7)' }}>
        {text.split(' ').slice(1).join(' ')}
      </span>
      {isPro && <span style={{ marginLeft: 'auto', color: colors.success, fontWeight: 700, fontSize: 12 }}>✓</span>}
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
            color: colors.white, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ←
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: colors.white, margin: 0 }}>Plan Pro</h1>
      </div>

      <div style={{ padding: '24px 20px 48px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👑</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: colors.white, margin: '0 0 8px' }}>
            Desbloquea todo Work IA
          </h2>
          <p style={{ fontSize: 15, color: colors.muted, lineHeight: 1.5 }}>
            Accede a todas las herramientas de IA para estudiar mejor
          </p>
        </div>

        {/* Price card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))',
          border: '1.5px solid rgba(251,191,36,0.4)',
          borderRadius: 20,
          padding: '24px 20px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 13, color: '#FBBF24', fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>
            Plan Pro Mensual
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
            <span style={{ fontSize: 42, fontWeight: 800, color: colors.white }}>3,99€</span>
            <span style={{ fontSize: 16, color: colors.muted }}>/mes</span>
          </div>
          <p style={{ fontSize: 13, color: colors.muted, margin: '4px 0 0' }}>Cancela cuando quieras</p>
        </div>

        {/* Comparison */}
        <div style={{
          backgroundColor: colors.glass,
          border: `1px solid ${colors.glassBorder}`,
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          {/* Free column */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.glassBorder}` }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: colors.muted, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 1 }}>
              Gratuito (incluido)
            </p>
            {FREE_FEATURES.map(f => featureItem(f))}
          </div>
          {/* Pro column */}
          <div style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#FBBF24', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 1 }}>
              Pro — todo lo anterior más:
            </p>
            {PRO_FEATURES.map(f => featureItem(f, true))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '10px 14px', fontSize: 13, color: colors.error,
          }}>
            {error}
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? 'rgba(251,191,36,0.5)' : 'linear-gradient(135deg, #FBBF24, #F59E0B)',
            color: '#1a1a1a',
            padding: '18px',
            borderRadius: 16,
            fontSize: 17,
            fontWeight: 800,
            boxShadow: '0 8px 24px rgba(251,191,36,0.25)',
            transition: 'opacity 0.15s',
          }}
        >
          {loading ? '⏳ Cargando...' : '✨ Suscribirse por 3,99€/mes'}
        </button>

        <p style={{ fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
          Pago seguro con Stripe · Cancela cuando quieras desde Ajustes
        </p>
      </div>
    </div>
  )
}
