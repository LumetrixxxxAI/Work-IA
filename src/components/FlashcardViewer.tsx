import React, { useState, CSSProperties } from 'react'

interface Flashcard {
  pregunta: string
  respuesta: string
}

function parseFlashcards(raw: string): Flashcard[] {
  const cards: Flashcard[] = []
  // Split por separador ---
  const blocks = raw.split(/\n---\n|\n---$|^---\n/m).filter(b => b.trim())

  for (const block of blocks) {
    const pregMatch = block.match(/\*\*Pregunta:\*\*\s*(.+?)(?:\n|$)/s)
    const respMatch = block.match(/\*\*Respuesta:\*\*\s*(.+?)(?:\n---|$)/s)
    if (pregMatch && respMatch) {
      cards.push({
        pregunta: pregMatch[1].trim(),
        respuesta: respMatch[1].trim(),
      })
    }
  }
  return cards
}

function FlipCard({ card, index, total }: { card: Flashcard; index: number; total: number }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      onClick={() => setFlipped(f => !f)}
      style={{
        width: '100%',
        height: 220,
        perspective: 1000,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        {/* Cara frontal — Pregunta */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden',
          background: 'linear-gradient(135deg, #4C1D95, #6D28D9)',
          borderRadius: 20,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '24px 20px',
          boxShadow: '0 8px 32px rgba(109,40,217,0.4)',
          border: '1px solid rgba(167,139,250,0.3)',
        }}>
          <span style={{
            position: 'absolute', top: 14, left: 18,
            fontSize: 11, fontWeight: 700, color: 'rgba(167,139,250,0.7)',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            {index + 1} / {total}
          </span>
          <span style={{
            position: 'absolute', top: 14, right: 18,
            fontSize: 11, color: 'rgba(167,139,250,0.6)',
          }}>
            Toca para ver respuesta →
          </span>
          <div style={{
            fontSize: 32, marginBottom: 12,
          }}>❓</div>
          <p style={{
            fontSize: 16, fontWeight: 700, color: '#fff',
            textAlign: 'center', lineHeight: 1.5, margin: 0,
          }}>
            {card.pregunta}
          </p>
        </div>

        {/* Cara trasera — Respuesta */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'linear-gradient(135deg, #064E3B, #065F46)',
          borderRadius: 20,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '24px 20px',
          boxShadow: '0 8px 32px rgba(6,78,59,0.4)',
          border: '1px solid rgba(52,211,153,0.3)',
        }}>
          <span style={{
            position: 'absolute', top: 14, left: 18,
            fontSize: 11, fontWeight: 700, color: 'rgba(52,211,153,0.7)',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            Respuesta
          </span>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
          <p style={{
            fontSize: 15, color: '#fff',
            textAlign: 'center', lineHeight: 1.6, margin: 0,
          }}>
            {card.respuesta}
          </p>
        </div>
      </div>
    </div>
  )
}

interface Props {
  content: string
  tokensUsados?: number
}

export function FlashcardViewer({ content, tokensUsados }: Props) {
  const cards = parseFlashcards(content)
  const [current, setCurrent] = useState(0)
  const [mode, setMode] = useState<'swipe' | 'all'>('swipe')

  if (cards.length === 0) {
    // Fallback si no parsea bien
    return (
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 16, padding: 16,
      }}>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#fff', fontSize: 14, lineHeight: 1.7 }}>
          {content}
        </pre>
      </div>
    )
  }

  return (
    <div>
      {/* Toggle modo */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setMode('swipe')}
          style={{
            flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: mode === 'swipe' ? 'rgba(109,40,217,0.3)' : 'rgba(255,255,255,0.06)',
            color: mode === 'swipe' ? '#A78BFA' : 'rgba(255,255,255,0.5)',
            border: mode === 'swipe' ? '1px solid rgba(109,40,217,0.5)' : '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
          }}
        >
          🃏 Una a una
        </button>
        <button
          onClick={() => setMode('all')}
          style={{
            flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: mode === 'all' ? 'rgba(109,40,217,0.3)' : 'rgba(255,255,255,0.06)',
            color: mode === 'all' ? '#A78BFA' : 'rgba(255,255,255,0.5)',
            border: mode === 'all' ? '1px solid rgba(109,40,217,0.5)' : '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
          }}
        >
          📋 Ver todas
        </button>
      </div>

      {mode === 'swipe' ? (
        <div>
          {/* Tarjeta actual */}
          <FlipCard key={current} card={cards[current]} index={current} total={cards.length} />

          {/* Navegación */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
            <button
              onClick={() => setCurrent(c => Math.max(0, c - 1))}
              disabled={current === 0}
              style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: current === 0 ? 'rgba(255,255,255,0.2)' : '#fff',
                fontSize: 20, cursor: current === 0 ? 'default' : 'pointer',
              }}
            >←</button>

            {/* Puntos de progreso */}
            <div style={{ display: 'flex', gap: 6 }}>
              {cards.slice(0, Math.min(cards.length, 10)).map((_, i) => (
                <div
                  key={i}
                  onClick={() => setCurrent(i)}
                  style={{
                    width: i === current ? 20 : 8,
                    height: 8, borderRadius: 4,
                    background: i === current ? '#A78BFA' : 'rgba(255,255,255,0.2)',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                />
              ))}
              {cards.length > 10 && (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: '8px' }}>
                  +{cards.length - 10}
                </span>
              )}
            </div>

            <button
              onClick={() => setCurrent(c => Math.min(cards.length - 1, c + 1))}
              disabled={current === cards.length - 1}
              style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: current === cards.length - 1 ? 'rgba(255,255,255,0.2)' : '#fff',
                fontSize: 20, cursor: current === cards.length - 1 ? 'default' : 'pointer',
              }}
            >→</button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 10 }}>
            Toca la tarjeta para ver la respuesta
          </p>
        </div>
      ) : (
        /* Modo ver todas */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cards.map((card, i) => (
            <div key={i} style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(167,139,250,0.2)',
              borderRadius: 14, overflow: 'hidden',
            }}>
              <div style={{
                background: 'rgba(109,40,217,0.2)',
                padding: '10px 14px',
                borderBottom: '1px solid rgba(167,139,250,0.15)',
              }}>
                <span style={{ fontSize: 11, color: '#A78BFA', fontWeight: 700 }}>P{i + 1}</span>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: '4px 0 0', lineHeight: 1.4 }}>
                  {card.pregunta}
                </p>
              </div>
              <div style={{ padding: '10px 14px' }}>
                <span style={{ fontSize: 11, color: '#34D399', fontWeight: 700 }}>R</span>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0', lineHeight: 1.5 }}>
                  {card.respuesta}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tokensUsados !== undefined && (
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'right', marginTop: 12 }}>
          Tokens: {tokensUsados}
        </p>
      )}
    </div>
  )
}
