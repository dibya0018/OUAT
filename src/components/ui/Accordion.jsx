import { useId, useState } from 'react'
import Icon from './Icon'
import { cx } from '../../lib/format'

/**
 * Accessible accordion. `items` = [{ title, content }].
 * One panel open at a time; the first opens by default unless `defaultOpen` is null.
 */
export default function Accordion({ items, defaultOpen = 0, className }) {
  const [open, setOpen] = useState(defaultOpen)
  const baseId = useId()

  return (
    <div className={cx('divide-y divide-line border-y border-line', className)}>
      {items.map((item, i) => {
        const isOpen = open === i
        const buttonId = `${baseId}-button-${i}`
        const panelId = `${baseId}-panel-${i}`
        return (
          <div key={item.title}>
            <h3 className="font-sans text-base font-normal text-ink">
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between py-4 text-left"
              >
                <span>{item.title}</span>
                <Icon
                  name="chevronDown"
                  size={18}
                  className={cx(
                    'shrink-0 text-primary transition-transform duration-200',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="pb-6 text-sm text-ink-soft"
            >
              {typeof item.content === 'string' ? <p>{item.content}</p> : item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
