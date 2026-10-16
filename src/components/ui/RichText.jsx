import { cx } from '../../lib/format'

/**
 * Plain catalogue text → paragraphs and bullet lists.
 * Lines starting with "•" (or "- ") group into a list; every other line is its own paragraph.
 */
export default function RichText({ text, className }) {
  if (!text) return null
  const blocks = []
  for (const raw of String(text).split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const bullet = line.match(/^(?:•|-\s)\s*(.*)$/)
    if (bullet) {
      const last = blocks[blocks.length - 1]
      if (last?.type === 'list') last.items.push(bullet[1])
      else blocks.push({ type: 'list', items: [bullet[1]] })
    } else {
      blocks.push({ type: 'p', text: line })
    }
  }

  return (
    <div className={cx('flex flex-col gap-3', className)}>
      {blocks.map((b, i) =>
        b.type === 'list' ? (
          <ul key={i} className="flex list-disc flex-col gap-1.5 pl-5 marker:text-primary">
            {b.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{b.text}</p>
        ),
      )}
    </div>
  )
}
