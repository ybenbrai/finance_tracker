import { toNumber } from './format'
import { addMonths, monthLabelFromId } from './date'

function weightedAverage(values) {
  if (values.length === 0) {
    return 0
  }

  const weightedTotal = values.reduce(
    (sum, value, index) => sum + toNumber(value) * (index + 1),
    0,
  )
  const weightSum = (values.length * (values.length + 1)) / 2
  return weightedTotal / weightSum
}

export function forecastSeriesValue(values, stepAhead) {
  if (values.length === 0) {
    return 0
  }

  if (values.length === 1) {
    return Math.max(0, toNumber(values[0]))
  }

  const base = weightedAverage(values)
  const recent = toNumber(values[values.length - 1])
  const previous = toNumber(values[values.length - 2])
  const trend = recent - previous

  return Math.max(0, base + trend * 0.35 * stepAhead)
}

export function generateForecastMonths({ months, categories, horizon, locale = 'en-US' }) {
  if (!months.length || horizon <= 0) {
    return []
  }

  const lastMonth = months[months.length - 1]
  const incomeHistory = months.map((month) => toNumber(month.income) + toNumber(month.extraIncome))

  return Array.from({ length: horizon }, (_, index) => {
    const stepAhead = index + 1
    const id = addMonths(lastMonth.id, stepAhead)
    const income = forecastSeriesValue(incomeHistory, stepAhead)

    const categoryEstimates = categories.reduce((acc, category) => {
      const values = months.map((month) => toNumber(month.categories[category]))
      acc[category] = forecastSeriesValue(values, stepAhead)
      return acc
    }, {})

    const totalExpenses = Object.values(categoryEstimates).reduce(
      (sum, value) => sum + toNumber(value),
      0,
    )

    return {
      id,
      label: monthLabelFromId(id, locale),
      income,
      extraIncome: 0,
      categories: categoryEstimates,
      totalExpenses,
      remaining: income - totalExpenses,
      isForecast: true,
    }
  })
}
