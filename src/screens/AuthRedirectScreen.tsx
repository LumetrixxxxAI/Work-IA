/**
 * AuthRedirectScreen — se carga en Safari (no standalone) cuando el
 * usuario pulsa "Iniciar sesión" desde el PWA instalado en iOS.
 * Hace el signInWithPopup aquí (donde Safari tiene cookies de Google)
 * y tras el éxito cierra la pestaña.
 */
import React, { useEffect, useState } from 'react'
import { signInWithGoogle } from '../services/auth'
import { onAuthChange } from '../services/auth'
import { colors } from '../theme/colors'

export function AuthRedirectScreen() {
  const [status, setStatus] = useState<'waiting' | 'loading' | 'done' | 'error'>('waiting')
  const [error, setError] = useState<string | null>(null)

  // Si ya está autenticado (sesión heredada), cerramos directamente
  useEffect(() => {
    const unsub = onAuthChange((user) => {
      if (user) {
        setStatus('done')
        // Intentar cerrar la pestaña de Safari y volver al PWA
        setTimeout(() => {
          window.close()
          // Si window.close() no funciona (Safari a veces lo bloquea),
          // redirigimos a la app para que el usuario vuelva manualmente
          window.location.href = 'https://work-ia-uqb7.vercel.app'
        }, 1200)
      }
    })
    return unsub
  }, [])

  const handleLogin = async () => {
    setStatus('loading')
    setError(null)
    try {
      await signInWithGoogle()
      // onAuthChange de arriba detectará el usuario y pondrá status='done'
    } catch (e: any) {
      const ignored = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request']
      if (!ignored.includes(e?.code)) {
        setError('No se pudo iniciar sesión. Inténtalo de nuevo.')
      }
      setStatus('waiting')
    }
  }

  const bg: React.CSSProperties = {
    minHeight: '100dvh',
    background: 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '0 32px', gap: 24,
    maxWidth: 430, margin: '0 auto',
  }

  if (status === 'done') {
    return (
      <div style={bg}>
        <span style={{ fontSize: 56 }}>✅</span>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: colors.white, textAlign: 'center', margin: 0 }}>
          ¡Sesión iniciada!
        </h2>
        <p style={{ fontSize: 15, color: colors.muted, textAlign: 'center', margin: 0 }}>
          Vuelve a la app Work IA en tu pantalla de inicio.
        </p>
        <button
          onClick={() => window.close()}
          style={{
            marginTop: 8, padding: '14px 28px', borderRadius: 14,
            background: '#38BDF8', color: '#fff',
            fontSize: 15, fontWeight: 700, border: 'none',
          }}
        >
          Cerrar esta pestaña
        </button>
      </div>
    )
  }

  return (
    <div style={bg}>
      {/* Logo */}
      <div style={{
        width: 72, height: 72, borderRadius: 20, background: '#38BDF8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 40, fontWeight: 900, color: '#fff',
        fontFamily: 'Arial Black, Arial, sans-serif',
        boxShadow: '0 4px 20px rgba(56,189,248,0.4)',
      }}>W</div>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: colors.white, margin: '0 0 8px' }}>
          Iniciar sesión en Work IA
        </h2>
        <p style={{ fontSize: 14, color: colors.muted, margin: 0 }}>
          Selecciona tu cuenta de Google para continuar
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '10px 14px', fontSize: 13,
          color: colors.error, textAlign: 'center', width: '100%',
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleLogin}
        disabled={status === 'loading'}
        style={{
          width: '100%', backgroundColor: colors.white, color: '#1a1a1a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, padding: 16, borderRadius: 14,
          fontSize: 16, fontWeight: 600,
          opacity: status === 'loading' ? 0.7 : 1,
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}
      >
        {status === 'loading' ? (
          <span style={{ color: '#4285F4' }}>Cargando...</span>
        ) : (
          <>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#4285F4' }}>G</span>
            Continuar con Google
          </>
        )}
      </button>

      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
        Tras iniciar sesión, cierra esta pestaña y abre la app.
      </p>
    </div>
  )
}
