import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { HistorialItem } from '../services/api'
import { BackHeader } from '../components/BackHeader'
import { ComentarioViewer } from '../components/ComentarioViewer'
import { EsquemaViewer } from '../components/EsquemaViewer'
import { ExamViewer } from '../components/ExamViewer'
import { FlashcardViewer } from '../components/FlashcardViewer'
import { CorrectorViewer } from '../components/CorrectorViewer'
import { TimelineViewer } from '../components/TimelineViewer'
import { ResultBox } from '../components/ResultBox'
import { colors } from '../theme/colors'

const ACCENT: Record<string, string> = {
  comentario: '#EC4899',
  esquema:    '#0EA5E9',
  mapa:       '#0EA5E9',
  tabla:      '#0EA5E9',
  examen:     '#F59E0B',
  flashcards: '#A855F7',
  corrector:  '#10B981',
  timeline:   '#7C3AED',
  resumen:    '#38BDF8',
  ejercicios: '#F97316',
  clase:      '#6366F1',
}

const TIPO_LABELS: Record<string, string> = {
  resumen:    'Resumen',
  ejercicios: 'Ejercicios',
  clase:      'Clase virtual',
  examen:     'Examen',
  comentario: 'Comentario de texto',
  esquema:    'Esquema',
  flashcards: 'Flashcards',
  corrector:  'Corrector',
  timeline:   'Línea del tiempo',
}

function formatFecha(fecha: any) {
  const seconds = fecha?._seconds ?? fecha?.seconds
  if (!seconds) return ''
  return new Date(seconds * 1000).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function ResultadoViewer({ item }: { item: HistorialItem }) {
  const tipo = item.tipo
  const contenido = item.resultado
  const params = item.parametros ?? {}

  if (!contenido?.trim()) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: colors.muted }}>
        <p style={{ fontSize: 15 }}>Sin contenido guardado</p>
      </div>
    )
  }

  if (tipo === 'comentario') {
    const subTipo = (params.tipo as string) ?? 'literario'
    return <ComentarioViewer content={contenido} tipo={subTipo as any} />
  }

  if (tipo === 'esquema') {
    const subTipo = (params.tipo as string) ?? 'esquema'
    return <EsquemaViewer content={contenido} tipo={subTipo as any} />
  }

  if (tipo === 'examen') {
    return <ExamViewer content={contenido} />
  }

  if (tipo === 'flashcards') {
    return <FlashcardViewer content={contenido} />
  }

  if (tipo === 'corrector') {
    const modo = (params.modo as 'corregir' | 'mejorar' | 'ambos') ?? 'ambos'
    return <CorrectorViewer content={contenido} modo={modo} />
  }

  if (tipo === 'timeline') {
    return <TimelineViewer content={contenido} />
  }

  // resumen, ejercicios, clase → ResultBox estándar
  return <ResultBox content={contenido} />
}

export function HistorialDetalleScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const item = location.state?.item as HistorialItem | undefined

  React.useEffect(() => {
    if (!item) navigate('/historial', { replace: true })
  }, [item, navigate])

  if (!item) return null

  const accent = ACCENT[item.tipo] ?? '#38BDF8'
  const label = TIPO_LABELS[item.tipo] ?? item.tipo

  const bg: React.CSSProperties = {
    minHeight: '100dvh',
    background: 'linear-gradient(180deg, #075985 0%, #0284C7 50%, #075985 100%)',
    display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto',
  }

  return (
    <div style={bg}>
      <BackHeader
        title={label}
        subtitle={formatFecha(item.fecha)}
        accentColor={accent}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 48px' }}>
        {/* Texto original consultado */}
        {item.contenidoOriginal?.trim() && (
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: '10px 14px', marginBottom: 16,
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              Consulta original
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.55, margin: 0 }}>
              {item.contenidoOriginal}
            </p>
          </div>
        )}

        {/* Resultado con el viewer adecuado */}
        <ResultadoViewer item={item} />
      </div>
    </div>
  )
}
