const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }

export function IconGrid(props) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" {...stroke} />
      <rect x="14" y="3" width="7" height="7" rx="1" {...stroke} />
      <rect x="3" y="14" width="7" height="7" rx="1" {...stroke} />
      <rect x="14" y="14" width="7" height="7" rx="1" {...stroke} />
    </svg>
  )
}

export function IconEye(props) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" {...stroke} />
      <circle cx="12" cy="12" r="2.5" {...stroke} />
    </svg>
  )
}

export function IconBox(props) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden {...props}>
      <path d="M12 3 20 7v10l-8 4-8-4V7l8-4Z" {...stroke} />
      <path d="M12 12 20 7M12 12 4 7M12 12v9" {...stroke} />
    </svg>
  )
}

export function IconCart(props) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden {...props}>
      <path d="M4 7h16l-1.5 11h-13L4 7Z" {...stroke} />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" {...stroke} />
    </svg>
  )
}

export function IconTag(props) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden {...props}>
      <path d="M3 12V5h7l11 11-7 7L3 12Z" {...stroke} />
      <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconMessage(props) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden {...props}>
      <path d="M4 5h16v11H8l-4 4V5Z" {...stroke} />
    </svg>
  )
}

export function IconUsers(props) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden {...props}>
      <circle cx="9" cy="8" r="3" {...stroke} />
      <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" {...stroke} />
      <circle cx="17" cy="9" r="2.5" {...stroke} />
      <path d="M15 20c.3-2.5 2-4 4.5-4" {...stroke} />
    </svg>
  )
}

export function IconSettings(props) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden {...props}>
      <circle cx="12" cy="12" r="3" {...stroke} />
      <path
        d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        {...stroke}
      />
    </svg>
  )
}

export function IconRefresh(props) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden {...props}>
      <path d="M4 12a8 8 0 0 1 13.5-5.7M20 12a8 8 0 0 1-13.5 5.7" {...stroke} />
      <path d="M17 4h2.5V6.5M6.5 20H4v-2.5" {...stroke} />
    </svg>
  )
}
