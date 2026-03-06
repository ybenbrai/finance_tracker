import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '../../utils/format'

export default function BenefitTrendLineChart({ rows, currency, locale, labels }) {
  const chartData = rows.map((row) => ({
    month: row.label,
    totalBenefitsBalance: row.totalBenefitsBalance,
  }))

  if (!chartData.length) {
    return (
      <div className="h-80 rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
        <h3 className="text-sm font-semibold text-slate-100">{labels.yearlySavingsTrendBenefits}</h3>
        <p className="mt-28 text-center text-sm text-slate-400">{labels.noBenefitTrend}</p>
      </div>
    )
  }

  return (
    <div className="h-80 rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
      <h3 className="text-sm font-semibold text-slate-100">{labels.yearlySavingsTrendBenefits}</h3>
      <ResponsiveContainer width="100%" height="92%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="4 4" stroke="#334155" />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis
            stroke="#94a3b8"
            tickFormatter={(value) => formatCurrency(value, currency, locale)}
            width={95}
          />
          <Tooltip formatter={(value) => formatCurrency(value, currency, locale)} />
          <Line
            type="monotone"
            dataKey="totalBenefitsBalance"
            name={labels.benefitsBalance}
            stroke="#22d3ee"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
