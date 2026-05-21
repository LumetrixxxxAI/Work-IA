import React, { useState, CSSProperties } from 'react'
import { colors } from '../theme/colors'

interface ResultBoxProps {
  content: string
  tokensUsados?: number
  label?: string
}

export function ResultBox({ content, tokensUsados, label = 'Resultado' }: ResultBoxProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = content
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const boxStyle: CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: `1px solid ${colors.glassBorder}`,
    borderRadius: 16,
    padding: '16px',
    marginTop: 4,
  }

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  }

  const labelStyle: CSSProperties = {
    fontSize: 11,
    color: colors.blue200,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
  }

  const copyBtnStyle: CSSProperties = {
    fontSize: 12,
    color: copied ? colors.success : colors.blue400,
    fontWeight: 600,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 6,
    backgroundColor: copied ? 'rgba(34,197,94,0.1)' : 'rgba(96,165,250,0.1)',
    transition: 'all 0.15s',
  }

  const contentStyle: CSSProperties = {
    whiteSpace: 'pre-wrap',
    color: colors.white,
    fontSize: 14,
    lineHeight: 1.7,
    fontFamily: 'inherit',
    margin: 0,
    wordBreak: 'break-word',
  }

  return (
    <div style={boxStyle}>
      <div style={headerStyle}>
        <span style={labelStyle}>{label}</span>
        <button style={copyBtnStyle} onClick={handleCopy}>
          {copied ? '✓ Copiado' : '📋 Copiar'}
        </button>
      </div>
      <pre style={contentStyle}>{content}</pre>
      {tokensUsados !== undefined && (
        <p style={{ marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>
          Tokens: {tokensUsados}
        </p>
      )}
    </div>
  )
}
