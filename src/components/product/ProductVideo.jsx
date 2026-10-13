/** YouTube / Vimeo page URL -> embeddable player URL; null for anything else. */
function embedUrl(url) {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (u.pathname.startsWith('/embed/')) return `https://www.youtube-nocookie.com${u.pathname}`
      if (u.pathname.startsWith('/shorts/')) return `https://www.youtube-nocookie.com/embed/${u.pathname.split('/')[2]}`
      const id = u.searchParams.get('v')
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
    }
    if (host === 'vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean).pop()
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null
    }
    return null
  } catch {
    return null
  }
}

/** Product video set in the admin editor: an embedded player, a video file, or a plain link. */
export default function ProductVideo({ url, name, className }) {
  const src = String(url ?? '').trim()
  if (!/^https?:\/\//i.test(src)) return null

  const embed = embedUrl(src)
  const isFile = /\.(mp4|webm|ogg)(\?.*)?$/i.test(src)

  return (
    <div className={className}>
      {embed ? (
        <div className="aspect-video w-full bg-sand">
          <iframe
            src={embed}
            title={`${name} video`}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      ) : isFile ? (
        <video src={src} controls preload="metadata" className="aspect-video w-full bg-sand" aria-label={`${name} video`} />
      ) : (
        <a href={src} target="_blank" rel="noreferrer" className="link-underline text-sm text-primary">
          Watch the video
        </a>
      )}
    </div>
  )
}
