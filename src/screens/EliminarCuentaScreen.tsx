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
  h1: { fontSize: 24, fontWeight: 900, marginBottom: 8, color: '#fff' } as React.CSSProperties,
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 32 } as React.CSSProperties,
  card: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 16, padding: '20px 24px', marginBottom: 16,
  } as React.CSSProperties,
  h2: { fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 8px' } as React.CSSProperties,
  p: { fontSize: 14, color: 'rgba(255,255,255,0.82)', lineHeight: 1.75, margin: 0 } as React.CSSProperties,
  email: {
    display: 'inline-block', marginTop: 16,
    background: 'rgba(56,189,248,0.15)',
    border: '1px solid rgba(56,189,248,0.3)',
    borderRadius: 10, padding: '10px 18px',
    fontSize: 15, fontWeight: 700, color: '#38BDF8',
    textDecoration: 'none',
  } as React.CSSProperties,
  warning: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 12, padding: '14px 18px', marginBottom: 16,
    fontSize: 13, color: '#FCA5A5', lineHeight: 1.6,
  } as React.CSSProperties,
}

export function EliminarCuentaScreen() {
  return (
    <div style={S.page}>
      <img src="/apple-touch-icon.png" alt="Work IA" style={{ width: 52, height: 52, borderRadius: 13, marginBottom: 16 }} />
      <h1 style={S.h1}>Eliminar cuenta</h1>
      <p style={S.sub}>Work IA · Lumetrix AI</p>

      <div style={S.warning}>
        ⚠️ La eliminación de tu cuenta es <strong>permanente e irreversible</strong>. Se borrarán todos tus datos, historial y suscripción activa.
      </div>

      <div style={S.card}>
        <h2 style={S.h2}>¿Cómo solicitar la eliminación?</h2>
        <p style={S.p}>
          Envía un correo desde la dirección de Gmail con la que te registraste en Work IA indicando que deseas eliminar tu cuenta y todos tus datos.
        </p>
        <a href="mailto:lumetrixxx@gmail.com?subject=Solicitud%20eliminaci%C3%B3n%20de%20cuenta%20Work%20IA&body=Hola%2C%20quiero%20eliminar%20mi%20cuenta%20y%20todos%20mis%20datos%20de%20Work%20IA.%20Mi%20email%20registrado%20es%3A%20" style={S.email}>
          ✉️ lumetrixxx@gmail.com
        </a>
      </div>

      <div style={S.card}>
        <h2 style={S.h2}>¿Qué datos se eliminan?</h2>
        <p style={S.p}>
          • Cuenta de usuario (nombre, email, foto de perfil)<br/>
          • Historial de consultas y resultados generados<br/>
          • Datos de uso y límites de plan<br/>
          • Suscripción activa (se cancela automáticamente)
        </p>
      </div>

      <div style={S.card}>
        <h2 style={S.h2}>Plazo de eliminación</h2>
        <p style={S.p}>
          Procesamos las solicitudes en un plazo máximo de <strong style={{ color: '#fff' }}>30 días</strong> desde la recepción del correo. Recibirás una confirmación cuando se complete.
        </p>
      </div>

      <div style={{ ...S.card, marginTop: 8 }}>
        <h2 style={S.h2}>¿Tienes dudas?</h2>
        <p style={S.p}>
          Escríbenos a <strong style={{ color: '#38BDF8' }}>lumetrixxx@gmail.com</strong> para cualquier consulta sobre tus datos.
        </p>
      </div>
    </div>
  )
}
