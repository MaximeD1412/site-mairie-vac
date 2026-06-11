'use client'
import React from 'react'
import { useFormFields } from '@payloadcms/ui'

type Props = {
  newPath: string
  editBasePath: string
}

export default function AgentsBanner({ newPath, editBasePath }: Props) {
  const slug = useFormFields(([fields]) => fields['slug']?.value as string | undefined)

  const href = slug ? `${editBasePath}/${slug}/modifier` : newPath

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        marginBottom: '24px',
        borderRadius: '8px',
        border: '1px solid #b8d4f5',
        background: '#edf4ff',
        color: '#1a3a5c',
        fontSize: '14px',
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0, color: '#1a61ab' }}
      >
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 9v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="6.5" r="0.75" fill="currentColor" />
      </svg>
      <span>
        La création et l'édition du contenu se font dans l'{' '}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#1a61ab', fontWeight: 600, textDecoration: 'underline' }}
        >
          Espace agents
        </a>
        .
      </span>
    </div>
  )
}
