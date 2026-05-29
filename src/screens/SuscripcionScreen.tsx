import React, { useState } from 'react'
import { Layout } from '../components/Layout'
import { useSubscriptionStore } from '../store/subscriptionStore'
import { createCheckoutSession, createPortalSession } from '../services/stripe'
import { colors } from '../theme/colors'

const FREE_FEATURES = [
  { icon: '📝', text: 'Resúmenes de apuntes y PDFs' },
  { icon: '🧮', text: 'Resolución de ejercicios' },
  { icon: '🎓', text: 'Explicaciones de clase' },
  { icon: '📊', text: '3 consultas/día · 20/mes' },
]

const PRO_FEATURES = [
  { icon: '📋', text: 'Generación de exámenes' },
  { icon: '✍️', text: 'Comentario de texto académico' },
  { icon: '🗂️', text: 'Esquemas y mapas conceptuales' },
  { icon: '🃏', text: 'Flashcards de memorización' },
  { icon: '✏️', text: 'Corrector de redacciones' },
  { icon: '⚡', text: '80 consultas al mes' },
]

const PREMIUM_FEATURES = [
  { icon: '🔥', text: 'Todo lo del plan Pro' },
  { icon: '💬', text: 'Chat con IA (próximamente)' },
  { icon: '🎯', text: 'Simulador de examen (próximamente)' },
  { icon: '🌍', text: 'Traductor de apuntes (próximamente)' },
  { icon: '♾️', text: 'Uso ilimitado — 300 consultas/mes' },
  { icon: '⚡', text: 'Respuestas prioritarias' },
]

function PlanCard({ title, price, period, features, color, bg, border, badge, ctaLabel, ctaColor, ctaBg, onCta, loading, disabled, current }: {
  title: string; price: string; period: string
  features: { icon: string; text: string }[]
  color: string; bg: string; border: string
  badge?: string; ctaLabel: string
  ctaColor: string; ctaBg: string
  onCta?: () => void; loading?: boolean
  disabled?: boolean; current?: boolean
}) {
  return (
    <div style={{
      background: bg, border: `1.5px solid ${border}`,
      borderRadius: 20, overflow: 'hidden', marginBottom: 16,
      position: 'relative',
    }}>
      {badge && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: ctaBg, color: ctaColor,
          fontSize: 10, fontWeight: 800, padding: '3px 10px',
          borderRadius: 20, letterSpacing: 0.5,
        }}>{badge}</div>
      )}
      {current && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(255,255,255,0.15)', color: colors.white,
          fontSize: 10, fontWeight: 700, padding: '3px 10px',
          borderRadius: 20,
        }}>ACTUAL</div>
      )}

      {/* Header */}
      <div style={{ padding: '20px 20px 14px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 8px' }}>
          {title}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 36, fontWeight: 800, color: colors.white }}>{price}</span>
          <span style={{ fontSize: 14, color: colors.muted }}>{period}</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: border, margin: '0 20px' }} />

      {/* Features */}
      <div style={{ padding: '14px 20px 16px' }}>
        {features.map(f => (
          <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{f.icon}</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{f.text}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      {onCta && (
        <div style={{ padding: '0 20px 20px' }}>
          <button
            onClick={onCta}
            disabled={loading || disabled}
            style={{
              width: '100%', background: ctaBg, color: ctaColor,
              padding: '14px', borderRadius: 12,
              fontSize: 15, fontWeight: 700,
              opacity: (loading || disabled) ? 0.6 : 1,
              border: 'none',
            }}
          >
            {loading ? '⏳ Cargando...' : ctaLabel}
          </button>
        </div>
      )}
    </div>
  )
}

export function SuscripcionScreen() {
  const { isPro, isPremium, refreshPro } = useSubscriptionStore()
  const [proLoading, setProLoading] = useState(false)
  const [premiumLoading, setPremiumLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribePro = async () => {
    setProLoading(true); setError(null)
    try {
      const url = await createCheckoutSession()
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

  const currentPlan = isPremium ? 'premium' : isPro ? 'pro' : 'free'

  return (
    <Layout>
      <div style={{
        minHeight: '100%',
        background: 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)',
        padding: '0 20px 32px',
      }}>
        {/* Header */}
        <div style={{ paddingTop: 20, paddingBottom: 16, borderBottom: `1px solid ${colors.glassBorder}`, marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: colors.white, margin: 0 }}>Planes</h1>
          <p style={{ fontSize: 13, color: colors.muted, margin: '4px 0 0' }}>
            Plan actual: <span style={{ fontWeight: 700, color: isPremium ? '#C084FC' : isPro ? '#FBBF24' : colors.blue400 }}>
              {isPremium ? '💎 Premium' : isPro ? '👑 Pro' : '🆓 Gratuito'}
            </span>
          </p>
        </div>

        {/* Plan FREE */}
        <PlanCard
          title="Gratuito"
          price="0€"
          period="/mes"
          features={FREE_FEATURES}
          color="rgba(255,255,255,0.5)"
          bg="rgba(255,255,255,0.04)"
          border="rgba(255,255,255,0.1)"
          ctaLabel="Plan actual"
          ctaColor="rgba(255,255,255,0.5)"
          ctaBg="rgba(255,255,255,0.08)"
          current={currentPlan === 'free'}
          disabled
        />

        {/* Plan PRO */}
        <PlanCard
          title="👑 Pro"
          price="3,99€"
          period="/mes"
          features={PRO_FEATURES}
          color="#FBBF24"
          bg="linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.04))"
          border="rgba(251,191,36,0.35)"
          badge={currentPlan === 'free' ? 'MÁS POPULAR' : undefined}
          ctaLabel={currentPlan === 'pro' ? '⚙️ Gestionar suscripción' : currentPlan === 'premium' ? '↓ Cambiar a Pro' : '✨ Suscribirse — 3,99€/mes'}
          ctaColor="#1a1a1a"
          ctaBg="linear-gradient(135deg, #FBBF24, #F59E0B)"
          onCta={currentPlan === 'pro' ? handlePortal : currentPlan === 'free' ? handleSubscribePro : undefined}
          loading={currentPlan === 'pro' ? portalLoading : proLoading}
          current={currentPlan === 'pro'}
          disabled={currentPlan === 'premium'}
        />

        {/* Plan PREMIUM */}
        <PlanCard
          title="💎 Premium"
          price="6,99€"
          period="/mes"
          features={PREMIUM_FEATURES}
          color="#C084FC"
          bg="linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))"
          border="rgba(168,85,247,0.4)"
          badge="NUEVO"
          ctaLabel={currentPlan === 'premium' ? '⚙️ Gestionar suscripción' : '💎 Suscribirse — 6,99€/mes'}
          ctaColor="#1a1a1a"
          ctaBg="linear-gradient(135deg, #C084FC, #A855F7)"
          onCta={currentPlan === 'premium' ? handlePortal : handleSubscribePremium}
          loading={currentPlan === 'premium' ? portalLoading : premiumLoading}
          current={currentPlan === 'premium'}
        />

        {error && (
          <div style={{
            backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '10px 14px', fontSize: 13, color: colors.error, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <p style={{ fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
          Pago seguro con Stripe · Cancela cuando quieras
        </p>
      </div>
    </Layout>
  )
}
