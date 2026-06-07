import React, { CSSProperties } from 'react'
import { HashRouter as BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { LoginScreen } from './screens/LoginScreen'
import { TermsModal } from './components/TermsModal'
import { HomeScreen } from './screens/HomeScreen'
import { ResumenScreen } from './screens/ResumenScreen'
import { EjerciciosScreen } from './screens/EjerciciosScreen'
import { ClaseScreen } from './screens/ClaseScreen'
import { ExamenScreen } from './screens/ExamenScreen'
import { ComentarioScreen } from './screens/ComentarioScreen'
import { EsquemaScreen } from './screens/EsquemaScreen'
import { FlashcardsScreen } from './screens/FlashcardsScreen'
import { CorrectorScreen } from './screens/CorrectorScreen'
import { HistorialScreen } from './screens/HistorialScreen'
import { AjustesScreen } from './screens/AjustesScreen'
import { PaywallScreen } from './screens/PaywallScreen'
import { SuscripcionScreen } from './screens/SuscripcionScreen'
import { SuccessScreen } from './screens/SuccessScreen'
import { colors } from './theme/colors'

const BG = 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)'

function Splash() {
  const s: CSSProperties = {
    minHeight: '100dvh',
    background: BG,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 16,
  }
  return (
    <div style={s}>
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        background: '#38BDF8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 44, fontWeight: 900, color: '#fff',
        fontFamily: 'Arial Black, Arial, sans-serif',
        boxShadow: '0 4px 24px rgba(56,189,248,0.45)',
      }}>W</div>
      <p style={{ fontSize: 24, fontWeight: 800, color: colors.white }}>Work IA</p>
      <div style={{ marginTop: 8 }}>
        <div style={{
          width: 32, height: 32, border: `3px solid ${colors.blue400}`,
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-root page-enter" style={{ height: '100%' }}>
      <Routes location={location}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/resumen" element={<ResumenScreen />} />
        <Route path="/ejercicios" element={<EjerciciosScreen />} />
        <Route path="/clase" element={<ClaseScreen />} />
        <Route path="/examen" element={<ExamenScreen />} />
        <Route path="/comentario" element={<ComentarioScreen />} />
        <Route path="/esquema" element={<EsquemaScreen />} />
        <Route path="/flashcards" element={<FlashcardsScreen />} />
        <Route path="/corrector" element={<CorrectorScreen />} />
        <Route path="/historial" element={<HistorialScreen />} />
        <Route path="/ajustes" element={<AjustesScreen />} />
        <Route path="/suscripcion" element={<SuscripcionScreen />} />
        <Route path="/paywall" element={<PaywallScreen />} />
        <Route path="/success" element={<SuccessScreen />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  )
}

export function App() {
  const { authState, firebaseUser, acceptTerms } = useAuth()

  if (authState === 'loading') return <Splash />
  if (authState === 'unauthenticated') return <LoginScreen />

  if (authState === 'needs-terms' && firebaseUser) {
    return (
      <TermsModal
        uid={firebaseUser.uid}
        onAccepted={acceptTerms}
      />
    )
  }

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
