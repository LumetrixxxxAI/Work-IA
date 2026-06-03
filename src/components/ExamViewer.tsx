import React, { useState } from 'react'

interface Option { letter: string; text: string; correct: boolean }
interface Question {
  num: number
  text: string
  type: 'test' | 'desarrollo'
  options: Option[]
  answer: string
}

function parseExam(raw: string): Question[] {
  const questions: Question[] = []

  // Extraer respuestas al final (sección RESPUESTAS:)
  const answersMap: Record<number, string> = {}
  const respSection = raw.match(/RESPUESTAS?:?([\s\S]+)$/i)
  if (respSection) {
    const lines = respSection[1].split('\n')
    for (const line of lines) {
      const m = line.match(/(\d+)[.)]\s*([A-D])/i)
      if (m) answersMap[parseInt(m[1])] = m[2].toUpperCase()
    }
  }

  // Quitar sección de respuestas del texto principal
  const mainText = raw.replace(/RESPUESTAS?:?[\s\S]+$/i, '')

  // Dividir por número de pregunta
  const blocks = mainText.split(/(?=^\d+[.)]\s)/m).filter(b => b.trim())

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
    if (!lines.length) continue

    const numMatch = lines[0].match(/^(\d+)[.)]\s*(.+)/)
    if (!numMatch) continue

    const num = parseInt(numMatch[1])
    const questionText = numMatch[2]

    // Detectar opciones A) B) C) D)
    const optionLines = lines.filter(l => l.match(/^[*]?[A-D][.)]\s/i))
    const answerLines = lines.filter(l => !l.match(/^[*]?[A-D][.)]\s/i) && l !== lines[0])

    if (optionLines.length >= 2) {
      // Tipo test
      const correctLetter = answersMap[num] ?? ''
      const options: Option[] = optionLines.map(l => {
        const isCorrect = l.startsWith('*')
        const clean = l.replace(/^\*/, '')
        const m = clean.match(/^([A-D])[.)]\s*(.+)/i)
        if (!m) return null
        const letter = m[1].toUpperCase()
        return {
          letter,
          text: m[2],
          correct: isCorrect || letter === correctLetter,
        }
      }).filter(Boolean) as Option[]

      questions.push({ num, text: questionText, type: 'test', options, answer: '' })
    } else {
      // Desarrollo
      const answer = answerLines.join(' ').replace(/^Respuesta:?\s*/i, '').trim()
      questions.push({ num, text: questionText, type: 'desarrollo', options: [], answer })
    }
  }

  return questions
}

function QuestionCard({ q }: { q: Question }) {
  const [open, setOpen] = useState(false)
  const [revealed, setRevealed] = useState(false)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)',
      border: `1px solid ${open ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: 16, marginBottom: 10, overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 1,
          background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, color: '#78350F',
        }}>{q.num}</div>
        <p style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#fff', lineHeight: 1.5, margin: 0 }}>
          {q.text}
        </p>
        <span style={{
          color: 'rgba(255,255,255,0.3)', fontSize: 18, flexShrink: 0,
          transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s',
        }}>›</span>
      </div>

      {/* Body */}
      {open && (
        <div style={{ padding: '0 16px 14px 56px' }}>
          {q.type === 'test' ? (
            q.options.map((opt, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 10, marginBottom: 6,
                background: revealed && opt.correct ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${revealed && opt.correct ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
                fontSize: 13,
                color: revealed && opt.correct ? '#4ADE80' : 'rgba(255,255,255,0.75)',
                fontWeight: revealed && opt.correct ? 600 : 400,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: revealed && opt.correct ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: revealed && opt.correct ? '#4ADE80' : 'rgba(255,255,255,0.6)',
                }}>{opt.letter}</div>
                {opt.text}
                {revealed && opt.correct && <span style={{ marginLeft: 'auto' }}>✓</span>}
              </div>
            ))
          ) : (
            q.answer ? (
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderLeft: '3px solid #FBBF24',
                borderRadius: 8, padding: '10px 12px',
                fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6,
              }}>{q.answer}</div>
            ) : (
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                Respuesta de desarrollo — elabora tu propia respuesta
              </div>
            )
          )}

          {q.type === 'test' && (
            <button
              onClick={() => setRevealed(r => !r)}
              style={{
                marginTop: 8, padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: revealed ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)',
                color: revealed ? '#4ADE80' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${revealed ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.15)'}`,
                cursor: 'pointer',
              }}
            >
              {revealed ? '🙈 Ocultar respuesta' : '👁️ Ver respuesta correcta'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

interface Props { content: string; numPreguntas: number; tipo: string; tokensUsados?: number }

export function ExamViewer({ content, numPreguntas, tipo, tokensUsados }: Props) {
  const questions = parseExam(content)

  if (questions.length === 0) {
    // Fallback
    return (
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 16, padding: 16,
      }}>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#fff', fontSize: 14, lineHeight: 1.7 }}>{content}</pre>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#FCD34D' }}>📋 Preguntas de examen</span>
        <span style={{
          fontSize: 11, color: 'rgba(255,255,255,0.4)',
          background: 'rgba(255,255,255,0.08)', padding: '3px 10px', borderRadius: 20,
        }}>{questions.length} preg. · {tipo}</span>
      </div>

      {questions.map(q => <QuestionCard key={q.num} q={q} />)}

      {tokensUsados !== undefined && (
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'right', marginTop: 8 }}>
          Tokens: {tokensUsados}
        </p>
      )}
    </div>
  )
}
