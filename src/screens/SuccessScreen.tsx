import React, { useEffect, useState, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscriptionStore } from '../store/subscriptionStore'
import { colors } from '../theme/colors'

export function SuccessScreen() {
  const navigate = useNavigate()
  const { refreshPro, isPro, isPremium } = useSubscriptionStore()
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    // Reintentar hasta 5 veces esperando que el webhook de Stripe actualice Firestore
    const tryRefresh = async () => {
      await refreshPro()
      setAttempts(a => a + 1)
    }

    tryRefresh()
    const interval = setInterval(tryRefresh, 3000)
    const timeout = setTimeout(() => {
      clearInterval(interval)
      navigate('/home')
    }, 15000)

    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [])

  // Navegar en cuanto detecte el plan activo
  useEffect(() => {
    if (attempts > 0 && isPro) {
      setTimeout(() => navigate('/home'), 2000)
    }
  }, [isPro, attempts])

  const isPremiumPlan = isPremium
  const planLabel = isPremiumPlan ? '💎 Plan Premium activo' : '👑 Plan Pro activo'
  const planColor = isPremiumPlan ? '#C084FC' : '#FBBF24'
  const planBg = isPremiumPlan ? 'rgba(168,85,247,0.12)' : 'rgba(251,191,36,0.12)'
  const planBorder = isPremiumPlan ? 'rgba(168,85,247,0.3)' : 'rgba(251,191,36,0.3)'
  const planTitle = isPremiumPlan ? '¡Bienvenido al Plan Premium!' : '¡Bienvenido al Plan Pro!'

  const bg: CSSProperties = {
    minHeight: '100dvh',
    background: 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', textAlign: 'center', padding: '0 24px',
    maxWidth: 430, margin: '0 auto', gap: 16,
  }

  return (
    <div style={bg}>
      <div style={{ fontSize: 80, marginBottom: 8, animation: 'bounce 0.6s ease' }}>🎉</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: colors.white, margin: 0 }}>
        {isPro ? planTitle : '¡Pago completado!'}
      </h1>
      <p style={{ fontSize: 16, color: colors.muted, lineHeight: 1.6, maxWidth: 300, margin: 0 }}>
        {isPro
          ? 'Tu suscripción está activa. Ahora tienes acceso completo a todas las herramientas.'
          : 'Estamos activando tu plan, espera un momento...'}
      </p>
      {isPro && (
        <div style={{
          backgroundColor: planBg, border: `1px solid ${planBorder}`,
          borderRadius: 12, padding: '10px 24px', marginTop: 8,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: planColor }}>
            {planLabel}
          </span>
        </div>
      )}
      {!isPro && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: colors.muted, fontSize: 13 }}>
          <div style={{
            width: 16, height: 16, border: `2px solid ${colors.blue400}`,
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', flexShrink: 0,
          }} />
          Activando tu plan...
        </div>
      )}
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '8px 0 0' }}>
        Redirigiendo en unos segundos...
      </p>
      <button
        onClick={() => navigate('/home')}
        style={{
          backgroundColor: colors.blue600, color: colors.white,
          padding: '14px 32px', borderRadius: 14, fontSize: 15, fontWeight: 600, marginTop: 8,
          border: 'none', cursor: 'pointer',
        }}
      >
        Ir al inicio →
      </button>
      <style>{`
        @keyframes bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
