import React, { useState, useEffect, CSSProperties } from 'react'
import { signInWithGoogle, handleRedirectResult } from '../services/auth'
import { colors } from '../theme/colors'

export function LoginScreen() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    handleRedirectResult()
      .catch((e) => {
        if (e?.code !== 'auth/null-user') {
          setError('Error al iniciar sesión. Inténtalo de nuevo.')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
      // Si usó redirect, la página se recarga sola — no llegamos aquí
      // Si usó popup (iOS/escritorio), el onAuthStateChanged dispara y carga la app
    } catch (e: unknown) {
      const err = e as { code?: string }
      const ignoredCodes = [
        'auth/popup-closed-by-user',
        'auth/cancelled-popup-request',
        'auth/user-cancelled',
      ]
      if (!ignoredCodes.includes(err?.code ?? '')) {
        setError('No se pudo iniciar sesión. Inténtalo de nuevo.')
      }
      setLoading(false)
    }
  }

  const bg: CSSProperties = {
    minHeight: '100dvh',
    background: 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0 24px',
    maxWidth: 430,
    margin: '0 auto',
  }

  return (
    <div style={bg}>
      {/* Logo */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 16 }}>
        <div style={{
          width: 88, height: 88, borderRadius: 24,
          background: '#38BDF8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 48, fontWeight: 900, color: '#fff',
          fontFamily: 'Arial Black, Arial, sans-serif',
          boxShadow: '0 4px 24px rgba(56,189,248,0.45)',
        }}>W</div>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: colors.white, margin: 0 }}>Work IA</h1>
        <p style={{ fontSize: 16, color: colors.muted, margin: 0, textAlign: 'center' }}>
          Tu asistente de estudio con IA
        </p>
      </div>

      {/* Features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {[
          { icon: '📝', text: 'Resúmenes inteligentes de apuntes y PDFs' },
          { icon: '🧮', text: 'Resolución de ejercicios paso a paso' },
          { icon: '🎓', text: 'Explicaciones de clase personalizadas' },
          { icon: '📋', text: 'Generación de exámenes y flashcards' },
        ].map((f) => (
          <div key={f.text} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            backgroundColor: colors.glass, border: `1px solid ${colors.glassBorder}`,
            borderRadius: 12, padding: '12px 16px',
          }}>
            <span style={{ fontSize: 20 }}>{f.icon}</span>
            <span style={{ fontSize: 14, color: colors.white, fontWeight: 500 }}>{f.text}</span>
          </div>
        ))}
      </div>

      {/* Login */}
      <div style={{ paddingBottom: 48, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && (
          <div style={{
            backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '10px 14px', fontSize: 13, color: colors.error, textAlign: 'center',
          }}>
            {error}
          </div>
        )}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            backgroundColor: colors.white,
            color: '#1a1a1a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, padding: '16px', borderRadius: 14,
            fontSize: 16, fontWeight: 600,
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          }}
        >
          {loading ? (
            <span style={{ color: '#4285F4' }}>Cargando...</span>
          ) : (
            <>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#4285F4' }}>G</span>
              Continuar con Google
            </>
          )}
        </button>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 1.7, margin: 0 }}>
          Al continuar aceptas nuestros{' '}
          <span
            onClick={() => window.open('mailto:lumetrixxx@gmail.com', '_blank')}
            style={{ color: colors.blue400, textDecoration: 'underline', cursor: 'pointer' }}
          >Términos de Uso</span>
          {' '}y{' '}
          <span
            onClick={() => window.open('mailto:lumetrixxx@gmail.com', '_blank')}
            style={{ color: colors.blue400, textDecoration: 'underline', cursor: 'pointer' }}
          >Política de Privacidad</span>
        </p>
      </div>
    </div>
  )
}
