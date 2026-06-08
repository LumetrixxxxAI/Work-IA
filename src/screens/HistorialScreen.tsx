import React, { useState, useEffect, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { obtenerHistorial, borrarHistorialItem, HistorialItem } from '../services/api'
import { colors } from '../theme/colors'

const TIPO_ICONS: Record<string, string> = {
  resumen:    '📝',
  ejercicios: '🧮',
  clase:      '🎓',
  examen:     '📋',
  comentario: '✍️',
  esquema:    '🗂️',
  flashcards: '🃏',
  corrector:  '✏️',
}

const TIPO_LABELS: Record<string, string> = {
  resumen:    'Resumen',
  ejercicios: 'Ejercicios',
  clase:      'Clase',
  examen:     'Examen',
  comentario: 'Comentario',
  esquema:    'Esquema',
  flashcards: 'Flashcards',
  corrector:  'Corrector',
}

const TIPO_ACCENT: Record<string, string> = {
  comentario: '#EC4899',
  esquema:    '#0EA5E9',
  examen:     '#F59E0B',
  flashcards: '#A855F7',
  corrector:  '#10B981',
  resumen:    '#38BDF8',
  ejercicios: '#F97316',
  clase:      '#6366F1',
}

function formatFecha(fecha: any) {
  const seconds = fecha?._seconds ?? fecha?.seconds
  if (!seconds) return 'Sin fecha'
  const date = new Date(seconds * 1000)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function HistorialScreen() {
  const [items, setItems] = useState<HistorialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    obtenerHistorial()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!window.confirm('¿Eliminar este elemento del historial?')) return
    setDeleting(id)
    try {
      await borrarHistorialItem(id)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {
      alert('Error al eliminar. Inténtalo de nuevo.')
    } finally {
      setDeleting(null)
    }
  }

  const bg: CSSProperties = {
    minHeight: '100%',
    background: 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)',
    padding: '0 16px 80px',
  }

  return (
    <Layout>
      <div style={bg}>
        {/* Header */}
        <div style={{ paddingTop: 20, paddingBottom: 16, borderBottom: `1px solid ${colors.glassBorder}`, marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: colors.white, margin: 0 }}>🕐 Historial</h1>
          <p style={{ fontSize: 13, color: colors.muted, margin: '4px 0 0' }}>Tus consultas recientes</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: colors.muted }}>Cargando...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 48 }}>📭</span>
            <p style={{ fontSize: 15, color: colors.muted }}>No hay consultas aún</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Usa las herramientas para ver tu historial aquí</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item) => {
              const accent = TIPO_ACCENT[item.tipo] ?? '#38BDF8'
              return (
                <div
                  key={item.id}
                  onClick={() => navigate('/historial/detalle', { state: { item } })}
                  style={{
                    backgroundColor: colors.glass,
                    border: `1px solid ${colors.glassBorder}`,
                    borderRadius: 14,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', padding: '12px 14px', gap: 12,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = colors.glass)}
                >
                  {/* Icono con color de acento */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                    background: `${accent}22`,
                    border: `1px solid ${accent}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                  }}>
                    {TIPO_ICONS[item.tipo] ?? '📄'}
                  </div>

                  {/* Texto */}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: colors.white, margin: 0 }}>
                      {TIPO_LABELS[item.tipo] ?? item.tipo}
                    </p>
                    <p style={{
                      fontSize: 12, color: colors.muted, margin: '2px 0 0',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {item.contenidoOriginal?.slice(0, 60) || 'Sin texto'}
                    </p>
                  </div>

                  {/* Fecha + flecha + papelera */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: colors.muted, whiteSpace: 'nowrap' }}>
                      {item.fecha ? formatFecha(item.fecha) : ''}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={(e) => handleDelete(e, item.id)}
                        disabled={deleting === item.id}
                        style={{
                          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                          borderRadius: 6, padding: '2px 7px', fontSize: 11,
                          color: '#F87171', fontWeight: 600,
                          opacity: deleting === item.id ? 0.4 : 1,
                        }}
                      >
                        {deleting === item.id ? '...' : '🗑'}
                      </button>
                      <span style={{ color: accent, fontSize: 16, fontWeight: 700 }}>›</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
