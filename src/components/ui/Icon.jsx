/**
 * Minimal 1px-stroke icon set. Intentionally tiny: no icon library needed.
 * All icons are decorative by default (aria-hidden); pass `title` to expose a label.
 */
const paths = {
  cart: (
    <>
      <path d="M4 7h16l-1.5 11h-13L4 7Z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </>
  ),
  menu: (
    <>
      <path d="M3 7h18" />
      <path d="M3 17h18" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4 12h16" />
      <path d="M14 6l6 6-6 6" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M20 12H4" />
      <path d="M10 6l-6 6 6 6" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  check: <path d="M5 12l5 5L20 7" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.75" />
      <circle cx="17.25" cy="6.75" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.85L3.5 20.5l4.3-1.15A8.5 8.5 0 1 0 12 3.5Z" />
      <path d="M9.2 8.6c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5a6.6 6.6 0 0 0 3 2.7c.2.1.4.1.5-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.4.5-.1.8-.6 1.6-1.4 1.8-.8.3-1.7.1-3-.5a10.6 10.6 0 0 1-4.4-4.1c-.6-1.1-.6-2.2.2-3.5Z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  phone: (
    <path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5L16 14l4 1.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="4" />
      <path d="M5 12v8h14v-8" />
      <path d="M12 8v12" />
      <path d="M12 8c-1.5-3-6-3-6-.5S12 8 12 8Zm0 0c1.5-3 6-3 6-.5S12 8 12 8Z" />
    </>
  ),
  bottle: (
    <>
      <path d="M10 2.5h4M10.5 2.5v4.2c0 .8-.4 1.5-1 2-1.2.9-2 2.3-2 3.9V20a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5v-7.4c0-1.6-.8-3-2-3.9-.6-.5-1-1.2-1-2V2.5" />
      <path d="M7.5 14h9" />
    </>
  ),
  mobile: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2" />
      <path d="M11 18.5h2" />
    </>
  ),
  chat: (
    <>
      <path d="M20 11.5c0 3.9-3.6 7-8 7-1.1 0-2.2-.2-3.1-.5L4 19.5l1.4-3.6C4.5 14.7 4 13.2 4 11.5c0-3.9 3.6-7 8-7s8 3.1 8 7Z" />
      <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6" cy="6" r="2.75" />
      <circle cx="6" cy="18" r="2.75" />
      <path d="M8.2 7.7 20 18M8.2 16.3 20 6" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14H5Z" />
      <path d="M5 19c3-4 6-7 10-10" />
    </>
  ),
  upcycle: (
    <>
      <path d="M4 15a8 8 0 0 0 14.5 3" />
      <path d="M20 9A8 8 0 0 0 5.5 6" />
      <path d="M5.5 2.5V6H9M18.5 21.5V18H15" />
      <path d="M12 8v8M9 11l3-3 3 3" />
    </>
  ),
  women: (
    <>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M12 14.5V22M8.5 18.5h7" />
    </>
  ),
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />,
  pin: (
    <>
      <path d="M12 21.5s-6.5-6.2-6.5-11.5a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11.5-6.5 11.5Z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 4v3M12 17v3M4 12h3M17 12h3" />
      <circle cx="12" cy="12" r="3.5" />
    </>
  ),
  package: (
    <>
      <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
      <path d="M3 7.5V16.5L12 21l9-4.5V7.5" />
      <path d="M12 12v9" />
    </>
  ),
}

export default function Icon({ name, size = 20, strokeWidth = 1.25, className, title, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      className={className}
      {...rest}
    >
      {title && <title>{title}</title>}
      {paths[name]}
    </svg>
  )
}
