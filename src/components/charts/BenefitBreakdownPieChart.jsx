import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../../utils/format'

const COLORS = ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC']

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
      <ResponsiveContainer width="100%" height="78%">
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
            {chartData.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(value, currency, locale)} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-300">
        {chartData.map((entry, index) => (
          <div key={entry.name} className="inline-flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span>{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
