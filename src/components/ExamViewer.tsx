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

  // Limpiar encabezados típicos de markdown (# título, **Nombre:**, **Fecha:**, ---)
  const cleaned = raw
    .replace(/^#+.+$/gm, '')
    .replace(/^\*\*(Nombre|Fecha|Instrucciones)[^*]*\*\*.*$/gim, '')
    .replace(/^---+$/gm, '')
    .replace(/^\*\*Instrucciones.*$/gim, '')
    .trim()

  // Dividir por número de pregunta (soporta "1.", "1)", "**1.", "**1)")
  const blocks = cleaned
    .split(/(?=^\*{0,2}\d+[.)]\s)/m)
    .map(b => b.trim())
    .filter(b => /^\*{0,2}\d+[.)]\s/.test(b))

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
    if (!lines.length) continue

    // Extraer número y texto de pregunta
    const numMatch = lines[0].match(/^\*{0,2}(\d+)[.)]\s*\*{0,2}(.+?)\*{0,2}$/)
    if (!numMatch) continue
    const num = parseInt(numMatch[1])
    const questionText = numMatch[2].replace(/\*+/g, '').trim()

    // Detectar opciones: A) B) C) D) con o sin guion/asterisco al inicio
    const optionLines = lines.slice(1).filter(l =>
      /^[-*]?\s*[A-Da-d][.)]\s/.test(l)
    )
    const answerLine = lines.slice(1).find(l =>
      /^respuesta:?\s*/i.test(l)
    )

    if (optionLines.length >= 2) {
      // Tipo test
      const options: Option[] = optionLines.map(l => {
        // Quitar guion/asterisco inicial
        const clean = l.replace(/^[-]\s*/, '').replace(/^\*\s*/, '')
        const m = clean.match(/^([A-Da-d])[.)]\s*(.+)/)
        if (!m) return null
        const letter = m[1].toUpperCase()
        const rawText = m[2].trim()
        // La correcta lleva * al final o al inicio
        const correct = rawText.endsWith('*') || l.trimStart().startsWith('*') || rawText.startsWith('*')
        const text = rawText.replace(/\*+/g, '').trim()
        return { letter, text, correct }
      }).filter(Boolean) as Option[]

      questions.push({ num, text: questionText, type: 'test', options, answer: '' })
    } else {
      // Desarrollo
      const answer = answerLine
        ? answerLine.replace(/^respuesta:?\s*/i, '').trim()
        : lines.slice(1).join(' ').trim()
      questions.push({ num, text: questionText, type: 'desarrollo', options: [], answer })
    }
  }

  return questions
}

const OPTION_COLORS = ['#60A5FA', '#A78BFA', '#34D399', '#FB923C']

function QuestionCard({ q, index }: { q: Question; index: number }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const answered = selected !== null || revealed

  const getOptionStyle = (opt: Option) => {
    if (!answered) return {
      bg: 'rgba(255,255,255,0.05)',
      border: 'rgba(255,255,255,0.1)',
      color: 'rgba(255,255,255,0.85)',
    }
    if (opt.correct) return {
      bg: 'rgba(34,197,94,0.15)',
      border: 'rgba(34,197,94,0.5)',
      color: '#4ADE80',
    }
    if (selected === opt.letter && !opt.correct) return {
      bg: 'rgba(239,68,68,0.12)',
      border: 'rgba(239,68,68,0.4)',
      color: '#F87171',
    }
    return {
      bg: 'rgba(255,255,255,0.03)',
      border: 'rgba(255,255,255,0.06)',
      color: 'rgba(255,255,255,0.4)',
    }
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 18,
      marginBottom: 14,
      overflow: 'hidden',
    }}>
      {/* Número + pregunta */}
      <div style={{ padding: '16px 16px 12px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          background: `linear-gradient(135deg, ${OPTION_COLORS[index % 4]}, ${OPTION_COLORS[(index + 1) % 4]})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, color: '#fff',
        }}>{q.num}</div>
        <p style={{
          flex: 1, fontSize: 14, fontWeight: 600, color: '#fff',
          lineHeight: 1.55, margin: 0,
        }}>{q.text}</p>
      </div>

      {/* Opciones tipo test */}
      {q.type === 'test' && (
        <div style={{ padding: '0 14px 14px' }}>
          {q.options.map((opt) => {
            const s = getOptionStyle(opt)
            return (
              <div
                key={opt.letter}
                onClick={() => { if (!answered) setSelected(opt.letter) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 12, marginBottom: 6,
                  background: s.bg, border: `1.5px solid ${s.border}`,
                  cursor: answered ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                  background: answered && opt.correct
                    ? 'rgba(34,197,94,0.3)'
                    : answered && selected === opt.letter && !opt.correct
                      ? 'rgba(239,68,68,0.2)'
                      : 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: s.color,
                }}>{opt.letter}</div>
                <span style={{ fontSize: 13, color: s.color, flex: 1, lineHeight: 1.4 }}>
                  {opt.text}
                </span>
                {answered && opt.correct && (
                  <span style={{ fontSize: 16 }}>✅</span>
                )}
                {answered && selected === opt.letter && !opt.correct && (
                  <span style={{ fontSize: 16 }}>❌</span>
                )}
              </div>
            )
          })}

          {/* Botones */}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {!answered && (
              <button
                onClick={() => setRevealed(true)}
                style={{
                  flex: 1, padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >👁️ Ver respuesta</button>
            )}
            {answered && (
              <button
                onClick={() => { setSelected(null); setRevealed(false) }}
                style={{
                  flex: 1, padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >🔄 Reintentar</button>
            )}
          </div>
        </div>
      )}

      {/* Respuesta desarrollo */}
      {q.type === 'desarrollo' && (
        <div style={{ padding: '0 14px 14px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderLeft: '3px solid #60A5FA',
            borderRadius: '0 10px 10px 0',
            padding: '10px 14px',
          }}>
            {q.answer ? (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, margin: 0 }}>
                {q.answer}
              </p>
            ) : (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', margin: 0 }}>
                Elabora tu propia respuesta
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface Props { content: string; numPreguntas: number; tipo: string; tokensUsados?: number }

export function ExamViewer({ content, numPreguntas, tipo, tokensUsados }: Props) {
  const questions = parseExam(content)
  const [score, setScore] = useState<number | null>(null)

  const tipoLabel: Record<string, string> = {
    test: '🔵 Tipo test',
    desarrollo: '📝 Desarrollo',
    mixto: '🔀 Mixto',
  }

  if (questions.length === 0) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16, padding: 16,
      }}>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#fff', fontSize: 13, lineHeight: 1.7, fontFamily: 'inherit' }}>
          {content}
        </pre>
      </div>
    )
  }

  const testQuestions = questions.filter(q => q.type === 'test')

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
        border: '1px solid rgba(245,158,11,0.3)',
        borderRadius: 14, padding: '14px 16px', marginBottom: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#FCD34D', margin: '0 0 2px' }}>
            📋 {questions.length} preguntas
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            {tipoLabel[tipo] ?? tipo}
            {testQuestions.length > 0 && ' · Pulsa una opción para responder'}
          </p>
        </div>
        {testQuestions.length > 0 && (
          <div style={{
            background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 10, padding: '6px 12px', textAlign: 'center',
          }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: '0 0 1px' }}>Preguntas</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#FBBF24', margin: 0 }}>
              {questions.length}
            </p>
          </div>
        )}
      </div>

      {/* Preguntas */}
      {questions.map((q, i) => (
        <QuestionCard key={q.num} q={q} index={i} />
      ))}
    </div>
  )
}
