export default function AdminLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="8" fill="#1a61ab" />
        <text
          x="20"
          y="27"
          textAnchor="middle"
          fill="white"
          fontSize="15"
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.5"
        >
          LVC
        </text>
      </svg>
      <div>
        <div
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--theme-elevation-800)',
            lineHeight: 1.25,
          }}
        >
          La Ville-aux-Clercs
        </div>
        <div
          style={{
            fontSize: '11px',
            color: 'var(--theme-elevation-500)',
            lineHeight: 1.3,
            marginTop: '1px',
          }}
        >
          Espace administration
        </div>
      </div>
    </div>
  )
}
