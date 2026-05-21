import React, { useState } from 'react'
import { Layout } from '../components/Layout'
import { useSubscriptionStore } from '../store/subscriptionStore'
import { createCheckoutSession, createPortalSession } from '../services/stripe'
import { colors } from '../theme/colors'

const FREE_FEATURES = [
  { icon: '📝', text: 'Resúmenes de apuntes y PDFs' },
  { icon: '🧮', text: 'Resolución de ejercicios paso a paso' },
  { icon: '🎓', text: 'Explicaciones de clase con IA' },
]

const PRO_FEATURES = [
  { icon: '📋', text: 'Generación de exámenes' },
  { icon: '✍️', text: 'Comentario de texto académico' },
  { icon: '🗂️', text: 'Esquemas y mapas conceptuales' },
  { icon: '🃏', text: 'Flashcards de memorización' },
  { icon: '✏️', text: 'Corrector de redacciones' },
  { icon: '⚡', text: 'Sin límites en el uso' },
]

export function SuscripcionScreen() {
  const { isPro, refreshPro } = useSubscriptionStore()
  const [loading, setLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
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

  const handlePortal = async () => {
    setPortalLoading(true)
    try {
      const url = await createPortalSession()
      window.location.href = url
    } catch {
      setError('Error al abrir el portal. Inténtalo de nuevo.')
      setPortalLoading(false)
    }
  }

  return (
    <Layout>
      <div style={{
        minHeight: '100%',
        background: 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)',
        padding: '0 20px 32px',
      }}>
        {/* Header */}
        <div style={{ paddingTop: 20, paddingBottom: 16, borderBottom: `1px solid ${colors.glassBorder}`, marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: colors.white, margin: 0 }}>👑 Suscripción</h1>
        </div>

        {isPro ? (
          /* ── PRO ACTIVO ── */
          <>
            <div style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(251,191,36,0.06))',
              border: '1.5px solid rgba(251,191,36,0.45)',
              borderRadius: 20, padding: '24px 20px', textAlign: 'center', marginBottom: 24,
            }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>👑</div>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#FBBF24', margin: '0 0 6px' }}>Plan Pro activo</p>
              <p style={{ fontSize: 14, color: colors.muted, margin: 0 }}>Tienes acceso completo a todas las herramientas</p>
            </div>

            <div style={{ backgroundColor: colors.glass, border: `1px solid ${colors.glassBorder}`, borderRadius: 16, padding: '16px 20px', marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#FBBF24', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 14px' }}>
                Incluido en tu plan
              </p>
              {[...FREE_FEATURES, ...PRO_FEATURES].map(f => (
                <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{f.icon}</span>
                  <span style={{ fontSize: 14, color: colors.white }}>{f.text}</span>
                  <span style={{ marginLeft: 'auto', color: colors.success, fontWeight: 700, fontSize: 13 }}>✓</span>
                </div>
              ))}
            </div>

            <button
              onClick={handlePortal}
              disabled={portalLoading}
              style={{
                width: '100%',
                backgroundColor: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
                color: '#FBBF24', padding: 14, borderRadius: 14,
                fontSize: 15, fontWeight: 600, opacity: portalLoading ? 0.6 : 1,
              }}
            >
              {portalLoading ? 'Cargando...' : '⚙️ Gestionar suscripción'}
            </button>
          </>
        ) : (
          /* ── PLAN GRATUITO → VENTA ── */
          <>
            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>👑</div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: colors.white, margin: '0 0 8px' }}>
                Desbloquea todo Work IA
              </h2>
              <p style={{ fontSize: 15, color: colors.muted, lineHeight: 1.5, margin: 0 }}>
                Accede a todas las herramientas de IA y estudia sin límites
              </p>
            </div>

            {/* Price */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))',
              border: '1.5px solid rgba(251,191,36,0.4)',
              borderRadius: 20, padding: '22px 20px', textAlign: 'center', marginBottom: 20,
            }}>
              <p style={{ fontSize: 12, color: '#FBBF24', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>
                Plan Pro Mensual
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 44, fontWeight: 800, color: colors.white }}>3,99€</span>
                <span style={{ fontSize: 16, color: colors.muted }}>/mes</span>
              </div>
              <p style={{ fontSize: 13, color: colors.muted, margin: 0 }}>Cancela cuando quieras</p>
            </div>

            {/* Features comparison */}
            <div style={{ backgroundColor: colors.glass, border: `1px solid ${colors.glassBorder}`, borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${colors.glassBorder}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>
                  Gratis — siempre incluido
                </p>
                {FREE_FEATURES.map(f => (
                  <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{f.icon}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{f.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '14px 18px' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#FBBF24', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>
                  Pro — todo lo anterior más:
                </p>
                {PRO_FEATURES.map(f => (
                  <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{f.icon}</span>
                    <span style={{ fontSize: 13, color: colors.white }}>{f.text}</span>
                    <span style={{ marginLeft: 'auto', color: '#FBBF24', fontWeight: 700, fontSize: 13 }}>✓</span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div style={{
                backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10, padding: '10px 14px', fontSize: 13, color: colors.error, marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleSubscribe}
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'rgba(251,191,36,0.5)' : 'linear-gradient(135deg, #FBBF24, #F59E0B)',
                color: '#1a1a1a', padding: 18, borderRadius: 16,
                fontSize: 17, fontWeight: 800,
                boxShadow: '0 8px 24px rgba(251,191,36,0.25)',
                marginBottom: 12,
              }}
            >
              {loading ? '⏳ Cargando...' : '✨ Suscribirse por 3,99€/mes'}
            </button>

            <p style={{ fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
              Pago seguro con Stripe · Cancela cuando quieras
            </p>
          </>
        )}
      </div>
    </Layout>
  )
}
