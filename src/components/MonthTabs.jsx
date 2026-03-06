import { CopyIcon, PlusIcon, TrashIcon } from './Icons'

export default function MonthTabs({
  months,
  activeMonthId,
  onSelectMonth,
  onAddMonth,
  onDuplicateMonth,
  onDeleteMonth,
  labels,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-700/70 bg-slate-900/70 p-3">
      {months.map((month) => {
        const isActive = month.id === activeMonthId
        return (
          <div
            key={month.id}
            className={`flex items-center gap-1 rounded-xl px-2 py-1 text-sm transition ${
              isActive
                ? 'bg-indigo-500 text-slate-50'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <button onClick={() => onSelectMonth(month.id)} className="px-1 py-1">
              {month.label}
            </button>
            {months.length > 1 ? (
              <button
                onClick={() => onDeleteMonth(month.id)}
                className={`rounded px-1 leading-none ${
                  isActive
                    ? 'text-slate-900 hover:bg-slate-900/20'
                    : 'text-slate-400 hover:bg-slate-700'
                }`}
                aria-label={`Delete ${month.label}`}
                title={`Delete ${month.label}`}
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        )
      })}
      <button
        onClick={onAddMonth}
        className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/60 px-3 py-2 text-sm text-indigo-200 hover:bg-indigo-500/15"
      >
        <PlusIcon className="h-4 w-4" /> {labels.addMonth}
      </button>
      <button
        onClick={onDuplicateMonth}
        className="inline-flex items-center gap-2 rounded-xl border border-amber-400/60 px-3 py-2 text-sm text-amber-300 hover:bg-amber-500/10"
      >
        <CopyIcon className="h-4 w-4" /> {labels.duplicateMonth}
      </button>
    </div>
  )
}
