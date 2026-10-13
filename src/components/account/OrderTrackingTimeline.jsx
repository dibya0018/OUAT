import { cx, formatPrice } from '../../lib/format'

function formatWhen(iso) {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return null
  }
}

function formatEst(iso) {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(
      new Date(iso),
    )
  } catch {
    return null
  }
}

export default function OrderTrackingTimeline({ order, compact = false }) {
  const { tracking, total, orderNumber, createdAt, items } = order
  const placed = formatWhen(createdAt)
  const est = formatEst(tracking.estDelivery)

  return (
    <article className={cx('border border-line bg-white', compact ? 'p-4' : 'p-5 md:p-6')}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-soft">Order</p>
          <p className="font-display text-lg text-primary">{orderNumber}</p>
          {placed && <p className="mt-1 text-xs text-ink-soft">Placed {placed}</p>}
        </div>
        <p className="font-sans text-lg tabular-nums">{formatPrice(total)}</p>
      </header>

      {items?.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm text-ink-soft">
          {items.map((line) => (
            <li key={`${line.productId}-${line.name}`}>
              {line.name} × {line.qty}
            </li>
          ))}
        </ul>
      )}

      {(order.giftItems?.length > 0 || order.giftNote) && (
        <p className="mt-3 text-sm text-ink-soft">
          Gift wrapped{order.giftNote ? ` with your note: “${order.giftNote}”` : ', no note'}
        </p>
      )}

      <div className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-widest text-ink-soft">
          <span>Track order</span>
          {est && !tracking.cancelled && <span>Est. delivery {est}</span>}
        </div>
        <p className="font-display text-xl text-ink">{tracking.headline}</p>
        <p className="mt-2 text-sm text-ink-soft">{tracking.detail}</p>

        {!tracking.cancelled && (
          <ol className="mt-6 space-y-0 border-l border-line pl-4">
            {tracking.steps.map((step) => (
              <li key={step.key} className="relative pb-6 last:pb-0">
                <span
                  className={cx(
                    'absolute -left-[calc(0.5rem+5px)] top-1 h-2.5 w-2.5 rounded-full border',
                    step.state === 'done' && 'border-primary bg-primary',
                    step.state === 'current' && 'border-primary bg-sand',
                    step.state === 'upcoming' && 'border-line bg-white',
                  )}
                  aria-hidden
                />
                <p
                  className={cx(
                    'text-sm',
                    step.state === 'upcoming' ? 'text-ink-soft' : 'text-ink',
                    step.state === 'current' && 'font-medium',
                  )}
                >
                  {step.label}
                </p>
                {step.at && <p className="text-xs text-ink-soft">{formatWhen(step.at)}</p>}
                {step.state === 'current' && (
                  <p className="text-xs text-primary">In progress…</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </article>
  )
}
