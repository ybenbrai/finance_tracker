import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../../utils/format'

const COLORS = ['#22d3ee', '#34d399', '#f59e0b', '#f97316', '#ef4444']

export default function BenefitBreakdownPieChart({ data, currency, locale, labels }) {
  const chartData = data.filter((item) => item.value > 0)

  if (!chartData.length) {
    return (
      <div className="h-72 rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
        <h3 className="text-sm font-semibold text-slate-100">{labels.monthlyExpenseBreakdownBenefits}</h3>
        <p className="mt-24 text-center text-sm text-slate-400">{labels.noRecurringBenefitUsage}</p>
      </div>
    )
  }

  return (
    <div className="h-72 rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
      <h3 className="text-sm font-semibold text-slate-100">{labels.monthlyExpenseBreakdownBenefits}</h3>
      <ResponsiveContainer width="100%" height="92%">
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
            {chartData.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(value, currency, locale)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
