import { IconRefresh } from './AdminIcons'

export default function AdminPageHeader({ title, children, onRefresh, refreshing }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <h1 className="font-display text-3xl text-admin-text md:text-4xl">{title}</h1>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {onRefresh && (
          <button type="button" className="admin-btn-ghost" onClick={onRefresh} disabled={refreshing}>
            <IconRefresh className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        )}
      </div>
    </div>
  )
}
