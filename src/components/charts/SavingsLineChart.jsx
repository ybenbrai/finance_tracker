import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '../../utils/format'

export default function SavingsLineChart({ actualRows, forecastRows, currency, locale, labels }) {
  const chartData = [...actualRows, ...forecastRows].map((row) => ({
    month: row.label,
    actualSavings: row.isForecast ? null : row.cumulative,
    forecastSavings: row.cumulative,
  }))

  return (
    <div className="h-80 rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
      <h3 className="text-sm font-semibold text-slate-100">{labels.yearlySavingsTrend}</h3>
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
          <Legend />
          <Line
            type="monotone"
            dataKey="actualSavings"
            name={labels.actual}
            stroke="#7dd3fc"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="forecastSavings"
            name={labels.forecastLegend}
            stroke="#f59e0b"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
