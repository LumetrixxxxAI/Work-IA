import React, { useState, useEffect, CSSProperties } from 'react'
import { Layout } from '../components/Layout'
import { obtenerHistorial, borrarHistorialItem, HistorialItem } from '../services/api'
import { colors } from '../theme/colors'

const TIPO_ICONS: Record<string, string> = {
  resumen: '📝',
  ejercicios: '🧮',
  clase: '🎓',
  examen: '📋',
  comentario: '✍️',
  esquema: '🗂️',
  flashcards: '🃏',
  corrector: '✏️',
}

const TIPO_LABELS: Record<string, string> = {
  resumen: 'Resumen',
  ejercicios: 'Ejercicios',
  clase: 'Clase',
  examen: 'Examen',
  comentario: 'Comentario',
  esquema: 'Esquema',
  flashcards: 'Flashcards',
  corrector: 'Corrector',
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
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    obtenerHistorial()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
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
    padding: '0 20px 20px',
  }

  const headerStyle: CSSProperties = {
    paddingTop: 20,
    paddingBottom: 16,
    borderBottom: `1px solid ${colors.glassBorder}`,
    marginBottom: 16,
  }

  return (
    <Layout>
      <div style={bg}>
        <div style={headerStyle}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: colors.glass,
                  border: `1px solid ${colors.glassBorder}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', padding: '12px 14px',
                    cursor: 'pointer', gap: 10,
                  }}
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                >
                  <span style={{ fontSize: 20 }}>{TIPO_ICONS[item.tipo] ?? '📄'}</span>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: colors.white, margin: 0 }}>
                      {TIPO_LABELS[item.tipo] ?? item.tipo}
                    </p>
                    <p style={{ fontSize: 12, color: colors.muted, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.contenidoOriginal?.slice(0, 60) || 'Sin texto'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: colors.muted }}>
                      {item.fecha ? formatFecha(item.fecha) : ''}
                    </span>
                    <span style={{ color: colors.muted, fontSize: 14, transition: 'transform 0.2s', transform: expanded === item.id ? 'rotate(90deg)' : 'none' }}>›</span>
                  </div>
                </div>

                {/* Expanded content */}
                {expanded === item.id && (
                  <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${colors.glassBorder}` }}>
                    <pre style={{
                      marginTop: 12, whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.85)',
                      fontSize: 13, lineHeight: 1.6, fontFamily: 'inherit', margin: '12px 0 12px',
                      maxHeight: 200, overflowY: 'auto',
                    }}>
                      {item.resultado}
                    </pre>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      style={{
                        backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 8, padding: '6px 12px', fontSize: 12,
                        color: colors.error, fontWeight: 600,
                        opacity: deleting === item.id ? 0.5 : 1,
                      }}
                    >
                      {deleting === item.id ? 'Eliminando...' : '🗑 Eliminar'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
