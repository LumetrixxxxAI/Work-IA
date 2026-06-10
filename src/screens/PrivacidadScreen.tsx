import React from 'react'

const S = {
  page: {
    minHeight: '100dvh',
    background: 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)',
    padding: '40px 24px 60px',
    maxWidth: 680,
    margin: '0 auto',
    fontFamily: 'Inter, sans-serif',
    color: '#fff',
  } as React.CSSProperties,
  h1: { fontSize: 26, fontWeight: 900, marginBottom: 8, color: '#fff' } as React.CSSProperties,
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 32 } as React.CSSProperties,
  h2: { fontSize: 17, fontWeight: 800, color: '#fff', margin: '28px 0 6px' } as React.CSSProperties,
  h3: { fontSize: 14, fontWeight: 700, color: '#7DD3FC', margin: '18px 0 4px' } as React.CSSProperties,
  p: { fontSize: 14, color: 'rgba(255,255,255,0.82)', lineHeight: 1.75, margin: '0 0 10px' } as React.CSSProperties,
  divider: { height: 1, background: 'rgba(255,255,255,0.1)', margin: '32px 0' } as React.CSSProperties,
}

export function PrivacidadScreen() {
  return (
    <div style={S.page}>
      <img src="/apple-touch-icon.png" alt="Work IA" style={{ width: 56, height: 56, borderRadius: 14, marginBottom: 16 }} />
      <h1 style={S.h1}>Política de Privacidad y Términos de Uso</h1>
      <p style={S.sub}>Work IA · Lumetrix AI · Última actualización: junio 2026</p>

      {/* POLÍTICA DE PRIVACIDAD */}
      <h2 style={S.h2}>🔒 Política de Privacidad</h2>
      <p style={S.p}>
        En cumplimiento del <strong>Reglamento General de Protección de Datos (RGPD)</strong> y la Ley Orgánica 3/2018 (LOPDGDD), te informamos de cómo tratamos tus datos.
      </p>

      <h3 style={S.h3}>Responsable del tratamiento</h3>
      <p style={S.p}>Lumetrix AI — Email: lumetrixxx@gmail.com</p>

      <h3 style={S.h3}>¿Qué datos recogemos?</h3>
      <p style={S.p}>
        • <strong>Datos de cuenta:</strong> nombre, email y foto de perfil obtenidos mediante Google Sign-In.<br/>
        • <strong>Datos de uso:</strong> número de consultas realizadas y fecha, para gestionar los límites del plan.<br/>
        • <strong>Datos de pago:</strong> gestionados íntegramente por Stripe. Work IA no almacena datos de tarjeta.<br/>
        • <strong>Historial:</strong> las consultas que realizas se guardan para que puedas consultarlas. Puedes eliminarlas desde la app en cualquier momento.
      </p>

      <h3 style={S.h3}>¿Para qué usamos tus datos?</h3>
      <p style={S.p}>
        • Prestarte el servicio de herramientas de estudio con IA.<br/>
        • Gestionar tu suscripción y facturación.<br/>
        • Controlar los límites de uso según tu plan.<br/>
        • Mejorar la experiencia de la aplicación.
      </p>

      <h3 style={S.h3}>Base legal</h3>
      <p style={S.p}>El tratamiento se basa en la ejecución del contrato de servicio aceptado al registrarte.</p>

      <h3 style={S.h3}>¿Cuánto tiempo guardamos tus datos?</h3>
      <p style={S.p}>Mientras mantengas tu cuenta activa. Al eliminar tu cuenta, tus datos se borran en un plazo máximo de 30 días.</p>

      <h3 style={S.h3}>Tus derechos</h3>
      <p style={S.p}>
        Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición y portabilidad escribiendo a <strong>lumetrixxx@gmail.com</strong>. También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).
      </p>

      <h3 style={S.h3}>Servicios de terceros</h3>
      <p style={S.p}>
        • <strong>Google Firebase:</strong> autenticación y base de datos (política: policies.google.com/privacy)<br/>
        • <strong>Stripe:</strong> procesamiento de pagos (política: stripe.com/es/privacy)<br/>
        • <strong>Anthropic Claude:</strong> generación de contenido con IA (política: anthropic.com/privacy)
      </p>

      <div style={S.divider} />

      {/* TÉRMINOS DE USO */}
      <h2 style={S.h2}>📋 Términos de Uso</h2>
      <p style={S.p}>Work IA es una aplicación de herramientas de estudio con inteligencia artificial, desarrollada por <strong>Lumetrix AI</strong>. Al usar la aplicación aceptas las siguientes condiciones:</p>

      <h3 style={S.h3}>1. Uso permitido</h3>
      <p style={S.p}>Work IA está diseñada exclusivamente para uso educativo personal. Está prohibido usar la aplicación para generar contenido fraudulento, engañoso o que infrinja derechos de terceros.</p>

      <h3 style={S.h3}>2. Límites de uso</h3>
      <p style={S.p}>El plan gratuito incluye 3 consultas diarias y 20 mensuales. Los planes de pago (Pro y Premium) amplían estos límites según lo indicado en la pantalla de suscripción. Lumetrix AI se reserva el derecho de modificar los límites con previo aviso.</p>

      <h3 style={S.h3}>3. Pagos y cancelación</h3>
      <p style={S.p}>Los planes de pago se facturan mensualmente a través de Stripe. Puedes cancelar tu suscripción en cualquier momento desde la sección Ajustes → Gestionar suscripción. No se realizan reembolsos por el período en curso salvo exigencia legal.</p>

      <h3 style={S.h3}>4. Responsabilidad</h3>
      <p style={S.p}>Las respuestas generadas por la IA son orientativas. Work IA no se hace responsable del uso que el usuario haga de los contenidos generados. Se recomienda siempre contrastar la información con fuentes académicas oficiales.</p>

      <h3 style={S.h3}>5. Modificaciones</h3>
      <p style={S.p}>Lumetrix AI puede actualizar estos términos en cualquier momento. Se notificará a los usuarios de cambios relevantes a través de la aplicación.</p>

      <div style={S.divider} />
      <p style={{ ...S.p, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
        © 2026 Lumetrix AI · lumetrixxx@gmail.com
      </p>
    </div>
  )
}
