import React, { useEffect, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscriptionStore } from '../store/subscriptionStore'
import { colors } from '../theme/colors'

export function SuccessScreen() {
  const navigate = useNavigate()
  const { refreshPro } = useSubscriptionStore()

  useEffect(() => {
    // Refrescar el estado Pro desde Firestore tras el pago
    refreshPro().then(() => {
      setTimeout(() => navigate('/home'), 4000)
    })
  }, [])

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
        ¡Bienvenido al Plan Pro!
      </h1>
      <p style={{ fontSize: 16, color: colors.muted, lineHeight: 1.6, maxWidth: 300, margin: 0 }}>
        Tu suscripción está activa. Ahora tienes acceso completo a todas las herramientas.
      </p>
      <div style={{
        backgroundColor: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)',
        borderRadius: 12, padding: '10px 24px', marginTop: 8,
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#FBBF24' }}>
          👑 Plan Pro activo
        </span>
      </div>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '8px 0 0' }}>
        Redirigiendo en unos segundos...
      </p>
      <button
        onClick={() => navigate('/home')}
        style={{
          backgroundColor: colors.blue600, color: colors.white,
          padding: '14px 32px', borderRadius: 14, fontSize: 15, fontWeight: 600, marginTop: 8,
        }}
      >
        Ir al inicio →
      </button>
      <style>{`@keyframes bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }`}</style>
    </div>
  )
}
