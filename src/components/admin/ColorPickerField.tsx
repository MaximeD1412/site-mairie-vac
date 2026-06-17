'use client'

import { useRef } from 'react'
import { useField, FieldLabel } from '@payloadcms/ui'

const COLORS = [
  { label: 'Rouge', hex: '#B91C1C' },
  { label: 'Rose vif', hex: '#E11D48' },
  { label: 'Rose', hex: '#BE185D' },
  { label: 'Fuchsia', hex: '#A21CAF' },
  { label: 'Orange', hex: '#C2410C' },
  { label: 'Marron', hex: '#92400E' },
  { label: 'Jaune', hex: '#A16207' },
  { label: 'Citron', hex: '#65A30D' },
  { label: 'Vert', hex: '#15803D' },
  { label: 'Émeraude', hex: '#047857' },
  { label: 'Menthe', hex: '#0F766E' },
  { label: 'Cyan', hex: '#0E7490' },
  { label: 'Ciel', hex: '#0369A1' },
  { label: 'Bleu', hex: '#1D4ED8' },
  { label: 'Indigo', hex: '#4338CA' },
  { label: 'Violet', hex: '#6D28D9' },
  { label: 'Pourpre', hex: '#7E22CE' },
  { label: 'Ardoise', hex: '#334155' },
  { label: 'Gris', hex: '#374151' },
]

type Props = {
  path: string
  field: { label?: string | Record<string, string> }
  required?: boolean
}

export function ColorPickerField({ path, field, required }: Props) {
  const { value, setValue, showError } = useField<string>({ path })
  const inputRef = useRef<HTMLInputElement>(null)

  const isCustom = !!value && !COLORS.some(c => c.hex.toLowerCase() === value.toLowerCase())

  return (
    <div style={{ marginBottom: '24px' }}>
      <FieldLabel
        htmlFor={path}
        label={(field?.label as string) ?? 'Couleur'}
        required={required}
      />
      <div
        role="group"
        aria-label="Palette de couleurs"
        style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}
      >
        {COLORS.map(({ label, hex }) => (
          <button
            key={hex}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={value === hex}
            onClick={() => setValue(hex)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: hex,
              border: value === hex ? '3px solid #000' : '2px solid transparent',
              outline: value === hex ? '2px solid #fff' : 'none',
              outlineOffset: value === hex ? '-5px' : undefined,
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
            }}
          />
        ))}

        <button
          type="button"
          title={isCustom ? `Couleur personnalisée : ${value}` : 'Choisir une couleur personnalisée'}
          aria-label={isCustom ? `Couleur personnalisée ${value}` : 'Choisir une couleur personnalisée'}
          aria-pressed={isCustom}
          onClick={() => inputRef.current?.click()}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: isCustom ? value! : 'transparent',
            border: isCustom ? '3px solid #000' : '2px dashed var(--theme-elevation-300)',
            outline: isCustom ? '2px solid #fff' : 'none',
            outlineOffset: isCustom ? '-5px' : undefined,
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--theme-elevation-400)',
            fontSize: '18px',
            lineHeight: 1,
          }}
        >
          {!isCustom && '+'}
        </button>

        <input
          ref={inputRef}
          type="color"
          value={value ?? '#000000'}
          onChange={e => setValue(e.target.value)}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {value && (
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              borderRadius: '3px',
              backgroundColor: value,
              border: '1px solid rgba(0,0,0,0.15)',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: '12px', color: 'var(--theme-elevation-500)' }}>{COLORS.find(c => c.hex.toLowerCase() === value.toLowerCase())?.label || 'Couleur personnalisée'}</span>
          <code style={{ fontSize: '12px', color: 'var(--theme-elevation-500)' }}>{value}</code>
        </div>
      )}

      {showError && (
        <p style={{ color: 'var(--theme-error-500)', fontSize: '12px', marginTop: '4px', margin: '4px 0 0' }}>
          Veuillez sélectionner une couleur.
        </p>
      )}
    </div>
  )
}
