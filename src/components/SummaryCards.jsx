import { formatCurrency } from '../utils/format'

export default function SummaryCards({
  totalExpenses,
  remaining,
  cumulative,
  currency,
  locale,
  modeLabel,
  labels,
}) {
  const remainingColor = remaining >= 0 ? 'text-teal-300' : 'text-rose-300'

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">{labels.totalExpenses}</p>
        <p className="mt-1 text-xl font-semibold text-slate-100">
          {formatCurrency(totalExpenses, currency, locale)}
        </p>
      </div>
      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">{labels.remaining}</p>
        <p className="mt-1 text-[11px] text-slate-500">{modeLabel}</p>
        <p className={`mt-1 text-xl font-semibold ${remainingColor}`}>
          {formatCurrency(remaining, currency, locale)}
        </p>
      </div>
      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">{labels.cumulativeSavings}</p>
        <p className="mt-1 text-xl font-semibold text-slate-100">
          {formatCurrency(cumulative, currency, locale)}
        </p>
      </div>
    </div>
  )
}
