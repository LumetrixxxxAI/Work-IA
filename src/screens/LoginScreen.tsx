import React, { useState, useEffect, CSSProperties } from 'react'
import {
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth'
import { auth } from '../services/firebase'
import { signInWithGoogle, handleRedirectResult, isIOS, isStandalone } from '../services/auth'
import { colors } from '../theme/colors'

const IOS_PWA = isIOS && isStandalone
const TOKEN_KEY = 'work_ia_ios_credential'

export function LoginScreen() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [iosPending, setIosPending] = useState(false)

  useEffect(() => {
    if (!IOS_PWA) {
      // No iOS: manejar redirect normal
      setLoading(true)
      handleRedirectResult()
        .catch((e) => {
          if (e?.code !== 'auth/null-user') {
            setError('Error al iniciar sesión. Inténtalo de nuevo.')
          }
        })
        .finally(() => setLoading(false))
      return
    }

    // iOS PWA: intentar usar el token guardado por AuthRedirectScreen en Safari
    const tryStoredCredential = async () => {
      const raw = localStorage.getItem(TOKEN_KEY)
      if (!raw) return
      try {
        const { accessToken, idToken, ts } = JSON.parse(raw)
        // Solo válido si tiene menos de 5 minutos
        if (Date.now() - ts > 5 * 60 * 1000) {
          localStorage.removeItem(TOKEN_KEY)
          return
        }
        setLoading(true)
        const credential = GoogleAuthProvider.credential(idToken, accessToken)
        await signInWithCredential(auth, credential)
        localStorage.removeItem(TOKEN_KEY)
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        setLoading(false)
      }
    }

    tryStoredCredential()

    // Escuchar si Safari escribe el token mientras el PWA está abierto
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY && e.newValue) tryStoredCredential()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
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

        {/* iOS PWA: link directo que iOS abre en Safari (window.open queda bloqueado) */}
        {IOS_PWA ? (
          <>
            {loading ? (
              <div style={{
                backgroundColor: colors.white, color: '#4285F4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: 16, borderRadius: 14,
                fontSize: 16, fontWeight: 600,
                boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
              }}>
                Iniciando sesión…
              </div>
            ) : (
              <a
                href="https://work-ia-uqb7.vercel.app/#/auth-login"
                target="_blank"
                rel="noreferrer"
                onClick={() => setIosPending(true)}
                style={{
                  backgroundColor: colors.white, color: '#1a1a1a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 10, padding: 16, borderRadius: 14,
                  fontSize: 16, fontWeight: 600, textDecoration: 'none',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 800, color: '#4285F4' }}>G</span>
                Iniciar sesión con Google
              </a>
            )}
            {iosPending && !loading && (
              <div style={{
                background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)',
                borderRadius: 12, padding: '12px 14px', fontSize: 13,
                color: '#7DD3FC', textAlign: 'center', lineHeight: 1.8,
              }}>
                <strong style={{ color: '#38BDF8', fontSize: 14 }}>Se ha abierto Safari 🌐</strong><br />
                1. Elige tu cuenta de Google<br />
                2. Cuando veas ✅, <strong style={{ color: '#fff' }}>vuelve aquí</strong><br />
                La app entrará sola automáticamente.
              </div>
            )}
          </>
        ) : (
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              backgroundColor: colors.white, color: '#1a1a1a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 10, padding: 16, borderRadius: 14,
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
        )}

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
