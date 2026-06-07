import React, { useState, CSSProperties } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useUserStore } from '../store/userStore'
import { colors } from '../theme/colors'

interface Props {
  uid: string
  onAccepted: () => void
}

const BG: CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 9999,
  background: 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)',
  display: 'flex', flexDirection: 'column',
  maxWidth: 430, margin: '0 auto',
}

const SECTION_TITLE: CSSProperties = {
  fontSize: 13, fontWeight: 700, color: '#38BDF8',
  marginBottom: 6, marginTop: 18,
}

const BODY: CSSProperties = {
  fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7,
}

export function TermsModal({ uid, onAccepted }: Props) {
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, loadProfile } = useUserStore()

  const handleAccept = async () => {
    if (!checked) return
    setLoading(true)
    try {
      await setDoc(doc(db, 'users', uid), {
        termsAccepted: true,
        termsAcceptedAt: serverTimestamp(),
      }, { merge: true })
      // Recargar perfil → actualiza el store → App re-renderiza y entra
      await loadProfile(uid)
      onAccepted()
    } catch (e) {
      console.error('Error aceptando términos:', e)
      setLoading(false)
    }
  }

  return (
    <div style={BG}>
      {/* Header fijo */}
      <div style={{
        padding: '24px 20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: '#38BDF8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 900, color: '#fff',
            fontFamily: 'Arial Black, Arial, sans-serif',
          }}>W</div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: colors.white, margin: 0 }}>
              Bienvenido a Work IA
            </h1>
            <p style={{ fontSize: 12, color: colors.muted, margin: 0 }}>
              Antes de continuar, lee y acepta nuestros términos
            </p>
          </div>
        </div>
      </div>

      {/* Contenido scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>

        {/* TÉRMINOS DE USO */}
        <p style={{ ...SECTION_TITLE, marginTop: 20, fontSize: 15 }}>📋 Términos de Uso</p>

        <p style={BODY}>
          Work IA es una aplicación de herramientas de estudio con inteligencia artificial, desarrollada por <strong style={{ color: colors.white }}>Lumetrix AI</strong>. Al usar la aplicación aceptas las siguientes condiciones:
        </p>

        <p style={SECTION_TITLE}>1. Uso permitido</p>
        <p style={BODY}>
          Work IA está diseñada exclusivamente para uso educativo personal. Está prohibido usar la aplicación para generar contenido fraudulento, engañoso o que infrinja derechos de terceros.
        </p>

        <p style={SECTION_TITLE}>2. Límites de uso</p>
        <p style={BODY}>
          El plan gratuito incluye 3 consultas diarias y 20 mensuales. Los planes de pago (Pro y Premium) amplían estos límites según lo indicado en la pantalla de suscripción. Lumetrix AI se reserva el derecho de modificar los límites con previo aviso.
        </p>

        <p style={SECTION_TITLE}>3. Pagos y cancelación</p>
        <p style={BODY}>
          Los planes de pago se facturan mensualmente a través de Stripe. Puedes cancelar tu suscripción en cualquier momento desde la sección Ajustes → Gestionar suscripción. No se realizan reembolsos por el período en curso salvo exigencia legal.
        </p>

        <p style={SECTION_TITLE}>4. Responsabilidad</p>
        <p style={BODY}>
          Las respuestas generadas por la IA son orientativas. Work IA no se hace responsable del uso que el usuario haga de los contenidos generados. Se recomienda siempre contrastar la información con fuentes académicas oficiales.
        </p>

        <p style={SECTION_TITLE}>5. Modificaciones</p>
        <p style={BODY}>
          Lumetrix AI puede actualizar estos términos en cualquier momento. Se notificará a los usuarios de cambios relevantes a través de la aplicación.
        </p>

        {/* POLÍTICA DE PRIVACIDAD */}
        <p style={{ ...SECTION_TITLE, marginTop: 28, fontSize: 15 }}>🔒 Política de Privacidad</p>

        <p style={BODY}>
          En cumplimiento del <strong style={{ color: colors.white }}>Reglamento General de Protección de Datos (RGPD)</strong> y la Ley Orgánica 3/2018 (LOPDGDD), te informamos de cómo tratamos tus datos.
        </p>

        <p style={SECTION_TITLE}>Responsable del tratamiento</p>
        <p style={BODY}>
          <strong style={{ color: colors.white }}>Lumetrix AI</strong>{'\n'}
          Email de contacto: <strong style={{ color: '#38BDF8' }}>lumetrixxx@gmail.com</strong>
        </p>

        <p style={SECTION_TITLE}>¿Qué datos recogemos?</p>
        <p style={BODY}>
          • <strong style={{ color: colors.white }}>Datos de cuenta:</strong> nombre, email y foto de perfil obtenidos mediante Google Sign-In.{'\n'}
          • <strong style={{ color: colors.white }}>Datos de uso:</strong> número de consultas realizadas y fecha, para gestionar los límites del plan.{'\n'}
          • <strong style={{ color: colors.white }}>Datos de pago:</strong> gestionados íntegramente por Stripe. Work IA no almacena datos de tarjeta.{'\n'}
          • <strong style={{ color: colors.white }}>Historial:</strong> las consultas que realizas se guardan para que puedas consultarlas. Puedes eliminarlas desde la app en cualquier momento.
        </p>

        <p style={SECTION_TITLE}>¿Para qué usamos tus datos?</p>
        <p style={BODY}>
          • Prestarte el servicio de herramientas de estudio con IA.{'\n'}
          • Gestionar tu suscripción y facturación.{'\n'}
          • Controlar los límites de uso según tu plan.{'\n'}
          • Mejorar la aplicación mediante análisis de uso agregado y anónimo.
        </p>

        <p style={SECTION_TITLE}>¿Cuánto tiempo guardamos tus datos?</p>
        <p style={BODY}>
          Tus datos se conservan mientras mantengas una cuenta activa. Si eliminas tu cuenta, borramos tus datos en un plazo máximo de 30 días, excepto los que debamos conservar por obligación legal (ej. registros de facturación durante 5 años).
        </p>

        <p style={SECTION_TITLE}>Tus derechos</p>
        <p style={BODY}>
          Tienes derecho a acceder, rectificar, suprimir, limitar u oponerte al tratamiento de tus datos, así como a la portabilidad. Para ejercerlos escríbenos a <strong style={{ color: '#38BDF8' }}>lumetrixxx@gmail.com</strong>.
        </p>

        <p style={SECTION_TITLE}>Cookies</p>
        <p style={BODY}>
          Work IA utiliza únicamente cookies técnicas necesarias para el funcionamiento del servicio (autenticación y sesión). No usamos cookies publicitarias ni de seguimiento de terceros.
        </p>

        {/* Checkbox */}
        <div
          onClick={() => setChecked(v => !v)}
          style={{
            marginTop: 28,
            display: 'flex', alignItems: 'flex-start', gap: 12,
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: `1px solid ${checked ? '#38BDF8' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: 12, padding: '14px 16px',
            cursor: 'pointer', transition: 'border-color 0.2s',
          }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
            border: `2px solid ${checked ? '#38BDF8' : 'rgba(255,255,255,0.3)'}`,
            backgroundColor: checked ? '#38BDF8' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}>
            {checked && <span style={{ color: '#fff', fontSize: 13, fontWeight: 900 }}>✓</span>}
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.6 }}>
            He leído y acepto los <strong style={{ color: colors.white }}>Términos de Uso</strong> y la <strong style={{ color: colors.white }}>Política de Privacidad</strong> de Work IA.
          </p>
        </div>

        {/* Botón aceptar */}
        <button
          onClick={handleAccept}
          disabled={!checked || loading}
          style={{
            width: '100%', marginTop: 16,
            background: checked
              ? 'linear-gradient(135deg, #38BDF8, #0284C7)'
              : 'rgba(255,255,255,0.1)',
            color: checked ? '#fff' : 'rgba(255,255,255,0.35)',
            padding: '16px', borderRadius: 14,
            fontSize: 16, fontWeight: 800,
            transition: 'all 0.2s',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Guardando...' : '✅ Aceptar y continuar'}
        </button>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
          Contacto: lumetrixxx@gmail.com
        </p>
      </div>
    </div>
  )
}
