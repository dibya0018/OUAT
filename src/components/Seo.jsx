import { Helmet } from 'react-helmet-async'
import { SITE } from '../lib/site'

/**
 * Per-page metadata: title, description, canonical, Open Graph / Twitter,
 * optional JSON-LD. `path` should be the route path (e.g. "/shop").
 */
export default function Seo({
  title,
  description,
  path = '/',
  image = '/og-default.jpg',
  type = 'website',
  jsonLd,
  noIndex = false,
}) {
  const fullTitle = title ? `${title} | ${SITE.name}` : `${SITE.name} | ${SITE.longName}`
  const url = `${SITE.url}${path}`
  const imageUrl = image.startsWith('http') ? image : `${SITE.url}${image}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}
