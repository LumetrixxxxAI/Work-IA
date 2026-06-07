import React, { useState, CSSProperties } from 'react'
import { Layout } from '../components/Layout'
import { useUser } from '../hooks/useUser'
import { useSubscriptionStore } from '../store/subscriptionStore'
import { signOut } from '../services/auth'
import { createPortalSession } from '../services/stripe'
import { colors } from '../theme/colors'

const CURSOS = [
  { value: 'eso1', label: '1º ESO' },
  { value: 'eso2', label: '2º ESO' },
  { value: 'eso3', label: '3º ESO' },
  { value: 'eso4', label: '4º ESO' },
  { value: 'bach1', label: '1º Bach.' },
  { value: 'bach2', label: '2º Bach.' },
  { value: 'fp_basica', label: 'FP Básica' },
  { value: 'fp_medio', label: 'FP Medio' },
  { value: 'fp_superior', label: 'FP Superior' },
]

const LABEL: CSSProperties = {
  fontSize: 12, fontWeight: 600, color: colors.blue200,
  textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, display: 'block',
}
const SECTION: CSSProperties = { marginBottom: 20 }

export function AjustesScreen() {
  const { user, updateProfile } = useUser()
  const { isPro, isPremium } = useSubscriptionStore()
  const [nombre, setNombre] = useState(user?.nombre ?? user?.displayName ?? '')
  const [curso, setCurso] = useState(user?.curso ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  const initial = (nombre || user?.displayName || 'U')[0].toUpperCase()

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({ nombre, curso })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      alert('Error al guardar. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      signOut()
    }
  }

  // Solo tiene portal real quien pagó con Stripe (tiene stripeCustomerId)
  const hasStripeSubscription = !!(user as any)?.stripeCustomerId

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const url = await createPortalSession()
      window.location.href = url
    } catch {
      alert('Error al abrir el portal. Inténtalo de nuevo.')
      setPortalLoading(false)
    }
  }

  const bg: CSSProperties = {
    minHeight: '100%',
    background: 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)',
    padding: '0 20px 20px',
  }

  const inputStyle: CSSProperties = {
    width: '100%',
    backgroundColor: colors.glass,
    border: `1px solid ${colors.glassBorder}`,
    borderRadius: 12,
    padding: '12px 14px',
    color: colors.white,
    fontSize: 15,
    boxSizing: 'border-box',
  }

  return (
    <Layout>
      <div style={bg}>
        {/* Header */}
        <div style={{ paddingTop: 20, paddingBottom: 16, borderBottom: `1px solid ${colors.glassBorder}`, marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: colors.white, margin: 0 }}>⚙️ Ajustes</h1>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28, gap: 8 }}>
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              style={{ width: 80, height: 80, borderRadius: '50%', border: `3px solid ${colors.blue400}` }}
            />
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              backgroundColor: colors.blue600, border: `3px solid ${colors.blue400}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 700, color: colors.white,
            }}>
              {initial}
            </div>
          )}
          <p style={{ fontSize: 14, color: colors.muted, margin: 0 }}>{user?.email}</p>
          {isPremium ? (
            <span style={{
              backgroundColor: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.35)',
              borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, color: '#C084FC',
            }}>
              💎 Plan Premium activo
            </span>
          ) : isPro ? (
            <span style={{
              backgroundColor: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)',
              borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, color: '#FBBF24',
            }}>
              👑 Plan Pro activo
            </span>
          ) : (
            <span style={{
              backgroundColor: colors.glass, border: `1px solid ${colors.glassBorder}`,
              borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600, color: colors.muted,
            }}>
              Plan Gratuito
            </span>
          )}
        </div>

        {/* Nombre */}
        <div style={SECTION}>
          <span style={LABEL}>Nombre</span>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            style={inputStyle}
          />
        </div>

        {/* Email (readonly) */}
        <div style={SECTION}>
          <span style={LABEL}>Email</span>
          <div style={{ ...inputStyle, color: colors.muted }}>{user?.email}</div>
        </div>

        {/* Curso */}
        <div style={SECTION}>
          <span style={LABEL}>Curso</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CURSOS.map((c) => (
              <button
                key={c.value}
                onClick={() => setCurso(c.value)}
                style={{
                  padding: '8px 14px', borderRadius: 20,
                  border: curso === c.value ? `1.5px solid ${colors.blue400}` : `1px solid ${colors.glassBorder}`,
                  backgroundColor: curso === c.value ? 'rgba(96,165,250,0.15)' : colors.glass,
                  color: curso === c.value ? colors.blue400 : colors.muted,
                  fontSize: 13, fontWeight: curso === c.value ? 600 : 500,
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', backgroundColor: saved ? colors.success : colors.blue600,
            color: colors.white, padding: 14, borderRadius: 14,
            fontSize: 15, fontWeight: 700, marginBottom: 12,
            opacity: saving ? 0.6 : 1, transition: 'background 0.3s',
          }}
        >
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>

        {/* Gestionar suscripción — solo si tiene suscripción real de Stripe */}
        {(isPro || isPremium) && hasStripeSubscription && (
          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            style={{
              width: '100%',
              backgroundColor: isPremium ? 'rgba(168,85,247,0.1)' : 'rgba(251,191,36,0.1)',
              border: `1px solid ${isPremium ? 'rgba(168,85,247,0.35)' : 'rgba(251,191,36,0.3)'}`,
              color: isPremium ? '#C084FC' : '#FBBF24',
              padding: 14, borderRadius: 14,
              fontSize: 15, fontWeight: 600, marginBottom: 12,
              opacity: portalLoading ? 0.6 : 1,
            }}
          >
            {portalLoading ? 'Abriendo...' : '⚙️ Gestionar suscripción'}
          </button>
        )}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.4)',
            color: colors.error, padding: 14, borderRadius: 14,
            fontSize: 15, fontWeight: 600, marginTop: 4,
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </Layout>
  )
}
