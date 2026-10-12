import Icon from '../ui/Icon'
import { SITE } from '../../lib/site'

/**
 * Small sticky WhatsApp enquiry button. Renders nothing when
 * VITE_WHATSAPP_NUMBER is not configured.
 */
export default function WhatsAppButton() {
  if (!SITE.whatsappNumber) return null

  const text = encodeURIComponent('Hello O.U.A.T., I have a question about your pieces.')
  const href = `https://wa.me/${SITE.whatsappNumber}?text=${text}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Enquire on WhatsApp"
      className="fixed right-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary bg-white text-primary transition-colors duration-200 hover:bg-primary hover:text-cream md:right-6 bottom-[max(1rem,env(safe-area-inset-bottom,0px))] md:bottom-[max(1.5rem,env(safe-area-inset-bottom,0px))]"
    >
      <Icon name="whatsapp" size={20} />
    </a>
  )
}
