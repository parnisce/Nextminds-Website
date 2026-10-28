export const ArrowRight = ({ width = 18, height = width, ...props }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const ArrowLeft = ({ width = 18, height = width, ...props }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
)

export const Play = ({ width = 14, height = width, ...props }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M8 5.5v13a.6.6 0 0 0 .9.5l10.2-6.5a.6.6 0 0 0 0-1L8.9 5a.6.6 0 0 0-.9.5z" />
  </svg>
)

export const Menu = ({ width = 18, height = width, ...props }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
    <path d="M6 8h12M6 12h12M6 16h12" />
  </svg>
)

export const Close = ({ width = 18, height = width, ...props }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const Logo = (props) => (
  <svg viewBox="0 0 40 32" fill="none" {...props}>
    <defs>
      <linearGradient id="nm-logo" x1="0" y1="0" x2="40" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#7cc4ff" />
        <stop offset="1" stopColor="#1f6dff" />
      </linearGradient>
    </defs>
    <path d="M3 30V2h6.5L25 21.5V2h6.5v28H25L9.5 10.5V30z" fill="url(#nm-logo)" />
    <path d="M9.5 2L25 21.5V30L9.5 10.5z" fill="#bfe3ff" opacity=".35" />
  </svg>
)
