import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { formatCurrency, toNumber } from '../../utils/format'

const COLORS = ['#14b8a6', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#ec4899']

export default function ExpensePieChart({ categories, currency, locale, labels }) {
  const data = Object.entries(categories)
    .map(([name, value]) => ({ name, value: toNumber(value) }))
    .filter((item) => item.value > 0)

  if (data.length === 0) {
    return (
      <div className="h-72 rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
        <h3 className="text-sm font-semibold text-slate-100">Monthly Expense Breakdown</h3>
        <p className="mt-24 text-center text-sm text-slate-400">{labels.noExpenseData}</p>
      </div>
    )
  }

  return (
    <div className="h-72 rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
      <h3 className="text-sm font-semibold text-slate-100">{labels.monthlyExpenseBreakdown}</h3>
      <ResponsiveContainer width="100%" height="92%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(value, currency, locale)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
