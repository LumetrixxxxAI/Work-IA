import React, { CSSProperties, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useUser } from '../hooks/useUser'
import { useSubscriptionStore } from '../store/subscriptionStore'
import { colors, gradients } from '../theme/colors'
import { getUsage } from '../services/api'

const ALL_TOOLS = [
  { icon: '📝', title: 'Resumen', description: 'Resume apuntes, PDFs e imágenes', gradient: gradients.cardResumen, path: '/resumen', pro: false },
  { icon: '🧮', title: 'Ejercicios', description: 'Resuelve ejercicios paso a paso', gradient: gradients.cardEjercicios, path: '/ejercicios', pro: false },
  { icon: '🎓', title: 'Clase', description: 'Explica cualquier tema como en clase', gradient: gradients.cardClase, path: '/clase', pro: false },
  { icon: '📋', title: 'Examen', description: 'Genera preguntas de examen', gradient: gradients.cardExamen, path: '/examen', pro: true },
  { icon: '✍️', title: 'Comentario', description: 'Analiza y comenta cualquier texto', gradient: gradients.cardComentario, path: '/comentario', pro: true },
  { icon: '🗂️', title: 'Esquema', description: 'Mapas conceptuales y esquemas', gradient: gradients.cardEsquema, path: '/esquema', pro: true },
  { icon: '🃏', title: 'Flashcards', description: 'Tarjetas de memorización', gradient: gradients.cardFlashcards, path: '/flashcards', pro: true },
  { icon: '✏️', title: 'Corrector', description: 'Corrige y mejora tus redacciones', gradient: gradients.cardCorrector, path: '/corrector', pro: true },
]

function UsageBar({ isPro, dailyCount, monthlyCount, onUpgrade }: {
  isPro: boolean; dailyCount: number; monthlyCount: number; onUpgrade: () => void
}) {
  const dailyLimit = 3
  const monthlyLimit = isPro ? 80 : 20
  const count = isPro ? monthlyCount : dailyCount
  const limit = isPro ? monthlyLimit : dailyLimit
  const pct = limit > 0 ? Math.min(100, (count / limit) * 100) : 0
  const atLimit = count >= limit
  const nearLimit = count >= limit * 0.8
  const barColor = atLimit
    ? 'linear-gradient(90deg,#EF4444,#F87171)'
    : nearLimit
      ? 'linear-gradient(90deg,#F59E0B,#FBBF24)'
      : isPro
        ? 'linear-gradient(90deg,#F59E0B,#FBBF24)'
        : 'linear-gradient(90deg,#38BDF8,#7DD3FC)'
  const numColor = atLimit ? '#F87171' : isPro ? '#FBBF24' : '#38BDF8'
  return (
    <div style={{
      background: isPro ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.06)',
      border: `1px solid ${isPro ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.12)'}`,
      borderRadius: 12, padding: '12px 16px', marginBottom: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: isPro ? '#FBBF24' : 'rgba(255,255,255,0.7)' }}>
          {isPro ? '👑 Uso mensual Pro' : '📊 Uso de hoy'}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: numColor }}>
          {count}/{limit} consultas
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: barColor }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
          {isPro ? `Hoy: ${dailyCount} consultas` : `Este mes: ${monthlyCount}/20`}
        </span>
        {!isPro && atLimit && (
          <span onClick={onUpgrade} style={{ fontSize: 11, fontWeight: 700, color: '#FBBF24', cursor: 'pointer' }}>
            Obtener Pro →
          </span>
        )}
      </div>
    </div>
  )
}

function ToolCard({ icon, title, description, gradient, isPro, locked, onClick }: {
  icon: string; title: string; description: string; gradient: string
  isPro: boolean; locked: boolean; onClick: () => void
}) {
  const cardStyle: CSSProperties = {
    background: locked ? 'linear-gradient(135deg, #0c2a3a, #0e3550)' : gradient,
    borderRadius: 16,
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    cursor: 'pointer',
    marginBottom: 10,
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    transition: 'transform 0.1s',
    userSelect: 'none',
    opacity: locked ? 0.75 : 1,
  }
  return (
    <div style={cardStyle} onClick={onClick}
      onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.98)')}
      onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: colors.white, margin: 0 }}>{title}</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: '2px 0 0', lineHeight: 1.4 }}>{description}</p>
      </div>
      {isPro && (
        <span style={{
          background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
          color: '#78350F', fontSize: 10, fontWeight: 800,
          letterSpacing: 0.5, padding: '3px 7px', borderRadius: 6, flexShrink: 0,
        }}>PRO</span>
      )}
      <span style={{ color: locked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)', fontSize: 18, marginLeft: 4 }}>
        {locked ? '🔒' : '›'}
      </span>
    </div>
  )
}

export function HomeScreen() {
  const navigate = useNavigate()
  const { user, cursoLabel } = useUser()
  const { isPro } = useSubscriptionStore()
  // Inicializar con datos del store local inmediatamente (sin esperar API)
  const [dailyCount, setDailyCount] = useState(0)
  const [monthlyCount, setMonthlyCount] = useState(0)

  useEffect(() => {
    getUsage()
      .then(d => { setDailyCount(d.dailyCount); setMonthlyCount(d.monthlyCount) })
      .catch(() => {})
  }, [])

  const initial = (user?.nombre ?? user?.displayName ?? 'U')[0].toUpperCase()

  return (
    <Layout>
      <div style={{
        minHeight: '100%',
        background: 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)',
        padding: '0 20px 20px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, paddingBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: colors.white, margin: 0 }}>
              Hola, {user?.nombre ?? user?.displayName?.split(' ')[0] ?? 'alumno'} 👋
            </h2>
            <p style={{ fontSize: 13, color: colors.blue400, margin: 0, marginTop: 2, fontWeight: 500 }}>
              {cursoLabel()}
            </p>
          </div>
          <div
            onClick={() => navigate('/ajustes')}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              backgroundColor: colors.blue600, border: `2px solid ${colors.blue400}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: colors.white, cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
        </div>

        {/* Plan banner */}
        {isPro ? (
          <div style={{
            backgroundColor: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)',
            borderRadius: 12, padding: '10px 16px', marginBottom: 20, textAlign: 'center',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#FBBF24' }}>
              👑 Plan Pro activo — acceso completo
            </span>
          </div>
        ) : (
          <div
            onClick={() => navigate('/paywall')}
            style={{
              backgroundColor: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)',
              borderRadius: 12, padding: '10px 16px', marginBottom: 20, textAlign: 'center', cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.blue400 }}>
              ✨ Actualiza a Pro · 3,99€/mes →
            </span>
          </div>
        )}

        {/* Usage counter — siempre visible */}
        <UsageBar isPro={isPro} dailyCount={dailyCount} monthlyCount={monthlyCount} onUpgrade={() => navigate('/paywall')} />

        {/* All tools */}
        <p style={{
          fontSize: 11, fontWeight: 700, color: colors.blue200,
          textTransform: 'uppercase', letterSpacing: 1.2,
          marginBottom: 10, marginTop: 4,
        }}>Herramientas</p>

        {ALL_TOOLS.map((tool) => {
          const locked = tool.pro && !isPro
          return (
            <ToolCard
              key={tool.path}
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
              gradient={tool.gradient}
              isPro={tool.pro}
              locked={locked}
              onClick={() => navigate(locked ? '/paywall' : tool.path)}
            />
          )
        })}
      </div>
    </Layout>
  )
}
