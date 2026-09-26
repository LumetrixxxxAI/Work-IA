import React, { useState, CSSProperties } from 'react'
import { colors } from '../theme/colors'

interface ResultBoxProps {
  content: string
  tokensUsados?: number
  label?: string
}

function renderMarkdown(text: string): string {
  return text
    // Bloques de código
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.3);border-radius:8px;padding:12px;overflow-x:auto;font-size:13px;margin:8px 0;">$1</pre>')
    // Código inline
    .replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.3);border-radius:4px;padding:2px 6px;font-size:13px;">$1</code>')
    // Fórmulas matemáticas en bloque $$...$$
    .replace(/\$\$([\s\S]*?)\$\$/g, '<div style="background:rgba(0,0,0,0.2);border-radius:8px;padding:10px 14px;margin:8px 0;font-style:italic;color:#BAE6FD;font-size:14px;text-align:center;">$1</div>')
    // Fórmulas inline $...$
    .replace(/\$([^$\n]+)\$/g, '<span style="font-style:italic;color:#BAE6FD;">$1</span>')
    // H1
    .replace(/^# (.+)$/gm, '<h1 style="font-size:18px;font-weight:800;color:#fff;margin:16px 0 8px;">$1</h1>')
    // H2
    .replace(/^## (.+)$/gm, '<h2 style="font-size:16px;font-weight:700;color:#7DD3FC;margin:14px 0 6px;">$1</h2>')
    // H3
    .replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:700;color:#BAE6FD;margin:10px 0 4px;">$1</h3>')
    // Negrita + cursiva
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Negrita
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff;font-weight:700;">$1</strong>')
    // Cursiva
    .replace(/\*(.+?)\*/g, '<em style="color:rgba(255,255,255,0.85);">$1</em>')
    // Separador ---
    .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.15);margin:12px 0;"/>')
    // Listas con -
    .replace(/^- (.+)$/gm, '<div style="display:flex;gap:8px;margin:3px 0;"><span style="color:#7DD3FC;flex-shrink:0;">•</span><span>$1</span></div>')
    // Listas numeradas
    .replace(/^(\d+)\. (.+)$/gm, '<div style="display:flex;gap:8px;margin:3px 0;"><span style="color:#7DD3FC;font-weight:700;flex-shrink:0;">$1.</span><span>$2</span></div>')
    // Saltos de línea dobles → párrafo
    .replace(/\n\n/g, '<br/><br/>')
    // Salto de línea simple
    .replace(/\n/g, '<br/>')
}

export function ResultBox({ content, tokensUsados, label = 'Resultado' }: ResultBoxProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
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

  return (
    <div style={boxStyle}>
      <div style={headerStyle}>
        <span style={labelStyle}>{label}</span>
        <button style={copyBtnStyle} onClick={handleCopy}>
          {copied ? '✓ Copiado' : '📋 Copiar'}
        </button>
      </div>
      <div
        style={{ color: colors.white, fontSize: 14, lineHeight: 1.7, wordBreak: 'break-word' }}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
      {tokensUsados !== undefined && (
        <p style={{ marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>
          Tokens: {tokensUsados}
        </p>
      )}
    </div>
  )
}
